import React, { useState } from 'react';
import { Col, Row, Card, Steps } from 'antd';
import ForgotPasswordEmail from './forgotPassword1Email';
import ForgotPasswordOTP from './forgotPassword2OTP';
import ForgotPasswordReset from './forgotPassword3Reset';

const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const steps = [
    {
      title: 'Email',
      description: 'Nhập email'
    },
    {
      title: 'OTP',
      description: 'Xác minh OTP'
    },
    {
      title: 'Mật khẩu',
      description: 'Đặt lại mật khẩu'
    }
  ];

  const handleNext = (step) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: '30px', marginBottom: '30px' }}>
      <Col xs={24} md={16} lg={8}>
        <Card
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          <Steps
            current={currentStep - 1}
            items={steps}
            style={{ marginBottom: '30px' }}
          />

          {currentStep === 1 && (
            <ForgotPasswordEmail
              onNext={handleNext}
              setEmail={setEmail}
            />
          )}

          {currentStep === 2 && (
            <ForgotPasswordOTP
              email={email}
              onNext={handleNext}
              onBack={handleBack}
              setResetToken={setResetToken}
            />
          )}

          {currentStep === 3 && (
            <ForgotPasswordReset
              email={email}
              resetToken={resetToken}
              onBack={handleBack}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;
