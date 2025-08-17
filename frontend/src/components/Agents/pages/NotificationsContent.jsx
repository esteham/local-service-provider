import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/notifications.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setNotifications(response.data.data);
      } else {
        setError('Failed to load notifications');
        toast.error('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-success me-2" />;
      case 'warning':
        return <FaExclamationTriangle className="text-warning me-2" />;
      case 'error':
        return <FaTimesCircle className="text-danger me-2" />;
      default:
        return <FaInfoCircle className="text-info me-2" />;
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading notifications...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Notifications</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadNotifications}>Retry</button>
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
              <h2 className="mb-0">Notifications</h2>
              <p className="text-muted mb-0">Stay updated with important alerts</p>
            </div>
            <Button variant="outline-primary" onClick={loadNotifications}>
              <FaBell className="me-2" />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {notifications.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaBell size={48} className="text-muted mb-3" />
            <h5>No Notifications</h5>
            <p className="text-muted">You don't have any notifications at the moment.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item p-3 mb-3 border-start border-4 border-${getNotificationVariant(notification.type)}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start">
                          {getNotificationIcon(notification.type)}
                          <div>
                            <h6 className="mb-1">{notification.title}</h6>
                            <p className="mb-2">{notification.message}</p>
                            <small className="text-muted">
                              {formatTimeAgo(notification.created_at)}
                            </small>
                          </div>
                        </div>
                        <div>
                          <Badge bg={getNotificationVariant(notification.type)}>
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default NotificationsContent;