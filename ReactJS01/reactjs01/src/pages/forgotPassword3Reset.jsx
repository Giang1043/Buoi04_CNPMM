import React, { useState } from 'react';
import { Button, Input, notification, Progress, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../util/axios.customize';

const ForgotPasswordReset = ({ email, resetToken, onBack }) => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    Object.values(criteria).forEach(met => {
      if (met) strength++;
    });

    setPasswordStrength(strength);
    return criteria;
  };

  const validatePassword = () => {
    setPasswordError('');

    if (!newPassword) {
      setPasswordError('Mật khẩu mới là bắt buộc');
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    const criteria = checkPasswordStrength(newPassword);
    if (!criteria.uppercase || !criteria.lowercase) {
      setPasswordError('Mật khẩu phải chứa chữ in hoa và chữ thường');
      return false;
    }
    if (!criteria.number) {
      setPasswordError('Mật khẩu phải chứa số');
      return false;
    }
    if (!criteria.special) {
      setPasswordError('Mật khẩu phải chứa ký tự đặc biệt (!@#$%^&*)');
      return false;
    }

    return true;
  };

  const validateConfirmPassword = () => {
    setConfirmError('');

    if (!confirmPassword) {
      setConfirmError('Xác nhận mật khẩu là bắt buộc');
      return false;
    }

    if (confirmPassword !== newPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword() || !validateConfirmPassword()) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/v1/api/forgot-password/reset', {
        email,
        newPassword,
        resetToken
      });

      if (res && res.EC === 0) {
        notification.success({
          message: "Đặt lại mật khẩu thành công",
          description: res.EM || "Mật khẩu của bạn đã được cập nhật"
        });
        setResetSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        notification.error({
          message: "Đặt lại mật khẩu thất bại",
          description: res?.EM || "Vui lòng thử lại"
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi đặt lại mật khẩu"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ff4d4f';
    if (passwordStrength <= 2) return '#faad14';
    if (passwordStrength <= 3) return '#faad14';
    if (passwordStrength <= 4) return '#52c41a';
    return '#52c41a';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Rất yếu';
    if (passwordStrength <= 2) return 'Yếu';
    if (passwordStrength <= 3) return 'Trung bình';
    if (passwordStrength <= 4) return 'Mạnh';
    return 'Rất mạnh';
  };

  if (resetSuccess) {
    return (
      <div style={{ padding: '20px' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Đặt lại mật khẩu thành công"
          subTitle="Bạn sẽ được chuyển hướng đến trang đăng nhập"
          style={{ marginTop: '50px' }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        <LockOutlined /> Đặt Lại Mật Khẩu
      </h3>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Nhập mật khẩu mới của bạn
      </p>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu mới</label>
        <Input.Password
          placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
          value={newPassword}
          onChange={(e) => {
            const value = e.target.value;
            setNewPassword(value);
            setPasswordError('');
            if (value) {
              checkPasswordStrength(value);
            } else {
              setPasswordStrength(0);
            }
          }}
          status={passwordError ? 'error' : ''}
          disabled={loading}
          size="large"
        />
        {passwordError && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '5px' }}>
            {passwordError}
          </div>
        )}
      </div>

      {passwordStrength > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '5px' }}>
            <small>Độ mạnh: <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span></small>
          </div>
          <Progress percent={passwordStrength * 20} strokeColor={getStrengthColor()} showInfo={false} />
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Xác nhận mật khẩu</label>
        <Input.Password
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError('');
          }}
          onPressEnter={handleResetPassword}
          status={confirmError ? 'error' : ''}
          disabled={loading}
          size="large"
        />
        {confirmError && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '5px' }}>
            {confirmError}
          </div>
        )}
      </div>

      <Button
        type="primary"
        block
        size="large"
        onClick={handleResetPassword}
        loading={loading}
        style={{ marginBottom: '10px' }}
      >
        Đặt Lại Mật Khẩu
      </Button>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button
          type="link"
          onClick={onBack}
          disabled={loading}
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordReset;
