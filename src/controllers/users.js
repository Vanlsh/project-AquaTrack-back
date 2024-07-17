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
} from '../services/users.js';
import {saveFileToCloudinary} from "../utils/saveFileToCloudinary.js"
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
      id: user._id,
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
  await logoutUser(req.user.id);
  res.clearCookie('refreshToken');
  res.status(204).end();
};

export const currentUser = async (req, res, next) => {
  const {
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
  } = await getCurrentUser(req.user.id);
  res.json({
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
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
  } = await updateUserDetails(req.user.id, req.body);
  res.json({
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
  res.json({ photo: url });
};

export const refreshTokens = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken && refreshToken === 'undefined') {
    throw createHttpError(401, 'Not authorized');
  }
  const tokens = await refreshUserSession(req.cookies.refreshToken);
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
