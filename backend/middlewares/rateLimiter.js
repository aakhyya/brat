const rateLimit = require('express-rate-limit');

// General API rate limiter: general control
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes; time window is in ms, requests reset after this window
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true, //modern, standardized rate-limit headers
  legacyHeaders: false, //disables old, deprecated headers
});

// Strict limiter for auth routes: brute force protection
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes', //429: too many requests
  },
  skipSuccessfulRequests: true, // Don't count successful requests, only failed ones
});
