import React, { useState } from 'react';
import { Button, Col, Input, notification, Row, Space, Spin } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from '../util/axios.customize';

const ForgotPasswordEmail = ({ onNext, setEmail: setParentEmail }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email là bắt buộc');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/v1/api/forgot-password/send-otp', { email });

      if (res && res.EC === 0) {
        notification.success({
          message: "Gửi OTP thành công",
          description: res.EM || "Mã OTP đã được gửi đến email của bạn"
        });
        setParentEmail(email);
        onNext(2);
      } else {
        notification.error({
          message: "Gửi OTP thất bại",
          description: res?.EM || "Vui lòng thử lại"
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi gửi OTP"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        <MailOutlined /> Nhập Email của Bạn
      </h3>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Chúng tôi sẽ gửi mã OTP để xác minh email của bạn
      </p>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
        <Input
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          onPressEnter={handleSubmit}
          status={emailError ? 'error' : ''}
          disabled={loading}
          size="large"
        />
        {emailError && (
          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '5px' }}>
            {emailError}
          </div>
        )}
      </div>

      <Button
        type="primary"
        block
        size="large"
        onClick={handleSubmit}
        loading={loading}
        style={{ marginBottom: '10px' }}
      >
        Gửi Mã OTP
      </Button>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/login">
          <ArrowLeftOutlined /> Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordEmail;
