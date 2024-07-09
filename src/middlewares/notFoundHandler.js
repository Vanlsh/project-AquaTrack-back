export const notFoundHandler = (_, res, __) => {
  res.status(404).json({
    message: 'Route not found',
  });
};
