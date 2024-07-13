import jwt from 'jsonwebtoken';
import User from '../db/modules/user.js';
import HttpError from '../helpers/HttpError.js';

export const checkAuth = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) throw HttpError(401, 'Not authorized');

    const [bearer, token] = authorizationHeader.split(' ', 2);

    if (bearer !== 'Bearer') throw HttpError(401, 'Not authorized');

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next(HttpError(401, 'Not authorized'));
      }
      try {
        const user = await User.findById(decoded.id);

        if (!user || user.token !== token) {
          return next(HttpError(401, 'Not authorized'));
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
