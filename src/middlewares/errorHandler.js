import { HttpError } from 'http-errors';

export const errorHandler = (error, req, res, __) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      status: error.status,
      message: error.name,
      data: error.errors ? { message: error.errors[0].message } : error,
    });
    return;
  }
  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: error.message,
  });
};
