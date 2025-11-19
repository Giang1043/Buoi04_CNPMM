import React, { useState } from 'react';
import { Button, Col, Divider, Form, Input, notification, Row, Progress } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const validatePassword = (password) => {
    const criteria = checkPasswordStrength(password);
    if (!criteria.length) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự'));
    }
    if (!criteria.uppercase || !criteria.lowercase) {
      return Promise.reject(new Error('Mật khẩu phải chứa chữ in hoa và chữ thường'));
    }
    if (!criteria.number) {
      return Promise.reject(new Error('Mật khẩu phải chứa số'));
    }
    if (!criteria.special) {
      return Promise.reject(new Error('Mật khẩu phải chứa ký tự đặc biệt (!@#$%^&*)'));
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { name, email, password } = values;

      const res = await createUserApi(name, email, password);

      if (res && res.EC === 0) {
        notification.success({
          message: "Đăng ký thành công",
          description: res.EM || "Tài khoản đã được tạo"
        });
        form.resetFields();
        setPasswordStrength(0);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        notification.error({
          message: "Đăng ký thất bại",
          description: res?.EM || "Vui lòng thử lại"
        })
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra"
      })
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <Row justify={"center"} style={{ marginTop: "30px" }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{
          padding: "15px",
          margin: "5px",
          border: "1px solid #ccc",
          borderRadius: "5px"
        }}>
          <legend>Đăng Ký Tài Khoản</legend>
          <Form
            form={form}
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email là bắt buộc',
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ',
                }
              ]}
            >
              <Input placeholder="Nhập email của bạn" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Mật khẩu là bắt buộc',
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    return validatePassword(value);
                  }
                }
              ]}
            >
              <Input.Password 
                placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                onChange={(e) => {
                  if (e.target.value) {
                    checkPasswordStrength(e.target.value);
                  } else {
                    setPasswordStrength(0);
                  }
                }}
              />
            </Form.Item>

            {passwordStrength > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <small>Độ mạnh: <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span></small>
                </div>
                <Progress percent={passwordStrength * 20} strokeColor={getStrengthColor()} showInfo={false} />
              </div>
            )}

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng xác nhận mật khẩu',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Họ và tên là bắt buộc',
                },
                {
                  min: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự',
                }
              ]}
            >
              <Input placeholder="Nhập họ và tên của bạn" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                block
              >
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>
          <Link to={"/"}><ArrowLeftOutlined /> Quay lại trang chủ</Link>
          <Divider />
          <div style={{ textAlign: "center" }}>
            Đã có tài khoản? <Link to={"/login"}>Đăng nhập tại đây</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  )
}

export default RegisterPage;
