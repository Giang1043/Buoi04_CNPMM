import React, { useState, useEffect } from 'react';
import { Button, Col, Input, notification, Row, Space, Card } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from '../util/axios.customize';

const ForgotPasswordOTP = ({ email, onNext, onBack, setResetToken: setParentResetToken }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remaining, setRemaining] = useState(3);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateOTP = (value) => {
    return /^\d{6}$/.test(value);
  };

  const handleVerifyOTP = async () => {
    setOtpError('');

    if (!otp.trim()) {
      setOtpError('Mã OTP là bắt buộc');
      return;
    }

    if (!validateOTP(otp)) {
      setOtpError('Mã OTP phải là 6 chữ số');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/v1/api/forgot-password/verify-otp', {
        email,
        otp: otp.trim()
      });

      if (res && res.EC === 0) {
        notification.success({
          message: "Xác minh OTP thành công",
          description: res.EM || "OTP đã được xác minh"
        });
        setParentResetToken(res.resetToken);
        onNext(3);
      } else {
        if (res?.remaining !== undefined) {
          setRemaining(res.remaining);
        }
        notification.error({
          message: "Xác minh OTP thất bại",
          description: res?.EM || "Vui lòng thử lại"
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xác minh OTP"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/v1/api/forgot-password/send-otp', { email });

      if (res && res.EC === 0) {
        notification.success({
          message: "Gửi OTP lại thành công",
          description: "Mã OTP mới đã được gửi"
        });
        setOtp('');
        setRemaining(3);
        setResendCooldown(60);
      } else {
        notification.error({
          message: "Gửi OTP lại thất bại",
          description: res?.EM || "Vui lòng thử lại"
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        <LockOutlined /> Nhập Mã OTP
      </h3>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Chúng tôi đã gửi mã OTP đến <strong>{email}</strong>
      </p>

      <Card style={{ marginBottom: '20px', backgroundColor: '#f0f5ff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Lần thử còn lại: <strong style={{ color: remaining <= 1 ? '#ff4d4f' : '#faad14' }}>{remaining}</strong>
          </div>
          {remaining <= 1 && (
            <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
              Cảnh báo: Bạn sẽ không thể thử lại sau này
            </div>
          )}
        </div>
      </Card>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã OTP (6 chữ số)</label>
        <Input
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.slice(0, 6));
            setOtpError('');
          }}
          onPressEnter={handleVerifyOTP}
          status={otpError ? 'error' : ''}
          disabled={loading}
          size="large"
          maxLength="6"
        />
        {otpError && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '5px' }}>
            {otpError}
          </div>
        )}
      </div>

      <Button
        type="primary"
        block
        size="large"
        onClick={handleVerifyOTP}
        loading={loading}
        style={{ marginBottom: '10px' }}
      >
        Xác Minh OTP
      </Button>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <Button
          type="link"
          onClick={handleResendOTP}
          disabled={resendCooldown > 0 || loading}
        >
          {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button
          type="link"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeftOutlined /> Quay lại
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;
