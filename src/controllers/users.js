import HttpError from '../helpers/HttpError.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import User from '../db/modules/user.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import Jimp from 'jimp';
import mail from '../mail/mail.js'
import { registerUserSchema, loginUserSchema } from '../db/modules/user.js';

export const register = async (req, res, next) => {
  const { error } = registerUserSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return next(HttpError(400, errorMessage));
  }
  try {
    const { email, password } = req.body;
    const existedUser = await User.findOne({ email });
    if (existedUser) throw HttpError(409, 'Email in use');

    const hashPassword = await bcrypt.hash(password, 10);
    const generatedAvatar = gravatar.url(email);
    const verificationToken = crypto.randomUUID();

    const newUser = await User.create({
      email,
      password: hashPassword,
      avatarURL: `http:${generatedAvatar}`,
      verificationToken,
    });

    const { subscription } = newUser;

    // await mail.sendMail(email, verificationToken);

    res.status(201).json({
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { error } = loginUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return next(HttpError(400, errorMessage));
  }
  try {
    const { email, password } = req.body;
    const existedUser = await User.findOne({ email });
    if (!existedUser) throw HttpError(401, 'Email or password is wrong');

    const isMatch = await bcrypt.compare(password, existedUser.password);
    if (!isMatch) throw HttpError(401, 'Email or password is wrong');

    if (!existedUser.verify) {
      return res.status(401).json({ message: 'Please verify your email' });
    }

    const token = jwt.sign({ id: existedUser._id }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    await User.findByIdAndUpdate(existedUser._id, { token });

    res.status(200).json({
      token,
      user: {
        email: existedUser.email,
        subscription: existedUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      email: req.user.email,
      name: req.user.name,
      weight: req.user.weight,
      dailyActiveTime: req.user.dailyActiveTime,
      dailyWaterConsumption: req.user.dailyWaterConsumption,
      gender: req.user.gender,
      photo: req.user.photo,
    });
  } catch (error) {
    next(error);
  }
}; 

export const updateUser = async (req, res, next) => {
  try {
    const {
      email,
      name,
      weight,
      dailyActiveTime,
      dailyWaterConsumption,
      gender,
      photo,
    } = req.body;
    const { id } = req.user;

    const updatedData = {
      ...(email && { email }),
      ...(name && { name }),
      ...(weight && { weight }),
      ...(dailyActiveTime && { dailyActiveTime }),
      ...(dailyWaterConsumption && { dailyWaterConsumption }),
      ...(gender && { gender }),
      ...(photo && { photo }),
    };

    const result = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!result) throw new HttpError(404, 'User not found');

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    console.log(user);
    console.log(verificationToken);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findOneAndUpdate(
      { _id: user._id },
      { verify: true, verificationToken: null },
    );

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
};

export const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user.verify)
      throw HttpError(400, 'Verification has already been passed');

    console.log(user);

    await mail.sendMail(email, user.verificationToken);

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpError(400, 'File not provided');
    }

    const { path: tempPath, filename } = req.file;
    const tempFilePath = path.resolve(tempPath);
    const outputDir = path.resolve('temp/avatars');
    const outputFilePath = path.join(outputDir, filename);

    const image = await Jimp.read(tempFilePath);
    await image.resize(250, 250).writeAsync(tempFilePath);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.rename(tempFilePath, outputFilePath);

    const avatarURL = `/avatars/${filename}`;
    const result = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL },
      { new: true },
    );

    res.status(200).json({ avatarURL: result.avatarURL });
  } catch (error) {
    next(error);
  }
};

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '5d' });

  return { accessToken, refreshToken };
};

export const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw HttpError(401, 'Refresh token is required');
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return next(HttpError(401, 'Invalid refresh token'));
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(HttpError(401, 'User not found'));
      }

      const tokens = generateTokens(user);

      await User.findByIdAndUpdate(user._id, { token: tokens.accessToken });

      res.status(200).json(tokens);
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};
