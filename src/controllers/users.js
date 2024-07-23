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
import queryString from 'query-string';
import { generateTokens } from '../utils/generateTokens.js';
import User from '../db/models/user.js';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

export const googleAuth = async (req, res, next) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri:
      'https://project-aquatrack-back.onrender.com/users/google-redirect',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`,
  );
};

export const googleRedirect = async (req, res, next) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);
  const code = urlParams.code;

  const tokenDataResponse = await fetch(`https://oauth2.googleapis.com/token`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:
        'https://project-aquatrack-back.onrender.com/users/google-redirect',
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (tokenDataResponse.status !== 200) {
    throw createHttpError(500, 'Internal Server Error');
  }

  const tokenData = await tokenDataResponse.json();

  const userDataResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      method: 'get',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    },
  );

  if (userDataResponse.status !== 200) {
    throw createHttpError(500, 'Internal Server Error');
  }
  const userData = await userDataResponse.json();

  let user = await User.findOne({ email: userData.email });
  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

    const verificationToken = crypto.randomUUID();
    user = await User.create({
      name: userData.name ? userData.name : 'User',
      email: userData.email,
      password: passwordHash,
      verificationToken: verificationToken,
      photo: userData.picture ? userData.picture : null,
      oauth: true,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await User.findByIdAndUpdate(user._id, { token: accessToken });

  const updatedUser = {
    email: user.email,
    name: user.name,
    weight: user.weight,
    dailyActiveTime: user.dailyActiveTime,
    dailyWaterConsumption: user.dailyWaterConsumption,
    gender: user.gender,
    photo: user.photo,
  };

  const stringifiedParams = queryString.stringify({
    token: JSON.stringify(accessToken),
    user: JSON.stringify(updatedUser),
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  return res.redirect(`${process.env.APP_DOMAIN}/?${stringifiedParams}`);
};

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
