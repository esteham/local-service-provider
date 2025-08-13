import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const PaymentVerificationContent = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, earningsRes] = await Promise.all([
        axios.get(`${BASE_URL}/backend/api/workers/verify_payment.php?action=pending_codes`, { withCredentials: true }),
        axios.get(`${BASE_URL}/backend/api/workers/verify_payment.php?action=earnings`, { withCredentials: true })
      ]);

      if (pendingRes.data.success) {
        setPendingPayments(pendingRes.data.data);
      }

      if (earningsRes.data.success) {
        setEarnings(earningsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/backend/api/workers/verify_payment.php`,
        {
          action: 'verify_code',
          verification_code: verificationCode
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Payment verified successfully!');
        setShowVerifyModal(false);
        setVerificationCode('');
        fetchData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify payment code');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Payment Verification</h2>
        <Button 
          variant="success" 
          onClick={() => setShowVerifyModal(true)}
          disabled={pendingPayments.length === 0}
        >
          <i className="bi bi-shield-check me-2"></i>
          Verify Payment Code
        </Button>
      </div>

      <Row className="g-4">
        {/* Pending Cash Payments */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-warning bg-opacity-10 border-0">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock-history text-warning me-2"></i>
                <h5 className="mb-0">Pending Cash Payments</h5>
                <Badge bg="warning" className="ms-auto">
                  {pendingPayments.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle text-success fs-1 mb-3"></i>
                  <h5 className="text-muted">No pending payments</h5>
                  <p className="text-muted">All cash payments have been verified</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Service</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Expires</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            <div className="fw-semibold">{payment.service_title}</div>
                            <div className="text-muted small">#{payment.service_request_id}</div>
                          </td>
                          <td>
                            <div>{payment.customer_first_name} {payment.customer_last_name}</div>
                            <div className="text-muted small">{payment.service_name}</div>
                          </td>
                          <td className="fw-semibold text-success">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td>
                            <div className="small">
                              {formatDate(payment.expires_at)}
                            </div>
                          </td>
                          <td>
                            <Badge bg="warning" className="px-2 py-1">
                              <i className="bi bi-clock me-1"></i>
                              Awaiting Verification
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-success bg-opacity-10 border-0">
              <div className="d-flex align-items-center">
                <i className="bi bi-cash-stack text-success me-2"></i>
                <h6 className="mb-0">Payment Summary</h6>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Pending Payments</span>
                <span className="fw-bold text-warning">{pendingPayments.length}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Total Earnings</span>
                <span className="fw-bold text-success">
                  {formatCurrency(earnings.reduce((sum, earning) => sum + parseFloat(earning.net_amount || 0), 0))}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Completed Payments</span>
                <span className="fw-bold text-primary">{earnings.length}</span>
              </div>
            </Card.Body>
          </Card>

          <Alert variant="info" className="border-0">
            <Alert.Heading className="h6">
              <i className="bi bi-info-circle me-2"></i>
              How to verify payments
            </Alert.Heading>
            <ol className="mb-0 small">
              <li>Receive cash payment from customer</li>
              <li>Check your email for verification code</li>
              <li>Click "Verify Payment Code" button</li>
              <li>Enter the 6-digit code</li>
              <li>Payment will be marked as completed</li>
            </ol>
          </Alert>
        </Col>
      </Row>

      {/* Recent Earnings */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <div className="d-flex align-items-center">
            <i className="bi bi-graph-up text-primary me-2"></i>
            <h5 className="mb-0">Recent Earnings</h5>
          </div>
        </Card.Header>
        <Card.Body>
          {earnings.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-wallet text-muted fs-1 mb-3"></i>
              <h6 className="text-muted">No earnings yet</h6>
              <p className="text-muted small">Complete services to start earning</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Gross Amount</th>
                    <th>Commission</th>
                    <th>Net Earning</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.slice(0, 10).map((earning) => (
                    <tr key={earning.id}>
                      <td>
                        <div className="fw-semibold">{earning.service_title}</div>
                        <div className="text-muted small">{earning.service_type}</div>
                      </td>
                      <td>
                        {earning.customer_first_name} {earning.customer_last_name}
                      </td>
                      <td className="fw-semibold">
                        {formatCurrency(earning.gross_amount)}
                      </td>
                      <td className="text-muted">
                        -{formatCurrency(earning.commission_amount)}
                        <div className="small">({earning.commission_rate}%)</div>
                      </td>
                      <td className="fw-bold text-success">
                        {formatCurrency(earning.net_amount)}
                      </td>
                      <td>
                        <Badge bg={earning.payment_method === 'cash' ? 'success' : 'primary'}>
                          <i className={`bi ${earning.payment_method === 'cash' ? 'bi-cash' : 'bi-credit-card'} me-1`}></i>
                          {earning.payment_method}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {formatDate(earning.paid_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Verification Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-shield-check me-2"></i>
            Verify Cash Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Important:</strong> Only enter the verification code after you have received the cash payment from the customer.
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Verification Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center fs-4 letter-spacing-wide"
              style={{ letterSpacing: '0.5em' }}
            />
            <Form.Text className="text-muted">
              Check your email for the 6-digit verification code
            </Form.Text>
          </Form.Group>

          {pendingPayments.length > 0 && (
            <div className="bg-light p-3 rounded">
              <h6 className="text-muted mb-2">Pending Payments:</h6>
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="fw-semibold small">{payment.service_title}</div>
                    <div className="text-muted small">#{payment.service_request_id}</div>
                  </div>
                  <div className="fw-bold text-success">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Verifying...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Verify Payment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentVerificationContent;
