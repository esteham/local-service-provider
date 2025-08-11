/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaHammer, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import useLiveValidation from '../../hooks/useLiveValidation';
import ValidationMessage from '../common/ValidationMessage';
import { showFormSuccessToast, showErrorToast } from '../../utils/confirmationToast';
import OTPVerification from './OTPVerification';

const WorkerRegistrationForm = ({ onClose, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    skills: '',
    experience: '',
    hourly_rate: '',
    emergency_name: '',
    emergency_phone: '',
    emergency_relation: '',
    zone_id: '',
    area_id: '',
    category_id: '',
    role: 'worker'
  });
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
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [areas, setAreas] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Live validation hooks
  const usernameValidation = useLiveValidation('users', 'username');
  const emailValidation = useLiveValidation('users', 'email');
  const phoneValidation = useLiveValidation('users', 'phone');

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const categoriesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/categories.php`
      );
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data);
      }

      const zonesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/locations.php?type=zones`
      );
      if (zonesResponse.data.success) {
        setZones(zonesResponse.data.data);
      }

      const servicesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/public_services.php?action=services`
      );
      if (servicesResponse.data.success) {
        setServices(servicesResponse.data.data);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'username') {
      usernameValidation.validate(value);
    } else if (name === 'email') {
      emailValidation.validate(value);
    } else if (name === 'phone') {
      phoneValidation.validate(value);
    }

    if (name === 'zone_id' && value) {
      fetchAreas(value);
      setFormData(prev => ({ ...prev, area_id: '' }));
    }

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

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
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
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.skills.trim()) {
      newErrors.skills = 'Skills are required';
    }

    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Valid hourly rate is required';
    }

    if (selectedServices.length === 0) {
      newErrors.services = 'Please select at least one service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    const stepErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.first_name.trim()) stepErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) stepErrors.last_name = 'Last name is required';
        if (!formData.username.trim()) stepErrors.username = 'Username is required';
        if (formData.username.length < 3) stepErrors.username = 'Username must be at least 3 characters';
        if (!formData.category_id) stepErrors.category_id = 'Category is required';
        break;
      case 2:
        if (!formData.phone.trim()) stepErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) stepErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) stepErrors.email = 'Email is invalid';
        if (!formData.address.trim()) stepErrors.address = 'Address is required';
        if (!formData.zone_id) stepErrors.zone_id = 'Zone is required';
        if (!formData.area_id) stepErrors.area_id = 'Area is required';
        break;
      case 3:
        if (!formData.skills.trim()) stepErrors.skills = 'Skills are required';
        if (!formData.hourly_rate || formData.hourly_rate <= 0) stepErrors.hourly_rate = 'Valid hourly rate is required';
        if (selectedServices.length === 0) stepErrors.services = 'Please select at least one service';
        break;
      case 5:
        if (!formData.password) stepErrors.password = 'Password is required';
        if (formData.password.length < 6) stepErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Passwords do not match';
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (usernameValidation.exists || emailValidation.exists || phoneValidation.exists) return;
    if (usernameValidation.isChecking || emailValidation.isChecking || phoneValidation.isChecking) {
      showErrorToast('Please wait for validation to complete.');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append('service_ids', JSON.stringify(selectedServices));

      if (image) {
        submitData.append('image', image);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/backend/api/auth/worker_register.php`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        if (response.data.requires_otp) {
          setRegisteredUser(response.data.data);
          setShowOTPModal(true);
          showFormSuccessToast('Registration successful! Please check your email for OTP verification.');
        } else {
          showFormSuccessToast('worker', 'register');
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
    usernameValidation.reset();
    emailValidation.reset();
    phoneValidation.reset();
    showFormSuccessToast('Email verified successfully! Your account is pending admin approval.');
    setShowOTPModal(false);
    onClose();
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    setRegisteredUser(null);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const skipEmergencyContact = () => {
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="worker-registration-form">
      <div className="d-flex align-items-center mb-3">
        <Button variant="link" onClick={onBack} className="p-0 me-2">
          <FaArrowLeft />
        </Button>
        <h5 className="mb-0">Worker Registration</h5>
      </div>

      <div className="d-flex mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className={`d-flex flex-column align-items-center ${currentStep >= step ? 'text-primary' : 'text-muted'}`}
            style={{ width: '20%' }}
          >
            <div 
              className={`rounded-circle mb-1 ${currentStep >= step ? 'bg-primary' : 'bg-light'}`}
              style={{ 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: currentStep === step ? '2px solid #0d6efd' : 'none'
              }}
            >
              {step}
            </div>
            <small className="text-center">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Contact'}
              {step === 3 && 'Professional'}
              {step === 4 && 'Emergency'}
              {step === 5 && 'Security'}
            </small>
          </div>
        ))}
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <>
            <h6 className="text-success mb-3">Basic Information</h6>
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
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    isInvalid={!!errors.category_id}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <>
            <h6 className="text-success mb-3">Contact Information</h6>
            <Row>
              <Col md={6}>
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

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                placeholder="Enter your address"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Zone *</Form.Label>
                  <Form.Select
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={handleChange}
                    isInvalid={!!errors.zone_id}
                  >
                    <option value="">Select Zone</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.zone_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Area *</Form.Label>
                  <Form.Select
                    name="area_id"
                    value={formData.area_id}
                    onChange={handleChange}
                    disabled={!formData.zone_id}
                    isInvalid={!!errors.area_id}
                  >
                    <option value="">Select Area</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.area_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Step 3: Professional Information */}
        {currentStep === 3 && (
          <>
            <h6 className="text-success mb-3">Professional Information</h6>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Skills *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    isInvalid={!!errors.skills}
                    placeholder="Describe your skills and expertise"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.skills}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hourly Rate ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    isInvalid={!!errors.hourly_rate}
                    placeholder="0.00"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hourly_rate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Services Offered *</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Row>
                  {services.map(service => (
                    <Col md={6} key={service.id}>
                      <Form.Check
                        type="checkbox"
                        id={`service-${service.id}`}
                        label={service.name}
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="mb-2"
                      />
                    </Col>
                  ))}
                </Row>
              </div>
              {errors.services && (
                <div className="text-danger small mt-1">{errors.services}</div>
              )}
            </Form.Group>
          </>
        )}

        {/* Step 4: Emergency Contact */}
        {currentStep === 4 && (
          <>
            <h6 className="text-success mb-3">Emergency Contact (Optional)</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergency_name"
                    value={formData.emergency_name}
                    onChange={handleChange}
                    placeholder="Contact name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleChange}
                    placeholder="Contact phone"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Relationship</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergency_relation"
                    value={formData.emergency_relation}
                    onChange={handleChange}
                    placeholder="e.g., Spouse, Parent"
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Step 5: Account Security */}
        {currentStep === 5 && (
          <>
            <h6 className="text-success mb-3">Account Security</h6>
            <div className="alert alert-info mb-3">
              <strong>Username:</strong> {formData.username}
            </div>
            
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
              <Form.Label>Profile Image (Optional)</Form.Label>
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
          </>
        )}

        <div className="d-flex justify-content-between mt-4">
          {currentStep > 1 ? (
            <Button variant="outline-secondary" onClick={prevStep}>
              <FaArrowLeft className="me-1" /> Back
            </Button>
          ) : (
            <Button variant="outline-secondary" onClick={onBack}>
              <FaArrowLeft className="me-1" /> Cancel
            </Button>
          )}

          {currentStep < 5 ? (
            <div>
              {currentStep === 4 && (
                <Button variant="outline-primary" onClick={skipEmergencyContact} className="me-2">
                  Skip
                </Button>
              )}
              <Button variant="primary" onClick={nextStep}>
                Next <FaArrowRight className="ms-1" />
              </Button>
            </div>
          ) : (
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Registering...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          )}
        </div>
      </Form>

      <OTPVerification
        show={showOTPModal}
        onHide={handleOTPModalClose}
        userData={registeredUser}
        onVerificationSuccess={handleOTPVerificationSuccess}
      />
    </div>
  );
};

export default WorkerRegistrationForm;