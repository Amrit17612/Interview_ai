const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Create an error response object avoiding leaking sensitive information
  const errorResponse = {
    message: err.message,
    // Only send stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  res.status(statusCode).json(errorResponse);
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
