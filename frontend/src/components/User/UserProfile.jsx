/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Image,
  Table,
  Badge,
  Tab,
  Tabs,
  Row,
  Col,
  ListGroup,
  InputGroup,
  Modal
} from 'react-bootstrap';

// Base API configuration
const BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors }, watch: watchPassword } = useForm();

  // Watch form fields for changes
  const watchUsername = watch('username');
  const watchEmail = watch('email');
  const watchNewPassword = watchPassword('new_password');
  
  // Fetch user profile and requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, requestsRes, pendingPaymentsRes] = await Promise.all([
          axios.get(`${BASE_URL}/backend/api/user/profile.php`, { withCredentials: true }),
          axios.get(`${BASE_URL}/backend/api/user/requests.php`, { withCredentials: true }),
          axios.get(`${BASE_URL}/backend/api/user/payment.php?action=pending`, { withCredentials: true })
        ]);
        
        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
          reset(profileRes.data.data);
        }
        
        if (requestsRes.data.success) {
          console.log('Service requests received:', requestsRes.data.data);
          setRequests(requestsRes.data.data);
        }
        
        if (pendingPaymentsRes.data.success) {
          console.log('Pending payments received:', pendingPaymentsRes.data.data);
          setPendingPayments(pendingPaymentsRes.data.data);
        }
      } catch (err) {
        setError('Failed to load data');
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Check username availability
  useEffect(() => {
    if (!isEditing || !watchUsername || watchUsername === profile?.username) {
      setUsernameAvailable(true);
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability('username', watchUsername);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchUsername, isEditing, profile?.username]);

  // Check email availability
  useEffect(() => {
    if (!isEditing || !watchEmail || watchEmail === profile?.email) {
      setEmailAvailable(true);
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability('email', watchEmail);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchEmail, isEditing, profile?.email]);

  const checkAvailability = async (field, value) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/backend/api/user/check_availability.php`,
        { field, value },
        { withCredentials: true }
      );

      if (field === 'username') {
        setUsernameAvailable(response.data.available);
      } else if (field === 'email') {
        setEmailAvailable(response.data.available);
      }
    } catch (err) {
      console.error('Availability check failed:', err);
    }
  };

  const onProfileUpdate = async (data) => {
    if (!usernameAvailable || !emailAvailable) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/backend/api/user/profile.php?action=update`, 
        data, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setProfile(response.data.data);
        reset(response.data.data) //Reset form with new data
      } else {
        toast.error(response.data.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const onChangePassword = async (data) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/backend/api/auth/change_password.php`, 
        data,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        resetPassword();
      } else {
        toast.error(response.data.message || 'Password change failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handlePayNow = (request) => {
    setSelectedPayment(request);
    setPaymentMethod('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/backend/api/user/payment.php`,
        {
          action: 'initiate',
          service_request_id: selectedPayment.id,
          payment_method: paymentMethod
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (paymentMethod === 'cash') {
          toast.success('Cash payment initiated! Verification code sent to worker.');
          setShowPaymentModal(false);
          // Refresh data to update payment status
          window.location.reload();
        } else if (paymentMethod === 'online') {
          // For online payment, simulate payment processing
          const onlinePaymentResponse = await axios.post(
            `${BASE_URL}/backend/api/user/payment.php`,
            {
              action: 'process_online',
              payment_id: response.data.payment_id,
              payment_data: {
                transaction_id: 'TXN_' + Date.now(),
                gateway: 'demo_gateway',
                status: 'success'
              }
            },
            { withCredentials: true }
          );

          if (onlinePaymentResponse.data.success) {
            toast.success('Payment completed successfully!');
            setShowPaymentModal(false);
            window.location.reload();
          } else {
            toast.error(onlinePaymentResponse.data.message || 'Payment processing failed');
          }
        }
      } else {
        toast.error(response.data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isPaymentPending = (requestId) => {
    console.log('Checking payment pending for request ID:', requestId);
    console.log('Available pending payments:', pendingPayments);
    const result = pendingPayments.some(payment => payment.id === requestId);
    console.log('Payment pending result:', result);
    return result;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        {/* Left Sidebar Card */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              {profile?.image_url && (
                <Image 
                  src={profile.image_url} 
                  roundedCircle 
                  width={120}
                  height={120}
                  className="border border-4 border-primary mb-3"
                />
              )}
              
              <h2 className="h4 mb-1">{profile?.username || 'User'}</h2>
              <p className="text-muted mb-3">{profile?.email}</p>
              
              <div className="w-100 mb-4">
                <ListGroup variant="flush" className="border-top border-bottom">
                  <ListGroup.Item 
                    action 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                    className="border-0 py-2"
                  >
                    <i className="bi bi-person me-2"></i> Profile Information
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action 
                    active={activeTab === 'requests'} 
                    onClick={() => setActiveTab('requests')}
                    className="border-0 py-2"
                  >
                    <i className="bi bi-list-check me-2"></i> Service Requests
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action 
                    active={activeTab === 'security'} 
                    onClick={() => setActiveTab('security')}
                    className="border-0 py-2"
                  >
                    <i className="bi bi-shield-lock me-2"></i> Security
                  </ListGroup.Item>
                </ListGroup>
              </div>
              
              <div className="w-100">
                <Card className="bg-light">
                  <Card.Body className="p-3">
                    <h6 className="text-uppercase text-muted small mb-3">Contact Info</h6>
                    <div className="d-flex align-items-start mb-2">
                      <i className="bi bi-telephone text-primary mt-1 me-2"></i>
                      <div>
                        <div className="small text-muted">Phone</div>
                        <div>{profile?.phone || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <i className="bi bi-geo-alt text-primary mt-1 me-2"></i>
                      <div>
                        <div className="small text-muted">Address</div>
                        <div>{profile?.address || 'Not provided'}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Content Area */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {activeTab === 'profile' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 mb-0">Profile Information</h2>
                    {!isEditing ? (
                      <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>
                        <i className="bi bi-pencil-square me-1"></i> Edit Profile
                      </Button>
                    ) : (
                      <Button variant="outline-secondary" size="sm" onClick={() => setIsEditing(false)}>
                        <i className="bi bi-x-circle me-1"></i> Cancel
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <Form onSubmit={handleSubmit(onProfileUpdate)} className="row g-3">
                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            {...register('username', { 
                              required: 'Username is required',
                              minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                              },
                              maxLength: {
                                value: 20,
                                message: 'Username must be less than 20 characters'
                              }
                            })}
                            isInvalid={!!errors.username || !usernameAvailable}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.username?.message || 'Username is already taken'}
                          </Form.Control.Feedback>
                          {!errors.username && watchUsername && watchUsername !== profile?.username && (
                            <Form.Text className={usernameAvailable ? 'text-success' : 'text-danger'}>
                              {usernameAvailable ? 'Username available' : 'Username not available'}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </div>

                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            isInvalid={!!errors.email || !emailAvailable}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email?.message || 'Email is already in use'}
                          </Form.Control.Feedback>
                          {!errors.email && watchEmail && watchEmail !== profile?.email && (
                            <Form.Text className={emailAvailable ? 'text-success' : 'text-danger'}>
                              {emailAvailable ? 'Email available' : 'Email already in use'}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </div>

                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            {...register('phone')}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-6">
                        <Form.Group>
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            {...register('address')}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-12">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="mt-2"
                          disabled={!usernameAvailable || !emailAvailable}
                        >
                          <i className="bi bi-check-circle me-1"></i> Save Changes
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <Card className="border-0 bg-light">
                          <Card.Body>
                            <div className="text-muted small mb-1">Username</div>
                            <div className="h5">{profile?.username}</div>
                          </Card.Body>
                        </Card>
                      </div>
                      <div className="col-md-6">
                        <Card className="border-0 bg-light">
                          <Card.Body>
                            <div className="text-muted small mb-1">Email</div>
                            <div className="h5">{profile?.email}</div>
                          </Card.Body>
                        </Card>
                      </div>
                      <div className="col-md-6">
                        <Card className="border-0 bg-light">
                          <Card.Body>
                            <div className="text-muted small mb-1">Phone</div>
                            <div className="h5">{profile?.phone || '-'}</div>
                          </Card.Body>
                        </Card>
                      </div>
                      <div className="col-md-6">
                        <Card className="border-0 bg-light">
                          <Card.Body>
                            <div className="text-muted small mb-1">Address</div>
                            <div className="h5">{profile?.address || '-'}</div>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 mb-0">Service Requests</h2>
                    <Badge pill bg="primary" className="px-3 py-2">
                      {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
                    </Badge>
                  </div>
                  
                  {requests.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                      </div>
                      <h5 className="text-muted">No service requests found</h5>
                      <p className="text-muted">You haven't made any service requests yet</p>
                      <Button variant="outline-primary" className="mt-2">
                        Request a Service
                      </Button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Price</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map((request) => (
                            <tr key={request.id}>
                              <td>
                                <div className="fw-semibold">{request.title}</div>
                                <div className="text-muted small">{request.service_name}</div>
                              </td>
                              <td>
                                {request.scheduled_at ? formatDate(request.scheduled_at) : 'Not scheduled'}
                              </td>
                              <td>
                                <Badge 
                                  bg={
                                    request.status === 'completed' ? 'success' : 
                                    request.status === 'cancelled' ? 'danger' : 'info'
                                  }
                                  className="text-capitalize"
                                >
                                  {request.status}
                                </Badge>
                              </td>
                              <td className="fw-semibold">
                                {request.final_price ? `$${request.final_price}` : `$${request.base_price}`}
                              </td>
                              <td>
                                {(() => {
                                  console.log(`Request ${request.id}: status=${request.status}, payment_status=${request.payment_status}`);
                                   
                                  if (request.status === 'completed' && (!request.payment_status || request.payment_status === 'pending')) {
                                    return (
                                      <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={() => handlePayNow(request)}
                                      >
                                        <i className="bi bi-credit-card me-1"></i>
                                        Pay Now
                                      </Button>
                                    );
                                  } else if (request.status === 'paid' || request.payment_status === 'paid') {
                                    return (
                                      <Badge bg="success" className="px-2 py-1">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Paid
                                      </Badge>
                                    );
                                  } else if (request.status === 'payment_pending' || request.payment_status === 'processing') {
                                    return (
                                      <Badge bg="warning" className="px-2 py-1">
                                        <i className="bi bi-clock me-1"></i>
                                        Payment Processing
                                      </Badge>
                                    );
                                  } else {
                                    return <span className="text-muted">-</span>;
                                  }
                                })()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="h4 mb-4">Change Password</h2>
                  <Form onSubmit={handlePasswordSubmit(onChangePassword)} className="max-w-sm">
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showCurrentPassword ? "text" : "password"}
                          {...registerPassword('current_password', { required: 'Current password is required' })}
                          isInvalid={!!passwordErrors.current_password}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          <i className={`bi ${showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </Button>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        {passwordErrors.current_password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword('new_password', { 
                            required: 'New password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters'
                            }
                          })}
                          isInvalid={!!passwordErrors.new_password}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Minimum 8 characters
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {passwordErrors.new_password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerPassword('confirm_password', { 
                            required: 'Please confirm your password',
                            validate: value => 
                              value === watchNewPassword || 'Passwords do not match'
                          })}
                          isInvalid={!!passwordErrors.confirm_password}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </Button>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        {passwordErrors.confirm_password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button type="submit" variant="primary" className="w-100">
                      <i className="bi bi-shield-lock me-1"></i> Update Password
                    </Button>

                    <div className="mt-3 alert alert-warning">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <strong>Danger Zone:</strong> Changing your password will log you out from all devices.
                    </div>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-credit-card me-2"></i>
            Payment Options
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Service Details</h6>
                <div className="bg-light p-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">{selectedPayment.title}</span>
                    <Badge bg="success">Completed</Badge>
                  </div>
                  <div className="text-muted small mb-1">{selectedPayment.service_name}</div>
                  <div className="fw-bold text-primary fs-5">
                    ${selectedPayment.final_price || selectedPayment.base_price}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-3">Choose Payment Method</h6>
                
                <div className="d-grid gap-2">
                  <Button
                    variant={paymentMethod === 'online' ? 'primary' : 'outline-primary'}
                    onClick={() => setPaymentMethod('online')}
                    className="text-start p-3"
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-credit-card fs-4 me-3"></i>
                      <div>
                        <div className="fw-semibold">Online Payment</div>
                        <div className="small text-muted">Pay instantly with card or digital wallet</div>
                      </div>
                      {paymentMethod === 'online' && (
                        <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                      )}
                    </div>
                  </Button>

                  <Button
                    variant={paymentMethod === 'cash' ? 'success' : 'outline-success'}
                    onClick={() => setPaymentMethod('cash')}
                    className="text-start p-3"
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-cash-stack fs-4 me-3"></i>
                      <div>
                        <div className="fw-semibold">Cash Payment</div>
                        <div className="small text-muted">Pay with cash - verification code sent to worker</div>
                      </div>
                      {paymentMethod === 'cash' && (
                        <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                      )}
                    </div>
                  </Button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <Alert variant="info" className="mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Cash Payment Process:</strong>
                  <ol className="mb-0 mt-2">
                    <li>A verification code will be sent to the worker's email</li>
                    <li>Pay the worker in cash</li>
                    <li>The worker will enter the code to confirm payment</li>
                    <li>Your payment will be marked as completed</li>
                  </ol>
                </Alert>
              )}

              {paymentMethod === 'online' && (
                <Alert variant="success" className="mb-3">
                  <i className="bi bi-shield-check me-2"></i>
                  <strong>Secure Online Payment:</strong> Your payment will be processed securely through our payment gateway.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePaymentSubmit}
            disabled={!paymentMethod || isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {paymentMethod === 'cash' ? 'Initiate Cash Payment' : 'Pay Now'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile;