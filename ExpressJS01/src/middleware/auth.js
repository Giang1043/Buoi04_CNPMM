require('dotenv').config();
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const white_lists = ['/register', '/login', '/forgot-password/send-otp', '/forgot-password/verify-otp', '/forgot-password/reset'];
  if (white_lists.find(item => req.path === item)) {
    next();
  } else {
    if (req.headers?.authorization?.split(' ')?.[1]) {
      const token = req.headers.authorization.split(' ')[1];
      // verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          email: decoded.email,
          name: decoded.name,
          createdBy: 'Cao Cự Giang'
        }
        console.log(">>> check token: ", decoded)
        next();
      } catch (error) {
        return res.status(401).json({
          message: "Token bị hết hạn/hoặc không hợp lệ"
        })
      }
    } else {
      return res.status(401).json({
        message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn"
      })
    }
  }
}

module.exports = auth;
