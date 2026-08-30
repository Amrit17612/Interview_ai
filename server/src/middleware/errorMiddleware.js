const errorHandler = (err, req, res, _next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.code === 11000) {
    console.error('MongoDB duplicate key error:', err.message);
    statusCode = 400; // Duplicate keys are generally bad requests / conflicts
    message = 'Unable to process this checkout right now. Please try again.';
  }

  // Create an error response object avoiding leaking sensitive information
  const errorResponse = {
    message: message,
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
