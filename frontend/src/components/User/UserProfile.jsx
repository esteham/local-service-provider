/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Card, ListGroup, Image, Badge, Table } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const [editForm, setEditForm] = useState({ username: '', email: '', phone: '', address: '' , skills: '', experience: ''});
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '' });

  // Debug: track edit mode flips
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('personalEdit changed:', personalEdit);
  }, [personalEdit]);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('passwordEdit changed:', passwordEdit);
  }, [passwordEdit]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Load profile
        const profRes = await axios.get(`${BASE_URL}/backend/api/user/profile.php`, { withCredentials: true });
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
        const reqRes = await axios.get(`${BASE_URL}/backend/api/user/requests.php`, { withCredentials: true });
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
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (res.data?.success) {
        toast.success('Profile updated');
        // refresh profile view
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
      const res = await axios.post(`${BASE_URL}/backend/api/auth/change_password.php`, pwdForm, { withCredentials: true });
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

  if (loading) return <div className="container py-5">Loading...</div>;

  const Sidebar = () => (
    <Card>
      <Card.Body className="text-center">
        <Image
          src={profile?.image_url || '/placeholder-avatar.png'}
          alt="Profile"
          roundedCircle
          width={120}
          height={120}
          className="mb-3 object-fit-cover"
        />
        <h5 className="mb-1">{profile?.username}</h5>
        <div className="text-muted small mb-3">{profile?.email}</div>
        <ListGroup>
          <ListGroup.Item
            action
            active={activeSection === 'personal'}
            onClick={() => setActiveSection('personal')}
          >
            Personal Information
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === 'password'}
            onClick={() => setActiveSection('password')}
          >
            Password
          </ListGroup.Item>
          <ListGroup.Item
            action
            active={activeSection === 'requests'}
            onClick={() => setActiveSection('requests')}
          >
            My Requests
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );

  const PersonalInfo = () => (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Personal Information</span>
        {!personalEdit ? (
          <Button type="button" variant="outline-primary" size="sm" onClick={() => setPersonalEdit(true)}>Edit</Button>
        ) : (
          <div className="d-flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdits}>Cancel</Button>
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {!personalEdit ? (
          <Row>
            <Col md={6}>
              <p><strong>Username:</strong> {profile?.username}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Status:</strong> <Badge bg={profile?.status === 'active' ? 'success' : 'secondary'}>{profile?.status}</Badge></p>
            </Col>
            <Col md={6}>
              <p><strong>Phone:</strong> {profile?.phone || '-'}</p>
              <p><strong>Address:</strong> {profile?.address || '-'}</p>
              {profile?.role === 'worker' && (
                <>
                  <p><strong>Skills:</strong> {profile?.skills || '-'}</p>
                  <p><strong>Experience:</strong> {profile?.experience || '-'}</p>
                </>
              )}
            </Col>
          </Row>
        ) : (
          <Form noValidate onSubmit={handleEditSave}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control value={editForm.username} onChange={e=>setEditForm({...editForm, username: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control value={editForm.address} onChange={e=>setEditForm({...editForm, address: e.target.value})} />
                </Form.Group>
              </Col>
              {profile?.role === 'worker' && (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Skills</Form.Label>
                      <Form.Control value={editForm.skills} onChange={e=>setEditForm({...editForm, skills: e.target.value})} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Experience</Form.Label>
                      <Form.Control value={editForm.experience} onChange={e=>setEditForm({...editForm, experience: e.target.value})} />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
            <div className="mt-3">
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );

  const PasswordSection = () => (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Password</span>
        {!passwordEdit ? (
          <Button type="button" variant="outline-primary" size="sm" onClick={() => setPasswordEdit(true)}>Edit</Button>
        ) : (
          <div className="d-flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdits}>Cancel</Button>
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {!passwordEdit ? (
          <p className="text-muted">For your security, your password is hidden.</p>
        ) : (
          <Form noValidate onSubmit={handlePasswordChange} className="mt-2">
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control type="password" value={pwdForm.current_password} onChange={e=>setPwdForm({...pwdForm, current_password: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={pwdForm.new_password} onChange={e=>setPwdForm({...pwdForm, new_password: e.target.value})} />
            </Form.Group>
            <div className="mt-2">
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );

  const RequestsSection = () => (
    <Card>
      <Card.Header>My Requests</Card.Header>
      <Card.Body>
        {requests.length === 0 ? (
          <div className="text-muted">You have not submitted any service requests yet.</div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
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
                    <td>#{r.id}</td>
                    <td>{r.service_name}</td>
                    <td>{r.zone_name} / {r.area_name}</td>
                    <td>{r.title}</td>
                    <td><Badge bg={r.status === 'completed' ? 'success' : r.status === 'pending' ? 'warning' : 'info'}>{r.status}</Badge></td>
                    <td>{r.final_price != null ? `$${r.final_price}` : (r.base_price != null ? `$${r.base_price}` : '-')}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div className="container py-4">
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
    </div>
  );
};

export default UserProfile;
