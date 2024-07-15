import createHttpError from 'http-errors';

const validateBody = (schema) => {
  const func = (req, _, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(createHttpError(400, error.message));
    }
    next();
  };

  return func;
};

export default validateBody;
