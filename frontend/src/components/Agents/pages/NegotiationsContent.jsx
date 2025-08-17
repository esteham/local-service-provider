import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHandshake, FaSync, FaDollarSign, FaPercentage } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const NegotiationsContent = () => {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNegotiations();
  }, []);

  const loadNegotiations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/negotiations.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setNegotiations(response.data.data);
      } else {
        setError('Failed to load negotiations');
        toast.error('Failed to load negotiations');
      }
    } catch (err) {
      console.error('Error loading negotiations:', err);
      setError('Failed to load negotiations');
      toast.error('Failed to load negotiations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      assigned: { variant: 'info', text: 'Assigned' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading negotiations...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Negotiations</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadNegotiations}>Retry</button>
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
              <h2 className="mb-0">Price Negotiations</h2>
              <p className="text-muted mb-0">Manage service request price negotiations</p>
            </div>
            <Button variant="outline-primary" onClick={loadNegotiations}>
              <FaSync className="me-2" />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Negotiations List */}
      {negotiations.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaHandshake size={48} className="text-muted mb-3" />
            <h5>No Active Negotiations</h5>
            <p className="text-muted">Price negotiations will appear here when customers request price adjustments.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Service Request</th>
                        <th>Customer</th>
                        <th>Base Price</th>
                        <th>Final Price</th>
                        <th>Difference</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {negotiations.map((negotiation) => (
                        <tr key={negotiation.id}>
                          <td>
                            <div>
                              <strong>{negotiation.title}</strong>
                              <br />
                              <small className="text-muted">{negotiation.service_name}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              {negotiation.customer_name}
                              <br />
                              <small className="text-muted">{negotiation.customer_phone}</small>
                            </div>
                          </td>
                          <td>{formatCurrency(negotiation.base_price)}</td>
                          <td>{formatCurrency(negotiation.final_price)}</td>
                          <td>
                            <span className={negotiation.price_difference > 0 ? 'text-success' : 'text-danger'}>
                              {negotiation.price_difference > 0 ? '+' : ''}{formatCurrency(negotiation.price_difference)}
                            </span>
                          </td>
                          <td>{getStatusBadge(negotiation.status)}</td>
                          <td>{new Date(negotiation.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default NegotiationsContent;