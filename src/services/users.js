import bcrypt from 'bcrypt';
import crypto, { verify } from 'crypto';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import User from '../db/models/user.js';
import mail from '../mail/mail.js';
import { generateTokens } from '../utils/generateTokens.js';
import createHttpError from 'http-errors';

export const registerUser = async (data) => {
  const { email } = data;
  const existedUser = await User.findOne({ email });
  if (existedUser) throw createHttpError(409, 'Email in use');


  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const token = generateVerificationCode();
  await mail.sendMail(email, token);

  return await User.create({
    email,
    verify: false,
    verifyEmail: token,
  });

};

export const confirmRegisterUser = async (data) => {
  const { email, password, verifyEmail } = data;
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found');
  if (user.verifyEmail !== verifyEmail)
    throw createHttpError(409, 'Wrong code');

  const hashPassword = await bcrypt.hash(password, 10);
  const generatedAvatar = gravatar.url(email);

  return await User.findByIdAndUpdate(
    user._id,
    {
      password: hashPassword,
      avatarURL: `http:${generatedAvatar}`,
      verify: true,
      verifyEmail: null,
    },
    { new: true },
  ); 
};


export const loginUser = async (email, password) => {
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
    throw createHttpError(404, 'User not found');
  }

  return result;
};


export const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (user.verify) {
    throw createHttpError(400, 'Verification has already been passed');
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const token = generateVerificationCode();
  await mail.sendMail(email, token);

  return await user.findByIdAndUpdate(
    user._id,
    {
      verify: false,
      verifyEmail: token,
    },
    { new: true },
  ); 
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
