import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaMoneyBillWave, FaSync, FaCheckCircle, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentsContent = () => {
  const [paymentData, setPaymentData] = useState({
    total_earnings: 0,
    pending_payments: 0,
    completed_payments: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/agents/payments.php`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setPaymentData(response.data.data);
      } else {
        setError('Failed to load payment data');
        toast.error('Failed to load payment data');
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payment data');
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'success', text: 'Completed' },
      pending: { variant: 'warning', text: 'Pending' },
      failed: { variant: 'danger', text: 'Failed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading payment data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Payment Data</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadPayments}>Retry</button>
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
              <h2 className="mb-0">Payment Management</h2>
              <p className="text-muted mb-0">Track your earnings and payment transactions</p>
            </div>
            <Button variant="outline-primary" onClick={loadPayments}>
              <FaSync className="me-2" />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Payment Summary */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Total Earnings</h5>
                  <p className="text-muted mb-0">Lifetime earnings</p>
                </div>
                <FaMoneyBillWave size={24} className="text-success" />
              </div>
              <h3 className="mt-3 mb-0">${paymentData.total_earnings.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Completed Payments</h5>
                  <p className="text-muted mb-0">Received payments</p>
                </div>
                <FaCheckCircle size={24} className="text-success" />
              </div>
              <h3 className="mt-3 mb-0">${paymentData.completed_payments.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Pending Payments</h5>
                  <p className="text-muted mb-0">Awaiting payment</p>
                </div>
                <FaClock size={24} className="text-warning" />
              </div>
              <h3 className="mt-3 mb-0">${paymentData.pending_payments.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Transactions */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Payment Transactions</h5>
            </Card.Header>
            <Card.Body>
              {paymentData.transactions.length === 0 ? (
                <div className="text-center py-5">
                  <FaMoneyBillWave size={48} className="text-muted mb-3" />
                  <h5>No Payment Transactions</h5>
                  <p className="text-muted">Payment transactions will appear here once you have completed service requests.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Service Request</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentData.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <div>
                              <strong>{transaction.title}</strong>
                              <br />
                              <small className="text-muted">{transaction.area_name || transaction.zone_name}</small>
                            </div>
                          </td>
                          <td>{transaction.customer_name}</td>
                          <td>${transaction.amount.toFixed(2)}</td>
                          <td>{getStatusBadge(transaction.status)}</td>
                          <td>
                            {transaction.completed_at 
                              ? new Date(transaction.completed_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentsContent;