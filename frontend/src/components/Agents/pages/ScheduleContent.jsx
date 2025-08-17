import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPhone, FaSync } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ScheduleContent = () => {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/schedule.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setScheduleItems(response.data.data);
      } else {
        setError('Failed to load schedule');
        toast.error('Failed to load schedule');
      }
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Failed to load schedule');
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      assigned: { variant: 'info', text: 'Assigned' },
      in_progress: { variant: 'primary', text: 'In Progress' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getUpcomingItems = () => {
    return scheduleItems.filter(item => {
      if (!item.scheduled_at) return false;
      const scheduledDate = new Date(item.scheduled_at);
      const now = new Date();
      return scheduledDate >= now;
    });
  };

  const getPastItems = () => {
    return scheduleItems.filter(item => {
      if (!item.scheduled_at) return true; // Items without scheduled date go to past
      const scheduledDate = new Date(item.scheduled_at);
      const now = new Date();
      return scheduledDate < now;
    });
  };

  const upcomingItems = getUpcomingItems();
  const pastItems = getPastItems();

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading schedule...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Schedule</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadSchedule}>Retry</button>
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
              <h2 className="mb-0">Schedule Management</h2>
              <p className="text-muted mb-0">View and manage your upcoming service appointments</p>
            </div>
            <Button variant="outline-primary" onClick={loadSchedule}>
              <FaSync className="me-2" />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Upcoming Appointments */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Upcoming Appointments ({upcomingItems.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {upcomingItems.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">No upcoming appointments scheduled.</p>
                </div>
              ) : (
                <div className="schedule-list">
                  {upcomingItems.map((item) => (
                    <div key={item.id} className="schedule-item border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{item.title}</h5>
                          <p className="text-muted mb-2">{item.service_name}</p>
                          
                          <div className="d-flex flex-wrap gap-3">
                            <div>
                              <small className="text-muted">
                                <FaClock className="me-1" />
                                {formatDateTime(item.scheduled_at)}
                              </small>
                            </div>
                            
                            <div>
                              <small className="text-muted">
                                <FaMapMarkerAlt className="me-1" />
                                {item.address}
                              </small>
                            </div>
                            
                            <div>
                              <small className="text-muted">
                                <FaPhone className="me-1" />
                                {item.customer_phone}
                              </small>
                            </div>
                            
                            <div>
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <small className="text-muted">
                            Customer: {item.customer_name}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Past Appointments */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Past Appointments ({pastItems.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {pastItems.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">No past appointments.</p>
                </div>
              ) : (
                <div className="schedule-list">
                  {pastItems.map((item) => (
                    <div key={item.id} className="schedule-item border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{item.title}</h5>
                          <p className="text-muted mb-2">{item.service_name}</p>
                          
                          <div className="d-flex flex-wrap gap-3">
                            <div>
                              <small className="text-muted">
                                <FaClock className="me-1" />
                                {item.scheduled_at ? formatDateTime(item.scheduled_at) : 'Not scheduled'}
                              </small>
                            </div>
                            
                            <div>
                              <small className="text-muted">
                                <FaMapMarkerAlt className="me-1" />
                                {item.address}
                              </small>
                            </div>
                            
                            <div>
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <small className="text-muted">
                            Customer: {item.customer_name}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ScheduleContent;