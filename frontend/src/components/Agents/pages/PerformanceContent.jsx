import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaChartBar, FaChartLine, FaChartPie, FaUsers, FaTasks, FaDollarSign, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PerformanceContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/stats.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to load performance statistics');
        toast.error('Failed to load performance statistics');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load performance statistics');
      toast.error('Failed to load performance statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading performance data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Data</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadStats}>Retry</button>
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          <h4>No Performance Data Available</h4>
          <p>Performance statistics will appear here once you have service requests and worker assignments.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Performance Analytics</h2>
          <p className="text-muted">Track your service performance metrics</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaTasks className="text-primary" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{stats.totalRequests || 0}</h5>
                  <p className="text-muted mb-0">Total Requests</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaUsers className="text-success" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{stats.activeWorkers || 0}</h5>
                  <p className="text-muted mb-0">Active Workers</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaChartBar className="text-warning" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{stats.assignments || 0}</h5>
                  <p className="text-muted mb-0">Assignments</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaDollarSign className="text-info" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">${stats.revenue || 0}</h5>
                  <p className="text-muted mb-0">Revenue</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Stats */}
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Request Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Completed Requests</span>
                <span className="fw-bold">{stats.completedRequests || 0}</span>
              </div>
              <div className="progress mb-3">
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${stats.totalRequests ? (stats.completedRequests / stats.totalRequests) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Pending Requests</span>
                <span className="fw-bold">{stats.pendingRequests || 0}</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ width: `${stats.totalRequests ? (stats.pendingRequests / stats.totalRequests) * 100 : 0}%` }}
                ></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Performance Metrics</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span><FaStar className="text-warning me-1" /> Average Rating</span>
                <span className="fw-bold">{stats.avgRating || 'N/A'}</span>
              </div>
              
              <div className="d-flex justify-content-between">
                <span>Response Time</span>
                <span className="fw-bold">{stats.responseTime || 'N/A'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PerformanceContent;