const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerRecruiter,
  login,
  sendOTP,
  verifyOTPLogin,
  verifyOTPRegister,
  getMe,
  updateStudentProfile,
  googleAuth
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, otpSendLimiter, otpVerifyLimiter } = require('../middleware/security');

// User Registration
router.post('/register/student', registerStudent);
router.post('/register/recruiter', registerRecruiter);

// Protected Authentication Endpoints
router.post('/login', loginLimiter, login);
router.post('/google', loginLimiter, googleAuth);

// OTP Multi-channel Authentication with Rate-Limiting Protection
router.post('/send-otp', otpSendLimiter, sendOTP);
router.post('/verify-otp-login', otpVerifyLimiter, verifyOTPLogin);
router.post('/verify-otp-register', otpVerifyLimiter, verifyOTPRegister);

// Authenticated User Profile Endpoints
router.get('/me', protect, getMe);
router.put('/student-profile', protect, updateStudentProfile);

module.exports = router;
