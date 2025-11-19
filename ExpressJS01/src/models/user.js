const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: String,
  role: String,
  
  // OTP fields for forgot password
  resetOTP: String,
  resetOTPExpires: Date,
  otpAttempts: {
    type: Number,
    default: 0
  },
  
  // Reset token fields
  resetToken: String,
  resetTokenExpires: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;

