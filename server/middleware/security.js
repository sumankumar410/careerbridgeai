const rateLimit = require('express-rate-limit');

// 1. General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please slow down and try again after 15 minutes.'
  }
});

// 2. Sensitive Authentication Limiter (Login attempts)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please wait 15 minutes before trying again.'
  }
});

// 3. OTP Send Limiter (Strictly protects Twilio SMS Gateway against SMS Bombing & financial abuse)
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // Max 6 OTP requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP dispatch requests for this IP. Please wait 15 minutes before requesting another code.'
  }
});

// 4. OTP Verification Limiter (Prevents 6-digit brute-forcing)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 12, // Max 12 verification attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many incorrect verification attempts. Please wait 15 minutes or request a new code.'
  }
});

// 5. Utility: Escape regex special characters to prevent ReDoS (Regular Expression Denial of Service)
const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
  apiLimiter,
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  escapeRegex
};
