import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  updateUserDetails,
  getCurrentUser,
  verifyUserEmail,
  resendVerificationEmail,
  getUserCountService,
  uploadAvatarService,
} from '../services/users.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import createHttpError from 'http-errors';

export const register = async (req, res, next) => {
  const newUser = await registerUser(req.body);
  const { email } = newUser;
  res.status(201).json({
    user: {
      email,
    },
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { user, tokens } = await loginUser(email, password);
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  res.status(200).json({
    token: tokens.accessToken,
    user: {
      email: user.email,
      name: user.name,
      weight: user.weight,
      dailyActiveTime: user.dailyActiveTime,
      dailyWaterConsumption: user.dailyWaterConsumption,
      gender: user.gender,
      photo: user.photo,
    },
  });
};

export const logout = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  res.clearCookie('refreshToken', { sameSite: 'none', secure: true });
  await logoutUser(refreshToken);
  res.status(204).send();
};

export const currentUser = async (req, res, next) => {
  const {
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
    email,
  } = await getCurrentUser(req.user.id);

  res.json({
    email,
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
  });
};

export const updateUser = async (req, res, next) => {
  const {
    email,
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
  } = await updateUserDetails(req.user.id, req.body);
  res.json({
    email,
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
  });
};

export const verifyEmail = async (req, res, next) => {
  await verifyUserEmail(req.params.verificationToken);
  res.json({ message: 'Verification successful' });
};

export const resendVerifyEmail = async (req, res, next) => {
  await resendVerificationEmail(req.body.email);
  res.json({ message: 'Verification email sent' });
};

export const uploadAvatar = async (req, res, next) => {
  if (!req.file) {
    throw createHttpError(400, 'File not provided');
  }
  const photo = req.file;
  const url = await saveFileToCloudinary(photo);
  const data = await uploadAvatarService(req.user.id, url);
  res.json(data);
};

export const refreshTokens = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken && refreshToken === 'undefined') {
    throw createHttpError(401, 'Not authorized');
  }
  const tokens = await refreshUserSession(refreshToken);
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  res.status(200).json({ token: tokens.accessToken });
};

export const getUserCount = async (req, res, next) => {
  const count = await getUserCountService();
  res.status(200).json({ count });
};
