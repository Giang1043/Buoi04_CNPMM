const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { sendOTP, verifyOTP, resetPassword } = require('../controllers/forgotPasswordController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

routerAPI.use(auth); 

routerAPI.get('/', (req, res) => {
  return res.status(200).json("Hello world api")
})

routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

routerAPI.get('/user', getUser);
routerAPI.get('/account', delay, getAccount);

// Forgot Password Routes (no auth required - handled separately)
routerAPI.post('/forgot-password/send-otp', sendOTP);
routerAPI.post('/forgot-password/verify-otp', verifyOTP);
routerAPI.post('/forgot-password/reset', resetPassword);

module.exports = routerAPI; //export default

