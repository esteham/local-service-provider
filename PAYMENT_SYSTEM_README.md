# Payment System Implementation

## Overview

This document describes the comprehensive payment system implemented for the local service provider application. When a worker completes a service, users now see a "Pay Now" option instead of just "Completed" status, supporting both online and cash payments with verification.

## Features

### 🔄 Payment Flow
1. **Service Completion**: Worker marks service as completed
2. **Payment Options**: User sees "Pay Now" button with two options:
   - **Online Payment**: Instant processing with payment gateway
   - **Cash Payment**: Verification code sent to worker's email
3. **Cash Verification**: Worker enters 6-digit code to confirm cash receipt
4. **Payment Completion**: Status updates to "paid", earnings calculated

### 💳 Payment Methods
- **Online Payment**: Simulated payment gateway (ready for real integration)
- **Cash Payment**: Email-based verification system with worker confirmation

### 📧 Email System
- Professional email templates for cash payment verification codes
- 24-hour code expiration with clear instructions
- Integration with existing email service (Gmail SMTP)

### 💰 Commission System
- Configurable platform commission rates (default: 10%)
- Automatic worker earnings calculation
- Detailed earnings breakdown with gross/net amounts

## Database Schema

### New Tables Created

```sql
-- Main payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_request_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('online', 'cash', 'card') NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL,
    gateway_response JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL
);

-- Cash payment verification codes
CREATE TABLE cash_payment_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    worker_id INT NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker earnings tracking
CREATE TABLE worker_earnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    commission_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment audit logs
CREATE TABLE payment_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Tables

```sql
-- Added payment fields to service_requests
ALTER TABLE service_requests 
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
ADD COLUMN payment_method ENUM('online', 'cash', 'card') NULL;

-- Updated status enum to include payment states
ALTER TABLE service_requests 
MODIFY COLUMN status ENUM('pending', 'assigned', 'in_progress', 'completed', 'payment_pending', 'paid', 'cancelled') DEFAULT 'pending';
```

## Backend Implementation

### 1. Payment Class (`/backend/classes/Payment.php`)

Main payment processing class with methods:

```php
// Create payment record
createPayment($serviceRequestId, $userId, $workerId, $amount, $paymentMethod)

// Process cash payment (generate code)
processCashPayment($paymentId)

// Verify cash payment code
verifyCashPaymentCode($verificationCode, $workerId)

// Complete payment
completePayment($paymentId)

