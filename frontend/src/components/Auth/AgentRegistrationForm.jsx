/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner, ProgressBar, Card } from 'react-bootstrap';
import { FaArrowLeft, FaUserTie, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { showFormSuccessToast, showErrorToast } from '../../utils/confirmationToast';
import { toast } from 'react-toastify';
import useLiveValidation from '../../hooks/useLiveValidation';
import ValidationMessage from '../common/ValidationMessage';
import OTPVerification from './OTPVerification';
import axios from 'axios';
import "../../assets/css/AgentRegister.css";

const AgentRegistrationForm = ({ onClose, onBack }) => {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    zone_id: '',
    area_id: '',
    role: 'agent'
  });
  
  // UI state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Dropdown data
  const [zones, setZones] = useState([]);
  const [areas, setAreas] = useState([]);

  // Live validation
  const usernameValidation = useLiveValidation('users', 'username');
  const emailValidation = useLiveValidation('users', 'email');
  const phoneValidation = useLiveValidation('users', 'phone');

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const zonesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/locations.php?type=zones`
      );
      if (zonesResponse.data.success) {
        setZones(zonesResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchAreas = async (zoneId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/locations.php?type=areas`
      );
      if (response.data.success) {
        const filteredAreas = response.data.data.filter(area => area.zone_id == zoneId);
        setAreas(filteredAreas);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Live validation
    if (name === 'username') usernameValidation.validate(value);
    if (name === 'email') emailValidation.validate(value);
    if (name === 'phone') phoneValidation.validate(value);

    // Fetch areas when zone changes
    if (name === 'zone_id' && value) {
      fetchAreas(value);
      setFormData(prev => ({ ...prev, area_id: '' }));
    }

    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (step === 2) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
        newErrors.phone = 'Phone number is invalid';
      }
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    
    if (step === 3) {
      if (!formData.zone_id) newErrors.zone_id = 'Zone selection is required';
      if (!formData.area_id) newErrors.area_id = 'Area selection is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    if (usernameValidation.exists || emailValidation.exists || phoneValidation.exists) {
      showErrorToast('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') submitData.append(key, formData[key]);
      });
      if (image) submitData.append('image', image);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/backend/api/auth/agent_register.php`,
        submitData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        if (response.data.requires_otp) {
          setRegisteredUser(response.data.data);
          setShowOTPModal(true);
          showFormSuccessToast('Registration successful! Please verify your email.');
        } else {
          showFormSuccessToast('agent', 'register');
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
    usernameValidation.reset();
    emailValidation.reset();
    phoneValidation.reset();
    showFormSuccessToast('Email verified! Your account is pending admin approval.');
    setShowOTPModal(false);
    onClose();
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    setRegisteredUser(null);
  };

  return (
    <div className="agent-registration-form">
      <div className="d-flex align-items-center mb-2">
        <Button variant="link" onClick={onBack} className="p-0 me-2 text-dark">
          <FaArrowLeft size={20} />
        </Button>
        <h4 className="mb-0 text-primary">Agent Registration</h4>
      </div>

      <ProgressBar now={(currentStep / 3) * 100} className="mb-2" variant="warning" />

      <Form onSubmit={handleSubmit}>
        {/* Step Indicators */}
        <div className="d-flex justify-content-between mb-2">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`step-indicator ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              onClick={() => currentStep > step && setCurrentStep(step)}
            >
              <div className="step-number">
                {currentStep > step ? <FaCheck size={12} /> : step}
              </div>
              <div className="step-label">
                {step === 1 && 'Personal Info'}
                {step === 2 && 'Contact Info'}
                {step === 3 && 'Account Setup'}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card className="mb-2 border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary mb-2">
                <FaUserTie className="me-2" />
                Personal Information
              </h5>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      isInvalid={!!errors.first_name}
                      placeholder="Enter first name"
                      className="py-2"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.first_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      isInvalid={!!errors.last_name}
                      placeholder="Enter last name"
                      className="py-2"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.last_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-2">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username || usernameValidation.isValid === false}
                  isValid={usernameValidation.isValid === true}
                  placeholder="Choose a username"
                  className="py-2"
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

              <Form.Group className="mb-2">
                <Form.Label>Profile Photo</Form.Label>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{ width: '80px', height: '80px' }}>
                        <FaUserTie size={24} className="text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="py-2"
                    />
                    <Form.Text className="text-muted">
                      Optional - You can add this later
                    </Form.Text>
                  </div>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <Card className="mb-2 border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary mb-2">
                <i className="bi bi-telephone me-2"></i>
                Contact Information
              </h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      isInvalid={!!errors.phone || phoneValidation.isValid === false}
                      isValid={phoneValidation.isValid === true}
                      placeholder="Enter phone number"
                      className="py-2"
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
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email || emailValidation.isValid === false}
                      isValid={emailValidation.isValid === true}
                      placeholder="Enter email address"
                      className="py-2"
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
              <Form.Group className="mb-2">
                <Form.Label>Address *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  isInvalid={!!errors.address}
                  placeholder="Enter your full address"
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>
            </Card.Body>
          </Card>
        )}

        {/* Step 3: Account Setup */}
        {currentStep === 3 && (
          <Card className="mb-2 border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary mb-2">
                <i className="bi bi-shield-lock me-2"></i>
                Account Setup
              </h5>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Service Zone *</Form.Label>
                    <Form.Select
                      name="zone_id"
                      value={formData.zone_id}
                      onChange={handleChange}
                      isInvalid={!!errors.zone_id}
                      className="py-2"
                    >
                      <option value="">Select Zone</option>
                      {zones.map(zone => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.zone_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Service Area *</Form.Label>
                    <Form.Select
                      name="area_id"
                      value={formData.area_id}
                      onChange={handleChange}
                      disabled={!formData.zone_id}
                      isInvalid={!!errors.area_id}
                      className="py-2"
                    >
                      <option value="">Select Area</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.area_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Password *</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        placeholder="Create password"
                        className="py-2"
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ zIndex: 10 }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Minimum 6 characters
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Confirm Password *</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                        placeholder="Confirm password"
                        className="py-2"
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
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

              <Alert variant="light" className="border border-warning">
                <strong className="text-warning">Note:</strong> As an agent, you'll manage service operations, 
                coordinate with workers, and ensure quality service in your assigned area.
              </Alert>
            </Card.Body>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-2">
          {currentStep > 1 ? (
            <Button 
              variant="outline-secondary" 
              onClick={prevStep}
              disabled={loading}
              className="px-4 py-2 rounded-pill"
            >
              Back
            </Button>
          ) : (
            <Button 
              variant="outline-secondary" 
              onClick={onBack}
              disabled={loading}
              className="px-4 py-2 rounded-pill"
            >
              Cancel
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button 
              variant="primary" 
              onClick={nextStep}
              disabled={loading}
              className="px-4 py-2 rounded-pill"
            >
              Next Step
            </Button>
          ) : (
            <Button 
              type="submit" 
              variant="warning" 
              disabled={loading}
              className="px-4 py-2 rounded-pill"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Registering...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          )}
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

export default AgentRegistrationForm;