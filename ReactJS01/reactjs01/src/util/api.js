import axios from './axios.customize';

const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = {
    name, email, password
  }

  return axios.post(URL_API, data)
}

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    email, password
  }

  return axios.post(URL_API, data)
}

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API)
}

// Forgot Password APIs
const sendOTPApi = (email) => {
  const URL_API = "/v1/api/forgot-password/send-otp";
  return axios.post(URL_API, { email })
}

const verifyOTPApi = (email, otp) => {
  const URL_API = "/v1/api/forgot-password/verify-otp";
  return axios.post(URL_API, { email, otp })
}

const resetPasswordApi = (email, newPassword, resetToken) => {
  const URL_API = "/v1/api/forgot-password/reset";
  return axios.post(URL_API, { email, newPassword, resetToken })
}

export {
  createUserApi,
  loginApi,
  getUserApi,
  sendOTPApi,
  verifyOTPApi,
  resetPasswordApi
}