// Process online payment
processOnlinePayment($paymentId, $paymentData)
```

### 2. API Endpoints

#### User Payment API (`/backend/api/user/payment.php`)
- `GET ?action=history` - Get user payment history
- `GET ?action=pending` - Get pending payments for completed services
- `POST action=initiate` - Create new payment
- `POST action=process_online` - Process online payment

#### Worker Verification API (`/backend/api/workers/verify_payment.php`)
- `GET ?action=pending_codes` - Get pending cash payment codes
- `GET ?action=earnings` - Get worker earnings history
- `POST action=verify_code` - Verify cash payment code

### 3. Email Service Updates

Enhanced `EmailService.php` with:
- `sendCashPaymentCode()` - Send verification codes to workers
- Professional email templates with service details
- Clear instructions for cash payment verification

## Frontend Implementation

### 1. User Interface Updates

#### UserProfile Component
- **Payment Modal**: Professional payment selection interface
- **Payment Options**: Clear distinction between online and cash payments
- **Status Updates**: Real-time payment status indicators
- **Action Buttons**: "Pay Now" for completed services

```jsx
// Payment status display logic
{request.status === 'completed' && isPaymentPending(request.id) ? (
  <Button variant="success" onClick={() => handlePayNow(request)}>
    <i className="bi bi-credit-card me-1"></i>
    Pay Now
  </Button>
) : request.status === 'paid' ? (
  <Badge bg="success">
    <i className="bi bi-check-circle me-1"></i>
    Paid
  </Badge>
) : request.status === 'payment_pending' ? (
  <Badge bg="warning">
    <i className="bi bi-clock me-1"></i>
    Payment Processing
  </Badge>
) : (
  <span className="text-muted">-</span>
)}
```

### 2. Worker Dashboard Updates

#### PaymentVerificationContent Component
- **Pending Payments**: Table showing cash payments awaiting verification
- **Verification Modal**: 6-digit code entry with validation
- **Earnings History**: Detailed earnings breakdown with commissions
- **Quick Stats**: Payment summary dashboard

#### Worker Sidebar
- Added "Payment Verification" menu item with shield icon
- Integrated with existing worker dashboard navigation

## Setup Instructions

### 1. Database Setup

```bash
# Run the payment system schema
mysql -u username -p database_name < backend/SQL\ File/payment_system_schema.sql
```

### 2. Backend Configuration

Ensure these settings exist in `system_settings` table:
```sql
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('payment_commission_rate', '10.00', 'Platform commission rate percentage'),
('cash_payment_code_expiry', '24', 'Cash payment verification code expiry in hours'),
('payment_gateway_enabled', 'true', 'Enable online payment gateway'),
('payment_methods_enabled', 'online,cash', 'Comma-separated list of enabled payment methods');
```

### 3. Email Configuration

Ensure your email service is configured in `class_functions.php`:
- SMTP settings for Gmail or your email provider
- From email address configured in `EmailService.php`

### 4. Frontend Environment

Update your `.env` file:
```env
VITE_API_URL=http://localhost
```

## Usage Guide

### For Users
1. **View Services**: Check service requests in user profile
2. **Pay for Completed Services**: Click "Pay Now" for completed services
3. **Choose Payment Method**: Select online payment or cash payment
4. **Online Payment**: Instant processing and completion
5. **Cash Payment**: Pay worker in cash, they'll verify with email code

### For Workers
1. **Access Payment Verification**: Go to "Payment Verification" in worker dashboard
2. **View Pending Payments**: See services awaiting cash payment verification
3. **Receive Email Code**: Check email for 6-digit verification codes
4. **Verify Payment**: Enter code after receiving cash from customer
5. **Track Earnings**: View detailed earnings with commission breakdown

### For Admins
1. **Monitor Payments**: View payment logs and audit trails
2. **Manage Commission**: Update commission rates in system settings
3. **Handle Disputes**: Access payment logs for troubleshooting

## Security Features

- **Code Expiration**: Verification codes expire in 24 hours
- **Single Use**: Each code can only be used once
- **Worker Validation**: Only assigned worker can verify payment
- **Audit Trail**: Complete logging of all payment actions
- **IP Tracking**: Payment logs include IP addresses and user agents

## Testing

### Test Cash Payment Flow
1. Complete a service as a worker
2. Log in as the customer user
3. Go to profile → Service Requests
4. Click "Pay Now" for the completed service
5. Select "Cash Payment"
6. Check worker's email for verification code
7. Log in as worker → Payment Verification
8. Enter the 6-digit code to complete payment

### Test Online Payment Flow
1. Complete a service as a worker
2. Log in as the customer user
3. Click "Pay Now" → "Online Payment"
4. Payment processes automatically (simulated)
5. Status updates to "Paid"

## Future Enhancements

- **Real Payment Gateway**: Integration with Stripe, PayPal, or local gateways
- **Mobile App**: Push notifications for payment codes
- **Bulk Payments**: Pay for multiple services at once
- **Payment Scheduling**: Schedule payments for later
- **Refund System**: Handle payment refunds and disputes
- **Analytics**: Payment analytics and reporting dashboard

## Troubleshooting

### Common Issues

1. **Email not sending**: Check SMTP configuration in `class_functions.php`
2. **Code not working**: Verify code hasn't expired (24 hours)
3. **Payment not completing**: Check database transactions and error logs
4. **API errors**: Ensure proper authentication and CORS headers

### Debug Tools

- Check `payment_logs` table for audit trail
- Monitor browser console for API errors
- Review server error logs for backend issues
- Test email delivery with test accounts

## Support

For issues or questions about the payment system:
1. Check the troubleshooting section above
2. Review payment logs in the database
3. Test with the provided test scenarios
4. Contact system administrator for database access issues

---

**Note**: This payment system is production-ready but uses simulated online payments. For live deployment, integrate with a real payment gateway like Stripe or PayPal.
