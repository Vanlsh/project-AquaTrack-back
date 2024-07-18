import {
  registerUser,
  confirmRegisterUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  updateUserDetails,
  getCurrentUser,
  resendVerificationEmail,
  getUserCountt,
} from '../services/users.js';
import createHttpError from 'http-errors';
import mail from '../mail/mail.js';

// export const register = async (req, res, next) => {
//   const newUser = await registerUser(req.body);
//   const { email } = newUser;
//   await mail.sendMail(email, token);
//   res.status(201).json({
//     user: {
//       email,
//     },
//   });
// };

export const register = async (req, res, next) => {
  const newUser = await registerUser(req.body);
  const { email } = newUser;
  res.status(201).json({
    user: {
      email,
    },
    message: 'Verification email sent',
  });
};

export const confirmRegister = async (req, res, next) => {
  const newUser = await confirmRegisterUser(req.body);
  const { email, password } = req.body;
  const { user, tokens } = await loginUser(email, password);
  const token = tokens.accessToken;
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
  const user = await getCurrentUser(req.user.id);
  res.json(user);
};

export const updateUser = async (req, res, next) => {
  const updatedUser = await updateUserDetails(req.user.id, req.body);
  res.json(updatedUser);
};

export const resendVerifyEmail = async (req, res, next) => {
  await resendVerificationEmail(req.body.email);
  res.json({ message: 'Verification email sent' });
};

export const uploadAvatar = async (req, res, next) => {
  if (!req.file) {
    throw createHttp1(400, 'File not provided');
  }
  const photo = req.file;
  const url = await saveFileToCloudinary(photo);
  res.json({ photo: url });
};

export const refreshTokens = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return new createHttpError(401, 'Not authorized');
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
  const count = await getUserCountt();
  res.status(200).json({ count });
};
