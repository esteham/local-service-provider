/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import useLiveValidation from '../../hooks/useLiveValidation';
import ValidationMessage from '../common/ValidationMessage';
import { showFormSuccessToast, showErrorToast } from '../../utils/confirmationToast';
import OTPVerification from './OTPVerification';

const UserRegistrationForm = ({ onClose, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Live validation hooks
  const usernameValidation = useLiveValidation('users', 'username');
  const emailValidation = useLiveValidation('users', 'email');
  const phoneValidation = useLiveValidation('users', 'phone');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Trigger live validation for specific fields
    if (name === 'username') {
      usernameValidation.validate(value);
    } else if (name === 'email') {
      emailValidation.validate(value);
    } else if (name === 'phone') {
      phoneValidation.validate(value);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check basic form validation
    if (!validateForm()) {
      return;
    }

    // Check live validation results
    if (usernameValidation.exists) {
      showErrorToast('Username is already taken. Please choose a different username.');
      return;
    }

    if (emailValidation.exists) {
      showErrorToast('Email is already registered. Please use a different email.');
      return;
    }

    if (phoneValidation.exists) {
      showErrorToast('Phone number is already registered. Please use a different phone number.');
      return;
    }

    // Check if validation is still in progress
    if (usernameValidation.isChecking || emailValidation.isChecking || phoneValidation.isChecking) {
      showErrorToast('Please wait for validation to complete.');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          submitData.append(key, formData[key]);
        }
      });

      // Add image if selected
      if (image) {
        submitData.append('image', image);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/backend/api/auth/user_register.php`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        if (response.data.requires_otp) {
          // Show OTP verification modal
          setRegisteredUser(response.data.data);
          setShowOTPModal(true);
          showFormSuccessToast('Registration successful! Please check your email for OTP verification.');
        } else {
          // Direct success (shouldn't happen with new flow)
          showFormSuccessToast('user', 'register');
          // Reset validation states
          usernameValidation.reset();
          emailValidation.reset();
          phoneValidation.reset();
          onClose();
        }
      } else {
        showErrorToast(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showErrorToast('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = (userData) => {
    // Reset validation states
    usernameValidation.reset();
    emailValidation.reset();
    phoneValidation.reset();
    
    // Show success message based on user role
    if (userData.role === 'user') {
      showFormSuccessToast('Email verified successfully! Your account is now active.');
    } else {
      showFormSuccessToast('Email verified successfully! Your account is pending admin approval.');
    }
    
    // Close both modals
    setShowOTPModal(false);
    onClose();
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    setRegisteredUser(null);
  };

  return (
    <div className="user-registration-form">
      <div className="d-flex align-items-center mb-3">
        <Button variant="link" onClick={onBack} className="p-0 me-2">
          <FaArrowLeft />
        </Button>
        <h5 className="mb-0">User Registration</h5>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Username *</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username || usernameValidation.isValid === false}
                isValid={usernameValidation.isValid === true}
                placeholder="Enter username"
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
              <ValidationMessage 
                isChecking={usernameValidation.isChecking}
                isValid={usernameValidation.isValid}
                message={usernameValidation.message}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email || emailValidation.isValid === false}
                isValid={emailValidation.isValid === true}
                placeholder="Enter email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
              <ValidationMessage 
                isChecking={emailValidation.isChecking}
                isValid={emailValidation.isValid}
                message={emailValidation.message}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                isInvalid={!!errors.first_name}
                placeholder="Enter first name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.first_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                isInvalid={!!errors.last_name}
                placeholder="Enter last name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.last_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number *</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            isInvalid={!!errors.phone || phoneValidation.isValid === false}
            isValid={phoneValidation.isValid === true}
            placeholder="Enter phone number"
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
          <ValidationMessage 
            isChecking={phoneValidation.isChecking}
            isValid={phoneValidation.isValid}
            message={phoneValidation.message}
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Enter password"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ zIndex: 10 }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password *</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                  placeholder="Confirm password"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ zIndex: 10 }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Profile Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </div>
      </Form>

      {/* OTP Verification Modal */}
      <OTPVerification
        show={showOTPModal}
        onHide={handleOTPModalClose}
        userData={registeredUser}
        onVerificationSuccess={handleOTPVerificationSuccess}
      />
    </div>
  );
};

export default UserRegistrationForm;
