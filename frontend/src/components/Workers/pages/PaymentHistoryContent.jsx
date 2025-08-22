import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const PaymentHistoryContent = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentStats, setPaymentStats] = useState({});
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setIsLoading(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/backend/api/workers/payment_history.php?action=history`, { withCredentials: true }),
        axios.get(`${BASE_URL}/backend/api/workers/payment_history.php?action=stats`, { withCredentials: true })
      ]);

      if (historyRes.data.success) {
        setPaymentHistory(historyRes.data.data);
      }

      if (statsRes.data.success) {
        setPaymentStats(statsRes.data.data.stats);
        setMonthlyEarnings(statsRes.data.data.monthly_earnings || []);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPaymentSlip = async (paymentId, slipNumber) => {
    try {
      const response = await axios.get(`${BASE_URL}/backend/api/workers/payment_history.php?action=slip&payment_id=${paymentId}`, { withCredentials: true });
      
      if (response.data.success) {
        const slip = response.data.data;
        
        // Create a PDF document
        const doc = new jsPDF();
        
        // Set font properties
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("PAYMENT RECEIPT", 105, 20, null, null, "center");
        
        // Add a line separator
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        // Reset font for content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        
        // Add payment details
        const startY = 40;
        const lineHeight = 10;
        
        doc.text(`Receipt #: ${slip.slip_number}`, 20, startY);
        doc.text(`Service: ${slip.service_name}`, 20, startY + lineHeight);
        doc.text(`Customer: ${slip.user_name}`, 20, startY + lineHeight * 2);
        doc.text(`Amount: $${slip.amount}`, 20, startY + lineHeight * 3);
        doc.text(`Payment Method: ${slip.payment_method.charAt(0).toUpperCase() + slip.payment_method.slice(1)}`, 20, startY + lineHeight * 4);
        doc.text(`Payment Date: ${new Date(slip.payment_date).toLocaleString()}`, 20, startY + lineHeight * 5);
        
        if (slip.transaction_id) {
          doc.text(`Transaction ID: ${slip.transaction_id}`, 20, startY + lineHeight * 6);
        }
        
        doc.text("Status: Completed and Verified", 20, startY + lineHeight * 7);
        
        if (slip.service_description) {
          doc.text(`Description: ${slip.service_description}`, 20, startY + lineHeight * 8);
        }
        
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, startY + lineHeight * 9);
        doc.text("Local Service Provider - Worker Receipt", 20, startY + lineHeight * 10);
        
        // Save the PDF
        doc.save(`worker-receipt-${slipNumber}.pdf`);
        
        toast.success('Payment receipt downloaded successfully!');
      } else {
        toast.error('Failed to download payment receipt');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('An error occurred while downloading receipt');
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
    }).format(amount || 0);
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
        <h2 className="h4 mb-0">Payment History</h2>
        <Badge bg="success" className="px-3 py-2">
          {paymentHistory.length} {paymentHistory.length === 1 ? 'Payment' : 'Payments'}
        </Badge>
      </div>

      {/* Payment Statistics */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-2">
                <i className="bi bi-cash-stack fs-2"></i>
              </div>
              <h3 className="h4 text-success">{formatCurrency(paymentStats.total_earnings)}</h3>
              <p className="text-muted mb-0">Total Earnings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-primary mb-2">
                <i className="bi bi-receipt fs-2"></i>
              </div>
              <h3 className="h4 text-primary">{paymentStats.completed_payments || 0}</h3>
              <p className="text-muted mb-0">Completed Payments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-info mb-2">
                <i className="bi bi-cash fs-2"></i>
              </div>
              <h3 className="h4 text-info">{paymentStats.cash_payments || 0}</h3>
              <p className="text-muted mb-0">Cash Payments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-credit-card fs-2"></i>
              </div>
              <h3 className="h4 text-warning">{paymentStats.online_payments || 0}</h3>
              <p className="text-muted mb-0">Online Payments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment History Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center">
            <i className="bi bi-clock-history text-primary me-2"></i>
            <h5 className="mb-0">Payment Records</h5>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-receipt fs-1 text-muted"></i>
              </div>
              <h5 className="text-muted">No payment history found</h5>
              <p className="text-muted">Your completed payments will appear here</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Receipt #</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.payment_id}>
                      <td>
                        <div className="fw-semibold text-primary">
                          {payment.slip_number || `#${payment.payment_id}`}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{payment.service_name}</div>
                          <div className="small text-muted">{payment.service_title}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{payment.customer_name}</div>
                          <div className="small text-muted">{payment.customer_email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-success">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td>
                        <Badge bg={payment.payment_method === 'cash' ? 'success' : 'primary'}>
                          <i className={`bi ${payment.payment_method === 'cash' ? 'bi-cash' : 'bi-credit-card'} me-1`}></i>
                          {payment.payment_method.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td>
                        <Badge bg={payment.otp_verified ? 'success' : 'warning'}>
                          <i className={`bi ${payment.otp_verified ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                          {payment.otp_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        {payment.slip_number && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => downloadPaymentSlip(payment.payment_id, payment.slip_number)}
                          >
                            <i className="bi bi-download me-1"></i>
                            Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Monthly Earnings Chart (if data available) */}
      {monthlyEarnings.length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart text-info me-2"></i>
              <h5 className="mb-0">Monthly Earnings Overview</h5>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              {monthlyEarnings.map((earning) => (
                <Col md={2} key={earning.month} className="text-center mb-3">
                  <div className="border rounded p-3">
                    <div className="fw-bold text-primary">
                      {new Date(earning.year, earning.month - 1).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="h5 text-success mt-2">
                      {formatCurrency(earning.monthly_total)}
                    </div>
                    <div className="small text-muted">
                      {earning.monthly_count} payments
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PaymentHistoryContent;
