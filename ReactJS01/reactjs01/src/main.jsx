import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import RegisterPage from './pages/register.jsx'; 
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ForgotPasswordPage from './pages/forgotPassword.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "user",
        element: <UserPage />
      },
    ]
  },
  {
    path: "register",
    element: <RegisterPage /> // Tên component đã được fix (RegisterPage)
  },
  {
    path: "login",
    element: <LoginPage />
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </StrictMode>,
)