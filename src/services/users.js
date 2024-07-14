import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import User from '../db/modules/user.js';
import Jimp from 'jimp';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import mail from '../mail/mail.js';
// import HttpError from '../helpers/HttpError.js';
import { registerUserSchema, loginUserSchema } from '../db/modules/user.js';
import { generateTokens } from '../utils/generateTokens.js';
import createHttpError from 'http-errors';

export const registerUser = async (data) => {
  const { error } = registerUserSchema.validate(data, { abortEarly: false });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    throw createHttpError(400, errorMessage);
  }

  const { email, password } = data;
  const existedUser = await User.findOne({ email });
  if (existedUser) throw createHttpError(409, 'Email in use');

  const hashPassword = await bcrypt.hash(password, 10);
  const generatedAvatar = gravatar.url(email);
  const verificationToken = crypto.randomUUID();

  return await User.create({
    email,
    password: hashPassword,
    avatarURL: `http:${generatedAvatar}`,
    verificationToken,
  });
};

export const loginUser = async (email, password) => {
  const { error } = loginUserSchema.validate(
    { email, password },
    { abortEarly: false },
  );
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    throw createHttpError(400, errorMessage);
  }

  const existedUser = await User.findOne({ email });
  if (!existedUser) throw createHttpError(401, 'Email or password is wrong');

  const isMatch = await bcrypt.compare(password, existedUser.password);
  if (!isMatch) throw createHttpError(401, 'Email or password is wrong');

  const tokens = generateTokens(existedUser);

  await User.findByIdAndUpdate(existedUser._id, { token: tokens.accessToken });

  return { user: existedUser, tokens };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { token: null });
};

export const getCurrentUser = async (userId) => {
  return await User.findById(
    userId,
    'email name weight dailyActiveTime dailyWaterConsumption gender photo',
  );
};

export const updateUserDetails = async (userId, data) => {
  const updatedData = Object.keys(data).reduce((acc, key) => {
    if (data[key] !== undefined) {
      acc[key] = data[key];
    }
    return acc;
  }, {});

  const result = await User.findByIdAndUpdate(userId, updatedData, {
    new: true,
    select: 'name weight dailyActiveTime dailyWaterConsumption gender photo',
  });

  if (!result) {
    throw new createHttpError(404, 'User not found');
  }

  return result;
};

export const verifyUserEmail = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });
  if (!user) throw createHttpError(404, 'User not found');

  await User.findOneAndUpdate(
    { _id: user._id },
    { verify: true, verificationToken: null },
  );
};

export const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (user.verify)
    throw createHttpErrorcreateHttpError(
      400,
      'Verification has already been passed',
    );

  await mail.sendMail(email, user.verificationToken);
};

export const uploadUserAvatar = async (userId, file) => {
  const { path: tempPath, filename } = file;
  const tempFilePath = path.resolve(tempPath);
  const outputDir = path.resolve('temp/avatars');
  const outputFilePath = path.join(outputDir, filename);

  const image = await Jimp.read(tempFilePath);
  await image.resize(250, 250).writeAsync(tempFilePath);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.rename(tempFilePath, outputFilePath);
  const photo = `/avatars/${filename}`;
  const updatedData = {
    ...(photo && { photo }),
  };

  const result = await User.findByIdAndUpdate(userId, updatedData, {
    new: true,
    select: 'photo',
  });

  return result;
};

export const refreshUserSession = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, 'Refresh token is required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw createHttpError(401, 'User not found');

  const tokens = generateTokens(user);

  await User.findByIdAndUpdate(user._id, { token: tokens.accessToken });

  return tokens;
};

export const getUserCountt = async () => {
  return await User.countDocuments();
};
