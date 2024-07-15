import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  updateUserDetails,
  getCurrentUser,
  verifyUserEmail,
  resendVerificationEmail,
  getUserCountt,
} from '../services/users.js';
import HttpError from '../helpers/HttpError.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

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
    secure: true,
    sameSite: 'Strict',
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  const {
    emaill,
    name,
    weight,
    dailyActiveTime,
    dailyWaterConsumption,
    gender,
    photo,
    _id,
  } = user;

  res.status(200).json({
    token: tokens.accessToken,
    user: {
      id: _id,
      emaill,
      name,
      weight,
      dailyActiveTime,
      dailyWaterConsumption,
      gender,
      photo,
    },
  });

};

export const logout = async (req, res, next) => {
  await logoutUser(req.user.id);
  res.clearCookie('refreshToken');
  res.status(204).end();
};

export const currentUser = async (req, res, next) => {
  const user = await getCurrentUser(req.user.id);
  res.json(user);
};

export const updateUser = async (req, res, next) => {
  const updatedUser = await updateUserDetails(req.user.id, req.body);
  res.json(updatedUser);
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
    throw HttpError(400, 'File not provided');
  }
  const photo = req.file;
  const url = await saveFileToCloudinary(photo);
  res.json({ photo: url });
};

export const refreshTokens = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    console.log('error');
  }
  const tokens = await refreshUserSession(req.cookies.refreshToken);
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  res.status(200).json({ token: tokens.accessToken });
};

export const getUserCount = async (req, res, next) => {
  const count = await getUserCountt();
  res.status(200).json({ count });
};
