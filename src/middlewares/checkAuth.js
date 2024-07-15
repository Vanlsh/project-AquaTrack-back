import jwt from 'jsonwebtoken';
import User from '../db/models/user.js';
import createHttpError from 'http-errors';

export const checkAuth = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) throw createHttpError(401, 'Not authorized');

    const [bearer, token] = authorizationHeader.split(' ', 2);

    if (bearer !== 'Bearer') throw createHttpError(401, 'Not authorized');

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next(createHttpError(401, 'Not authorized'));
      }
      try {
        const user = await User.findById(decoded.id);

        if (!user || user.token !== token) {
          return next(createHttpError(401, 'Not authorized'));
        }

        req.user = {
          id: decoded.id,
          email: user.email,
          name: user.name,
          weight: user.weight,
          dailyActiveTime: user.dailyActiveTime,
          dailyWaterConsumption: user.dailyWaterConsumption,
          gender: user.gender,
          photo: user.photo,
        };

        next();
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
