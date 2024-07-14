import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  updateUserDetails,
  getCurrentUser,
  verifyUserEmail,
  resendVerificationEmail,
  uploadUserAvatar,
  getUserCountt,
} from '../services/users.js';
import HttpError from '../helpers/HttpError.js';

export const register = async (req, res, next) => {
  const newUser = await registerUser(req.body);
  const { email, subscription } = newUser;
  res.status(201).json({
    user: {
      email,
      subscription,
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
      subscription: user.subscription,
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
  res.status(200).json(user);
};

export const updateUser = async (req, res, next) => {
  const updatedUser = await updateUserDetails(req.user.id, req.body);
  res.status(200).json(updatedUser);
};

export const verifyEmail = async (req, res, next) => {
  await verifyUserEmail(req.params.verificationToken);
  res.status(200).json({ message: 'Verification successful' });
};

export const resendVerifyEmail = async (req, res, next) => {
  await resendVerificationEmail(req.body.email);
  res.status(200).json({ message: 'Verification email sent' });
};

export const uploadAvatar = async (req, res, next) => {
  if (!req.file) {
    throw HttpError(400, 'File not provided');
  }
  const updatedUser = await uploadUserAvatar(req.user.id, req.file);
  res.status(200).json(updatedUser);
};

export const refreshTokens = async (req, res, next) => {
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
  const count = await getUserCountt();
  res.status(200).json({ count });
};
