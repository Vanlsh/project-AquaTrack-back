import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
  const payload = { id: user._id };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '5d',
  });

  return { accessToken, refreshToken };
};
