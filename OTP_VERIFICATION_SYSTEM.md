# OTP Email Verification System

This document describes the comprehensive OTP-based email verification system implemented for the local service provider application.

## Overview

The system implements a secure email verification process for user registration with the following flow:

1. **User Registration**: All users start with `email_pending` status and receive an OTP via email
2. **Email Verification**: Users must verify their email using the 6-digit OTP
3. **Account Activation**: 
   - Regular users become `active` immediately after email verification
   - Workers and agents become `pending` and require admin approval to become `active`

## Database Schema

### Required Database Changes

Run the following SQL to add the necessary tables and columns:

```sql
-- Update users table to include email verification status and pending status
ALTER TABLE users 
MODIFY COLUMN status ENUM('active', 'inactive', 'pending', 'email_pending') DEFAULT 'email_pending',
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verified_at TIMESTAMP NULL;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_type ENUM('registration', 'password_reset') DEFAULT 'registration',
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_email (user_id, email),
    INDEX idx_otp_code (otp_code),
    INDEX idx_expires_at (expires_at)
);

-- Create email logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    email_type ENUM('otp_verification', 'welcome', 'password_reset') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_email (user_id, email),
    INDEX idx_email_type (email_type),
    INDEX idx_status (status)
);
```

## Backend Implementation

### 1. EmailService Class (`/backend/classes/EmailService.php`)

Handles all email-related functionality:

- **OTP Generation**: Creates 6-digit random OTP codes
- **OTP Storage**: Stores OTPs with 10-minute expiration
- **OTP Verification**: Validates OTP codes with attempt tracking
- **Email Sending**: Simulated email sending (ready for real email service integration)
- **Rate Limiting**: Prevents OTP spam (1 minute between requests)

Key Methods:
- `generateOTP()`: Creates 6-digit OTP
- `storeOTP($userId, $email, $otpCode, $type)`: Stores OTP in database
- `verifyOTP($userId, $otpCode, $type)`: Verifies OTP code
- `sendOTPEmail($userId, $email, $otpCode, $userName)`: Sends OTP via email

### 2. Updated Auth Class (`/backend/classes/Auth.php`)

Enhanced with OTP functionality:

- **Registration**: Modified to send OTP and set `email_pending` status
- **OTP Verification**: `verifyOTP($userId, $otpCode)` method
- **OTP Resend**: `resendOTP($userId)` method with rate limiting
- **Admin Approval**: `approveUser($userId, $adminId)` for workers/agents

### 3. API Endpoints

#### `/backend/api/auth/verify_otp.php`
- **Method**: POST
- **Parameters**: `user_id`, `otp_code`
- **Purpose**: Verify OTP and activate/pending user account

#### `/backend/api/auth/resend_otp.php`
- **Method**: POST
- **Parameters**: `user_id`
- **Purpose**: Resend OTP with rate limiting

#### `/backend/api/admin/approve_user.php`
- **Method**: POST
- **Parameters**: `user_id`
- **Purpose**: Admin approval for workers/agents
- **Auth**: Requires admin authentication

## Frontend Implementation

### 1. OTPVerification Component (`/frontend/src/components/Auth/OTPVerification.jsx`)

Complete OTP verification modal with:

- **6-Digit Input**: Individual input fields for each digit
- **Auto-Focus**: Automatic focus progression
- **Paste Support**: Handles pasted OTP codes
- **Resend Functionality**: With 60-second countdown
- **Error Handling**: Comprehensive error messages
- **Success Feedback**: Role-based success messages

### 2. Updated Registration Forms

All registration forms now integrate with OTP verification:

- **UserRegistrationForm.jsx**: Shows OTP modal after successful registration
- **WorkerRegistrationForm.jsx**: OTP verification with pending approval message
- **AgentRegistrationForm.jsx**: OTP verification with pending approval message

### 3. PendingUsersContent Component (`/frontend/src/components/Admin/pages/PendingUsersContent.jsx`)

Admin interface for managing pending users:

- **User Listing**: Shows all pending users with details
- **Filtering**: Filter by role (all, worker, agent)
- **User Details**: Modal with comprehensive user information
- **Approval Actions**: Approve or reject users
- **Status Indicators**: Email verification and approval status

