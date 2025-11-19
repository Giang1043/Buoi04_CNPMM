require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const saltRounds = 10;

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate Reset Token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send OTP to email
const sendOTPService = async (email) => {
  try {
    if (!email) {
      return {
        EC: 1,
        EM: "Email là bắt buộc"
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        EC: 1,
        EM: "Email không hợp lệ"
      };
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại trong hệ thống"
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    user.resetOTP = otp;
    user.resetOTPExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();

    // Send email
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu',
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã OTP sẽ hết hạn sau 5 phút</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`>>> OTP sent to ${email}`);

    return {
      EC: 0,
      EM: "Mã OTP đã được gửi đến email của bạn",
      email: email
    };

  } catch (error) {
    console.log(">>> sendOTPService error: ", error);
    return {
      EC: 2,
      EM: "Lỗi server khi gửi OTP"
    };
  }
};

// Verify OTP
const verifyOTPService = async (email, otp) => {
  try {
    if (!email || !otp) {
      return {
        EC: 1,
        EM: "Email và OTP là bắt buộc"
      };
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại"
      };
    }

    // Check OTP exists and not expired
    if (!user.resetOTP || !user.resetOTPExpires) {
      return {
        EC: 1,
        EM: "Vui lòng yêu cầu OTP mới"
      };
    }

    if (new Date() > user.resetOTPExpires) {
      user.resetOTP = null;
      user.resetOTPExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return {
        EC: 1,
        EM: "OTP đã hết hạn, vui lòng yêu cầu OTP mới"
      };
    }

    // Check attempts
    if (user.otpAttempts >= 3) {
      user.resetOTP = null;
      user.resetOTPExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return {
        EC: 1,
        EM: "Quá nhiều lần nhập sai, vui lòng yêu cầu OTP mới"
      };
    }

    // Verify OTP
    if (user.resetOTP !== otp.trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      const remaining = 3 - user.otpAttempts;
      return {
        EC: 1,
        EM: `OTP không chính xác. Còn ${remaining} lần thử`,
        remaining: remaining
      };
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    user.otpAttempts = 0;
    await user.save();

    return {
      EC: 0,
      EM: "OTP xác thực thành công",
      resetToken: resetToken
    };

  } catch (error) {
    console.log(">>> verifyOTPService error: ", error);
    return {
      EC: 2,
      EM: "Lỗi server khi xác thực OTP"
    };
  }
};

// Reset Password
const resetPasswordService = async (email, newPassword, resetToken) => {
  try {
    if (!email || !newPassword || !resetToken) {
      return {
        EC: 1,
        EM: "Email, mật khẩu mới, và token là bắt buộc"
      };
    }

    // Validate password strength (min 8 chars)
    if (newPassword.length < 8) {
      return {
        EC: 1,
        EM: "Mật khẩu phải có ít nhất 8 ký tự"
      };
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại"
      };
    }

    // Check reset token exists and valid
    if (!user.resetToken || user.resetToken !== resetToken.trim()) {
      return {
        EC: 1,
        EM: "Token không hợp lệ"
      };
    }

    // Check token not expired
    if (new Date() > user.resetTokenExpires) {
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();
      return {
        EC: 1,
        EM: "Token đã hết hạn, vui lòng yêu cầu lại"
      };
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user
    user.password = hashPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    user.otpAttempts = 0;
    user.updatedAt = new Date();
    await user.save();

    return {
      EC: 0,
      EM: "Mật khẩu đã được đặt lại thành công"
    };

  } catch (error) {
    console.log(">>> resetPasswordService error: ", error);
    return {
      EC: 2,
      EM: "Lỗi server khi đặt lại mật khẩu"
    };
  }
};

module.exports = {
  sendOTPService,
  verifyOTPService,
  resetPasswordService
};
