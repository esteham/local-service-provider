import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { FaCog, FaSync, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const SettingsContent = () => {
  const [settings, setSettings] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    zone_name: '',
    area_name: '',
    join_date: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/settings.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSettings(response.data.data);
      } else {
        setError('Failed to load settings');
        toast.error('Failed to load settings');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/settings.php`,
        {
          first_name: settings.first_name,
          last_name: settings.last_name,
          phone: settings.phone,
          address: settings.address
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Settings updated successfully');
        loadSettings(); // Reload to get updated data
      } else {
        toast.error(response.data.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading settings...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Settings</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadSettings}>Retry</button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Account Settings</h2>
              <p className="text-muted mb-0">Manage your agent profile and preferences</p>
            </div>
            <Button variant="outline-primary" onClick={loadSettings}>
              <FaSync className="me-2" />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaCog className="me-2" />
                Profile Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={settings.first_name || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={settings.last_name || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={settings.email || ''}
                        onChange={handleInputChange}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={settings.phone || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={settings.address || ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Account Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted">Account Status</small>
                <h6>{settings.status || 'N/A'}</h6>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">Zone</small>
                <h6>{settings.zone_name || 'N/A'}</h6>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">Area</small>
                <h6>{settings.area_name || 'N/A'}</h6>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">Member Since</small>
                <h6>
                  {settings.join_date 
                    ? new Date(settings.join_date).toLocaleDateString()
                    : 'N/A'}
                </h6>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">Last Updated</small>
                <h6>
                  {settings.updated_at 
                    ? new Date(settings.updated_at).toLocaleDateString()
                    : 'N/A'}
                </h6>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsContent;