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
  ListGroup
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
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  // Fetch user profile and requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, requestsRes] = await Promise.all([
          axios.get(`${BASE_URL}/backend/api/user/profile.php`, { withCredentials: true }),
          axios.get(`${BASE_URL}/backend/api/user/requests.php`, { withCredentials: true })
        ]);
        
        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
          reset(profileRes.data.data);
        }
        
        if (requestsRes.data.success) {
          setRequests(requestsRes.data.data);
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

  const onProfileUpdate = async (data) => {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                            {...register('username', { required: 'Username is required' })}
                            isInvalid={!!errors.username}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.username?.message}
                          </Form.Control.Feedback>
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
                            isInvalid={!!errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email?.message}
                          </Form.Control.Feedback>
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
                        <Button type="submit" variant="primary" className="mt-2">
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
                                    request.status === 'cancelled' ? 'danger' : 'warning'
                                  }
                                  className="text-capitalize"
                                >
                                  {request.status}
                                </Badge>
                              </td>
                              <td className="fw-semibold">
                                {request.final_price ? `$${request.final_price}` : `$${request.base_price}`}
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
                      <Form.Control
                        type="password"
                        {...registerPassword('current_password', { required: 'Current password is required' })}
                        isInvalid={!!errors.current_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.current_password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        {...registerPassword('new_password', { 
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        })}
                        isInvalid={!!errors.new_password}
                      />
                      <Form.Text className="text-muted">
                        Minimum 8 characters
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.new_password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button type="submit" variant="primary" className="w-100">
                      <i className="bi bi-shield-lock me-1"></i> Update Password
                    </Button>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;