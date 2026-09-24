const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'mobile'],
    default: 'email'
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['login', 'register'],
    default: 'login'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-expire after 10 minutes (TTL index)
  }
});

module.exports = mongoose.model('OTP', otpSchema);
