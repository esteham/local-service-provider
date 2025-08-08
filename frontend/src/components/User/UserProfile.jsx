/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Card, ListGroup, Image, Badge, Table, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

const BASE_URL = import.meta.env.VITE_API_URL;

// Styled components for modern look
const ProfileContainer = styled(Container)`
  padding: 2rem 0;
`;

const ProfileCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
  
  .card-header {
    background: white;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
    padding: 1.25rem 1.5rem;
  }
`;

const ProfileImage = styled(Image)`
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled(ListGroup.Item)`
  border: none;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  color: ${props => props.active ? '#4a6bff' : '#5a6169'};
  background: ${props => props.active ? 'rgba(74, 107, 255, 0.08)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(74, 107, 255, 0.05);
    color: #4a6bff;
  }
  
  &:first-child, &:last-child {
    border-radius: 0;
  }
`;

const ModernButton = styled(Button)`
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
`;

const SectionTitle = styled.h5`
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2d3748;
`;

const UserProfile = ({ initialSection }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);

  // UI state
  const [activeSection, setActiveSection] = useState(initialSection || (location.pathname.includes('my-requests') ? 'requests' : 'personal'));
  const [personalEdit, setPersonalEdit] = useState(false);
  const [passwordEdit, setPasswordEdit] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState({ 
    username: '', 
    email: '', 
    phone: '', 
    address: '', 
    skills: '', 
    experience: '' 
  });
  const [pwdForm, setPwdForm] = useState({ 
    current_password: '', 
    new_password: '' 
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Load profile
        const profRes = await axios.get(`${BASE_URL}/backend/api/user/profile.php`, { 
          withCredentials: true 
        });
        
        if (profRes.data?.success) {
          const data = profRes.data.data;
          setProfile(data);
          setEditForm({
            username: data.username || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            skills: data.skills || '',
            experience: data.experience || ''
          });
        } else {
          toast.error(profRes.data?.message || 'Failed to load profile');
        }

        // Load user's requests
        const reqRes = await axios.get(`${BASE_URL}/backend/api/user/requests.php`, { 
          withCredentials: true 
        });
        
        if (reqRes.data?.success) {
          setRequests(reqRes.data.data || []);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleEditSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await axios.post(
        `${BASE_URL}/backend/api/user/profile.php?action=update`,
        editForm,
        { 
          withCredentials: true, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
      
      if (res.data?.success) {
        toast.success('Profile updated successfully');
        setProfile(prev => ({ ...prev, ...editForm }));
        setPersonalEdit(false);
      } else {
        toast.error(res.data?.message || 'Update failed');
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwdForm.current_password || !pwdForm.new_password) {
      toast.error('Please fill both fields');
      return;
    }
    
    try {
      const res = await axios.post(
        `${BASE_URL}/backend/api/auth/change_password.php`, 
        pwdForm, 
        { withCredentials: true }
      );
      
      if (res.data?.success) {
        toast.success('Password changed successfully');
        setPwdForm({ current_password: '', new_password: '' });
        setPasswordEdit(false);
      } else {
        toast.error(res.data?.message || 'Password change failed');
      }
    } catch (e) {
      toast.error('Password change failed');
    }
  };

  const handleCancelEdits = () => {
    if (!profile) return;
    setEditForm({
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      skills: profile.skills || '',
      experience: profile.experience || ''
    });
    setPersonalEdit(false);
    setPasswordEdit(false);
  };

  if (loading) return (
    <ProfileContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" variant="primary" />
    </ProfileContainer>
  );

  const Sidebar = () => (
    <ProfileCard>
      <Card.Body className="text-center p-4">
        <ProfileImage
          src={profile?.image_url || '/placeholder-avatar.png'}
          alt="Profile"
          roundedCircle
          width={140}
          height={140}
          className="mb-3"
        />
        <h5 className="mb-1">{profile?.username}</h5>
        <div className="text-muted small mb-4">{profile?.email}</div>
        <ListGroup variant="flush">
          <NavItem 
            action
            active={activeSection === 'personal'}
            onClick={() => setActiveSection('personal')}
          >
            <i className="bi bi-person me-2"></i>
            Personal Information
          </NavItem>
          <NavItem
            action
            active={activeSection === 'password'}
            onClick={() => setActiveSection('password')}
          >
            <i className="bi bi-lock me-2"></i>
            Password
          </NavItem>
          <NavItem
            action
            active={activeSection === 'requests'}
            onClick={() => setActiveSection('requests')}
          >
            <i className="bi bi-list-check me-2"></i>
            My Requests
          </NavItem>
        </ListGroup>
      </Card.Body>
    </ProfileCard>
  );

  const PersonalInfo = () => (
    <ProfileCard>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Personal Information</span>
        {!personalEdit ? (
          <ModernButton 
            variant="outline-primary" 
            size="sm" 
            onClick={() => setPersonalEdit(true)}
          >
            <i className="bi bi-pencil me-1"></i> Edit
          </ModernButton>
        ) : (
          <div className="d-flex gap-2">
            <ModernButton 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleCancelEdits}
            >
              Cancel
            </ModernButton>
          </div>
        )}
      </Card.Header>
      <Card.Body className="p-4">
        {!personalEdit ? (
          <Row>
            <Col md={6} className="mb-4">
              <SectionTitle>Basic Information</SectionTitle>
              <div className="mb-3">
                <label className="text-muted small">Username</label>
                <div className="fw-medium">{profile?.username}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Email</label>
                <div className="fw-medium">{profile?.email}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Status</label>
                <div>
                  <Badge bg={profile?.status === 'active' ? 'success' : 'secondary'} pill>
                    {profile?.status}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <SectionTitle>Contact Details</SectionTitle>
              <div className="mb-3">
                <label className="text-muted small">Phone</label>
                <div className="fw-medium">{profile?.phone || '-'}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Address</label>
                <div className="fw-medium">{profile?.address || '-'}</div>
              </div>
              {profile?.role === 'worker' && (
                <>
                  <div className="mb-3">
                    <label className="text-muted small">Skills</label>
                    <div className="fw-medium">{profile?.skills || '-'}</div>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small">Experience</label>
                    <div className="fw-medium">{profile?.experience || '-'}</div>
                  </div>
                </>
              )}
            </Col>
          </Row>
        ) : (
          <Form noValidate onSubmit={handleEditSave}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Username</Form.Label>
                  <Form.Control 
                    value={editForm.username} 
                    onChange={e => setEditForm({...editForm, username: e.target.value})} 
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})} 
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Phone</Form.Label>
                  <Form.Control 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small">Address</Form.Label>
                  <Form.Control 
                    value={editForm.address} 
                    onChange={e => setEditForm({...editForm, address: e.target.value})} 
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              {profile?.role === 'worker' && (
                <>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted small">Skills</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={editForm.skills} 
                        onChange={e => setEditForm({...editForm, skills: e.target.value})} 
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted small">Experience</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={editForm.experience} 
                        onChange={e => setEditForm({...editForm, experience: e.target.value})} 
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
            <div className="mt-3">
              <ModernButton type="submit" variant="primary">
                Save Changes
              </ModernButton>
            </div>
          </Form>
        )}
      </Card.Body>
    </ProfileCard>
  );

  const PasswordSection = () => (
    <ProfileCard>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Password</span>
        {!passwordEdit ? (
          <ModernButton 
            variant="outline-primary" 
            size="sm" 
            onClick={() => setPasswordEdit(true)}
          >
            <i className="bi bi-pencil me-1"></i> Change
          </ModernButton>
        ) : (
          <div className="d-flex gap-2">
            <ModernButton 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleCancelEdits}
            >
              Cancel
            </ModernButton>
          </div>
        )}
      </Card.Header>
      <Card.Body className="p-4">
        {!passwordEdit ? (
          <div className="text-center py-4">
            <i className="bi bi-shield-lock fs-1 text-muted mb-3"></i>
            <p className="text-muted">For your security, your password is hidden.</p>
          </div>
        ) : (
          <Form noValidate onSubmit={handlePasswordChange} className="mt-2">
            <Form.Group className="mb-3">
              <Form.Label className="text-muted small">Current Password</Form.Label>
              <Form.Control 
                type="password" 
                value={pwdForm.current_password} 
                onChange={e => setPwdForm({...pwdForm, current_password: e.target.value})} 
                className="py-2"
                placeholder="Enter current password"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small">New Password</Form.Label>
              <Form.Control 
                type="password" 
                value={pwdForm.new_password} 
                onChange={e => setPwdForm({...pwdForm, new_password: e.target.value})} 
                className="py-2"
                placeholder="Enter new password"
              />
            </Form.Group>
            <div className="mt-2">
              <ModernButton type="submit" variant="primary">
                Update Password
              </ModernButton>
            </div>
          </Form>
        )}
      </Card.Body>
    </ProfileCard>
  );

  const RequestsSection = () => (
    <ProfileCard>
      <Card.Header>My Service Requests</Card.Header>
      <Card.Body className="p-0">
        {requests.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">No requests yet</h5>
            <p className="text-muted">You have not submitted any service requests.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Location</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td className="fw-medium">#{r.id}</td>
                    <td>{r.service_name}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '150px' }}>
                        {r.zone_name} / {r.area_name}
                      </div>
                    </td>
                    <td>{r.title}</td>
                    <td>
                      <Badge 
                        bg={
                          r.status === 'completed' ? 'success' : 
                          r.status === 'pending' ? 'warning' : 
                          'info'
                        } 
                        pill
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="fw-medium">
                      {r.final_price != null ? `$${r.final_price}` : 
                       r.base_price != null ? `$${r.base_price}` : '-'}
                    </td>
                    <td className="text-muted">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </ProfileCard>
  );

  return (
    <ProfileContainer>
      <Row className="g-4">
        <Col md={4} lg={3}>
          <Sidebar />
        </Col>
        <Col md={8} lg={9}>
          {activeSection === 'personal' && <PersonalInfo />}
          {activeSection === 'password' && <PasswordSection />}
          {activeSection === 'requests' && <RequestsSection />}
        </Col>
      </Row>
    </ProfileContainer>
  );
};

export default UserProfile;