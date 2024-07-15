import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import User from '../db/models/user.js';
import mail from '../mail/mail.js';
import { generateTokens } from '../utils/generateTokens.js';
import createHttpError from 'http-errors';

export const registerUser = async (data) => {
  const { email, password } = data;
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    next(createHttpError(409, 'Email in use'));
    return;
  }

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
  const existedUser = await User.findOne({ email });
  if (!existedUser) {
    next(createHttpError(401, 'Email or password is wrong'));
    return;
  }

  const isMatch = await bcrypt.compare(password, existedUser.password);
  if (!isMatch) {
    next(createHttpError(401, 'Email or password is wrong'));
    return;
  }

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
    'name weight dailyActiveTime dailyWaterConsumption gender photo',
  );
};

export const updateUserDetails = async (userId, data) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    {
      new: true,
      fields: 'name weight dailyActiveTime dailyWaterConsumption gender photo',
    },
  );

  if (!result) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  return result;
};

export const verifyUserEmail = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });
  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  await User.findOneAndUpdate(
    { _id: user._id },
    { verify: true, verificationToken: null },
  );
};

export const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (user.verify) {
    next(createHttpError(400, 'Verification has already been passed'));
    return;
  }

  await mail.sendMail(email, user.verificationToken);
};

export const refreshUserSession = async (refreshToken) => {
  if (!refreshToken) {
    next(createHttpError(401, 'Refresh token is required'));
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    next(createHttpError(401, 'Invalid refresh token'));
    return;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    next(createHttpError(401, 'User not found'));
    return;
  }

  const tokens = generateTokens(user);

  await User.findByIdAndUpdate(user._id, { token: tokens.accessToken });

  return tokens;
};

export const getUserCountService = async () => {
  return await User.countDocuments();
};
