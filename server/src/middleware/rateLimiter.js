const rateLimit = require('express-rate-limit');

// Custom handler to return clean JSON without exposing stack traces or internals
const customHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    message: options.message
  });
};

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests. Please try again later.',
  handler: customHandler
});

/**
 * Strict Gemini Endpoint Rate Limiter
 * 5 requests per 15 minutes per IP
 * Protects expensive report generation routes to prevent quota exhaustion
 */
const geminiStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // strictly limit to 5 report attempts per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many report generation attempts. Please try again later.',
  handler: customHandler
});

/**
 * Authentication Rate Limiter
 * 10 requests per 15 minutes per IP
 * Protects brute-force vulnerable endpoints (login, register, password reset)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again later.',
  handler: customHandler
});

module.exports = {
  globalLimiter,
  geminiStrictLimiter,
  authLimiter
};
