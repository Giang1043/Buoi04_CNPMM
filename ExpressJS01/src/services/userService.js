require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const createUserService = async (name, email, password) => {
  try {
    // Validate input
    if (!email || !password || !name) {
      return {
        EC: 1,
        EM: "Email, password, name là bắt buộc"
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

    // Validate password strength (min 8 chars)
    if (password.length < 8) {
      return {
        EC: 1,
        EM: "Mật khẩu phải có ít nhất 8 ký tự"
      };
    }

    // check user exist
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      return {
        EC: 1,
        EM: "Email đã được đăng ký, vui lòng chọn email khác"
      };
    }

    // hash user password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    
    // save user to database
    let result = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword,
      role: 'User'
    })

    return {
      EC: 0,
      EM: "Đăng ký tài khoản thành công",
      user: {
        email: result.email,
        name: result.name
      }
    };

  } catch (error) {
    console.log(">>> createUserService error: ", error);
    return {
      EC: 2,
      EM: "Lỗi server khi tạo tài khoản"
    };
  }
}

const loginService = async (email1, password) => {
  try {
    // fetch user by email
    const user = await User.findOne({ email: email1 });
    if (user) {
      // compare password
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: "Email/Password không hợp lệ"
        }
      } else {
        // create an access token
        const payload = {
          email: user.email,
          name: user.name
        }

        const access_token = jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE
          }
        )

        return {
          EC: 0,
          access_token,
          user: {
            email: user.email,
            name: user.name
          }
        }
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ"
      }
    }

  } catch (error) {
    console.log(error);
    return null;
  }
}

const getUserService = async () => {
  try {
    let result = await User.find({}).select("-password");
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  createUserService,
  loginService,
  getUserService
}