## User Flow

### Regular User Registration
1. User fills registration form
2. System creates user with `email_pending` status
3. OTP sent to user's email
4. User enters OTP in verification modal
5. System verifies OTP and sets status to `active`
6. User can now log in and use the system

### Worker/Agent Registration
1. Worker/Agent fills registration form
2. System creates user with `email_pending` status
3. OTP sent to user's email
4. User enters OTP in verification modal
5. System verifies OTP and sets status to `pending`
6. Admin reviews and approves the user
7. System sets status to `active`
8. User can now log in and use the system

## Security Features

### OTP Security
- **Expiration**: OTPs expire after 10 minutes
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Rate Limiting**: 1 minute between OTP requests
- **Single Use**: OTPs are marked as used after successful verification

### Email Security
- **Logging**: All email attempts are logged
- **Error Tracking**: Failed email attempts are recorded
- **Status Tracking**: Email delivery status monitoring

## Configuration

### Email Service Configuration

Currently, the system simulates email sending by logging to a file. To integrate with a real email service:

1. **Update EmailService::simulateEmailSending()** method
2. **Choose an email service**:
   - PHPMailer with SMTP
   - SendGrid API
   - AWS SES
   - Mailgun API

Example PHPMailer integration:
```php
private function sendActualEmail($email, $subject, $message) {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'your-email@gmail.com';
    $mail->Password = 'your-app-password';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('noreply@yourapp.com', 'Your App Name');
    $mail->addAddress($email);
    $mail->Subject = $subject;
    $mail->Body = $message;
    $mail->isHTML(true);
    
    return $mail->send();
}
```

### Environment Variables

Add to your `.env` file:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App Name
```

## Testing

### Manual Testing Steps

1. **User Registration**:
   - Register a new user
   - Check that OTP is generated and logged
   - Verify OTP modal appears
   - Test OTP verification with correct/incorrect codes
   - Verify user status changes to `active`

2. **Worker Registration**:
   - Register a new worker
   - Verify OTP process
   - Check status changes to `pending` after OTP verification
   - Test admin approval process

3. **Error Scenarios**:
   - Test expired OTP
   - Test maximum attempts exceeded
   - Test resend functionality
   - Test rate limiting

### Database Verification

Check the following after testing:
```sql
-- Check user status
SELECT id, username, email, status, email_verified FROM users WHERE id = [user_id];

-- Check OTP records
SELECT * FROM otp_verifications WHERE user_id = [user_id];

-- Check email logs
SELECT * FROM email_logs WHERE user_id = [user_id];
```

## Maintenance

### Cleanup Tasks

Add these to your cron jobs:

```sql
-- Clean up expired OTPs (run every hour)
DELETE FROM otp_verifications WHERE expires_at < NOW();

-- Clean up old email logs (run daily, keep last 30 days)
DELETE FROM email_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Monitoring

Monitor the following metrics:
- OTP success/failure rates
- Email delivery rates
- User verification completion rates
- Admin approval processing times

## Troubleshooting

### Common Issues

1. **OTP Not Received**:
   - Check email logs table for delivery status
   - Verify email service configuration
   - Check spam folder

2. **OTP Verification Fails**:
   - Check OTP expiration time
   - Verify attempt count hasn't exceeded limit
   - Check for typos in OTP entry

3. **Admin Approval Not Working**:
   - Verify admin authentication
   - Check user email verification status
   - Verify user status is `pending`

### Debug Queries

```sql
-- Check pending users
SELECT * FROM users WHERE status = 'pending' AND email_verified = TRUE;

-- Check failed OTP attempts
SELECT * FROM otp_verifications WHERE attempts >= max_attempts;

-- Check email delivery issues
SELECT * FROM email_logs WHERE status = 'failed';
```

## Future Enhancements

1. **SMS OTP**: Add SMS as alternative to email
2. **Two-Factor Authentication**: Extend OTP system for 2FA
3. **Bulk User Management**: Admin tools for bulk user operations
4. **Advanced Analytics**: OTP and verification analytics dashboard
5. **Custom Email Templates**: Rich HTML email templates
6. **Multi-language Support**: Localized OTP emails

This completes the comprehensive OTP email verification system implementation.
