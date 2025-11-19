const {
  sendOTPService,
  verifyOTPService,
  resetPasswordService
} = require('../services/forgotPasswordService');

const sendOTP = async (req, res) => {
  const { email } = req.body;
  const data = await sendOTPService(email);
  return res.status(200).json(data);
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const data = await verifyOTPService(email, otp);
  return res.status(200).json(data);
};

const resetPassword = async (req, res) => {
  const { email, newPassword, resetToken } = req.body;
  const data = await resetPasswordService(email, newPassword, resetToken);
  return res.status(200).json(data);
};

module.exports = {
  sendOTP,
  verifyOTP,
  resetPassword
};
