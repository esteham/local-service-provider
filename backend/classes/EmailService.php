<?php

require_once 'DB.php';
require_once 'class_functions.php';

class EmailService {
    private $db;
    private $admin;
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        $this->db = DB::getInstance();
        $this->admin = new Admin();
        $this->fromEmail = 'deepseekspider@gmail.com';
        $this->fromName = 'Local Service Provider';
    }
    
    /**
     * Generate a 6-digit OTP code
     */
    public function generateOTP() {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }
    
    /**
     * Store OTP in database
     */
    public function storeOTP($userId, $email, $otpCode, $type = 'registration') {
        // Delete any existing OTPs for this user and type
        $this->db->query(
            "DELETE FROM otp_verifications WHERE user_id = ? AND otp_type = ?",
            [$userId, $type]
        );
        
        // Store new OTP (expires in 10 minutes)
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        
        return $this->db->insert('otp_verifications', [
            'user_id' => $userId,
            'email' => $email,
            'otp_code' => $otpCode,
            'otp_type' => $type,
            'expires_at' => $expiresAt
        ]);
    }
    
    /**
     * Verify OTP code
     */
    public function verifyOTP($userId, $otpCode, $type = 'registration') {
        // Get OTP record
        $otpRecord = $this->db->fetch(
            "SELECT * FROM otp_verifications 
             WHERE user_id = ? AND otp_code = ? AND otp_type = ? AND is_used = FALSE
             ORDER BY created_at DESC LIMIT 1",
            [$userId, $otpCode, $type]
        );
        
        if (!$otpRecord) {
            return ['success' => false, 'message' => 'Invalid OTP code'];
        }
        
        // Check if OTP has expired
        if (strtotime($otpRecord['expires_at']) < time()) {
            return ['success' => false, 'message' => 'OTP code has expired'];
        }
        
        // Check attempts
        if ($otpRecord['attempts'] >= $otpRecord['max_attempts']) {
            return ['success' => false, 'message' => 'Maximum verification attempts exceeded'];
        }
        
        // Mark OTP as used
        $this->db->update('otp_verifications', 
            ['is_used' => true, 'attempts' => $otpRecord['attempts'] + 1],
            ['id' => $otpRecord['id']]
        );
        
        return ['success' => true, 'message' => 'OTP verified successfully'];
    }
    
    /**
     * Increment OTP attempt count
     */
    public function incrementOTPAttempt($userId, $otpCode, $type = 'registration') {
        $this->db->query(
            "UPDATE otp_verifications 
             SET attempts = attempts + 1 
             WHERE user_id = ? AND otp_code = ? AND otp_type = ?",
            [$userId, $otpCode, $type]
        );
    }
    
    /**
     * Send OTP email using the existing Admin sendMail function
     */
    public function sendOTPEmail($userId, $email, $otpCode, $userName = '') {
        // Log email attempt
        $emailLogId = $this->db->insert('email_logs', [
            'user_id' => $userId,
            'email' => $email,
            'email_type' => 'otp_verification',
            'subject' => 'Email Verification - OTP Code',
            'status' => 'pending'
        ]);
        
        try {
            $subject = 'Email Verification - OTP Code';
            $message = $this->getOTPEmailTemplate($otpCode, $userName);
            
            // Use the existing Admin sendMail function
            $emailSent = $this->admin->sendMail($email, $message, $subject);
            
            if ($emailSent) {
                // Update email log as sent
                $this->db->update('email_logs', [
                    'status' => 'sent',
                    'sent_at' => date('Y-m-d H:i:s')
                ], ['id' => $emailLogId]);
                
                return ['success' => true, 'message' => 'OTP sent successfully'];
            } else {
                // Get error from session if available
                $errorMessage = isset($_SESSION['mailError']) ? $_SESSION['mailError'] : 'Email service unavailable';
                
                // Update email log as failed
                $this->db->update('email_logs', [
                    'status' => 'failed',
                    'error_message' => $errorMessage
                ], ['id' => $emailLogId]);
                
                return ['success' => false, 'message' => 'Failed to send OTP email: ' . $errorMessage];
            }
            
        } catch (Exception $e) {
            // Update email log as failed
            $this->db->update('email_logs', [
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ], ['id' => $emailLogId]);
            
            error_log('Email sending failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send OTP email: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get OTP email template
     */
    private function getOTPEmailTemplate($otpCode, $userName = '') {
        $greeting = $userName ? "Hi $userName," : "Hi,";
        
        return "
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #2c3e50; text-align: center;'>Email Verification</h2>
                
                <p>$greeting</p>
                
                <p>Thank you for registering with Local Service Provider. To complete your registration, please verify your email address using the OTP code below:</p>
                
                <div style='background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;'>
                    <h1 style='color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;'>$otpCode</h1>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This OTP is valid for 10 minutes only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this verification, please ignore this email</li>
                </ul>
                
                <p>If you have any questions, please contact our support team.</p>
                
                <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
                <p style='font-size: 12px; color: #666; text-align: center;'>
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        </body>
        </html>
        ";
    }
    

    /**
     * Send cash payment verification code to worker
     */
    public function sendCashPaymentCode($workerEmail, $workerName, $verificationCode, $amount, $serviceRequestId) {
        try {
            $subject = 'Cash Payment Verification Code';
            $message = $this->getCashPaymentEmailTemplate($verificationCode, $workerName, $amount, $serviceRequestId);
            
            // Use the existing Admin sendMail function
            $emailSent = $this->admin->sendMail($workerEmail, $message, $subject);
            
            if ($emailSent) {
                return ['success' => true, 'message' => 'Cash payment code sent successfully'];
            } else {
                $errorMessage = isset($_SESSION['mailError']) ? $_SESSION['mailError'] : 'Email service unavailable';
                return ['success' => false, 'message' => 'Failed to send cash payment code: ' . $errorMessage];
            }
            
        } catch (Exception $e) {
            error_log('Cash payment email sending failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send cash payment code: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get cash payment email template
     */
    private function getCashPaymentEmailTemplate($verificationCode, $workerName, $amount, $serviceRequestId) {
        return "
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #28a745; text-align: center;'>Cash Payment Verification</h2>
                
                <p>Hi $workerName,</p>
                
                <p>A customer has completed their service and chosen to pay with cash. Please use the verification code below to confirm receipt of payment:</p>
                
                <div style='background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;'>
                    <h3 style='margin: 0 0 10px 0; color: #28a745;'>Service Details:</h3>
                    <p style='margin: 5px 0;'><strong>Service Request ID:</strong> #$serviceRequestId</p>
                    <p style='margin: 5px 0;'><strong>Amount:</strong> \$$amount</p>
                </div>
                
                <div style='background-color: #28a745; color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;'>
                    <h1 style='margin: 0; font-size: 32px; letter-spacing: 5px;'>$verificationCode</h1>
                    <p style='margin: 10px 0 0 0; font-size: 14px;'>Verification Code</p>
                </div>
                
                <div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;'>
                    <h4 style='margin: 0 0 10px 0; color: #856404;'>Important Instructions:</h4>
                    <ul style='margin: 0; padding-left: 20px; color: #856404;'>
                        <li>Only enter this code after you have received the cash payment from the customer</li>
                        <li>This code expires in 24 hours</li>
                        <li>Do not share this code with anyone</li>
                        <li>Contact support if you have any issues</li>
                    </ul>
                </div>
                
                <p>To confirm the payment, please:</p>
                <ol>
                    <li>Log into your worker dashboard</li>
                    <li>Go to the 'Payments' section</li>
                    <li>Enter the verification code above</li>
                </ol>
                
                <p>Thank you for your service!</p>
                
                <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
                <p style='font-size: 12px; color: #666; text-align: center;'>
                    This is an automated email. Please do not reply to this message.<br>
                    Local Service Provider - Worker Payment System
                </p>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Clean up expired OTPs
     */
    public function cleanupExpiredOTPs() {
        return $this->db->query(
            "DELETE FROM otp_verifications WHERE expires_at < NOW()"
        );
    }
    
    /**
     * Get OTP statistics for a user
     */
    public function getOTPStats($userId) {
        return $this->db->fetch(
            "SELECT 
                COUNT(*) as total_otps,
                SUM(CASE WHEN is_used = TRUE THEN 1 ELSE 0 END) as used_otps,
                SUM(CASE WHEN expires_at < NOW() THEN 1 ELSE 0 END) as expired_otps
             FROM otp_verifications 
             WHERE user_id = ?",
            [$userId]
        );
    }
    
    /**
     * Send payment OTP to worker
     */
    public function sendPaymentOTP($workerEmail, $workerName, $otpCode, $amount, $serviceName, $customerName, $expiresAt) {
        try {
            $subject = 'Payment OTP - Service Completed';
            $message = $this->getPaymentOTPEmailTemplate($otpCode, $workerName, $amount, $serviceName, $customerName, $expiresAt);
            
            // Use the existing Admin sendMail function
            $emailSent = $this->admin->sendMail($workerEmail, $message, $subject);
            
            if ($emailSent) {
                error_log("Payment OTP email sent successfully to: $workerEmail");
                return true;
            } else {
                error_log("Failed to send payment OTP email to: $workerEmail");
                return false;
            }
            
        } catch (Exception $e) {
            error_log('Payment OTP email sending failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get payment OTP email template
     */
    private function getPaymentOTPEmailTemplate($otpCode, $workerName, $amount, $serviceName, $customerName, $expiresAt) {
        $expiryTime = date('M j, Y g:i A', strtotime($expiresAt));
        
        return "
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #007bff; text-align: center;'>Payment OTP - Service Completed</h2>
                
                <p>Hi $workerName,</p>
                
                <p>Great news! Your service has been completed and the customer is ready to pay. They have chosen cash payment and need the OTP below to confirm the transaction.</p>
                
                <div style='background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #007bff;'>
                    <h3 style='margin: 0 0 10px 0; color: #007bff;'>Service Details:</h3>
                    <p style='margin: 5px 0;'><strong>Service:</strong> $serviceName</p>
                    <p style='margin: 5px 0;'><strong>Customer:</strong> $customerName</p>
                    <p style='margin: 5px 0;'><strong>Amount:</strong> \$$amount</p>
                </div>
                
                <div style='background-color: #007bff; color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;'>
                    <h1 style='margin: 0; font-size: 32px; letter-spacing: 5px;'>$otpCode</h1>
                    <p style='margin: 10px 0 0 0; font-size: 14px;'>Payment OTP Code</p>
                </div>
                
                <div style='background-color: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 20px 0;'>
                    <h4 style='margin: 0 0 10px 0; color: #0c5460;'>How it works:</h4>
                    <ol style='margin: 0; padding-left: 20px; color: #0c5460;'>
                        <li>The customer will enter this OTP in their profile</li>
                        <li>Once entered, the payment will be marked as completed</li>
                        <li>You'll receive a payment confirmation email with the receipt</li>
                        <li>The payment will appear in your Payment History</li>
                    </ol>
                </div>
                
                <div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;'>
                    <p style='margin: 0; color: #856404;'><strong>⏰ Expires:</strong> $expiryTime</p>
                    <p style='margin: 5px 0 0 0; color: #856404; font-size: 14px;'>This OTP will expire in 24 hours</p>
                </div>
                
                <p>Thank you for providing excellent service!</p>
                
                <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
                <p style='font-size: 12px; color: #666; text-align: center;'>
                    This is an automated email. Please do not reply to this message.<br>
                    Local Service Provider - Payment System
                </p>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Send payment slip email to user or worker
     */
    public function sendPaymentSlipEmail($email, $name, $slipData, $recipientType = 'user') {
        try {
            $subject = 'Payment Receipt - ' . $slipData['slip_number'];
            $message = $this->getPaymentSlipEmailTemplate($name, $slipData, $recipientType);
            
            // Use the existing Admin sendMail function
            $emailSent = $this->admin->sendMail($email, $message, $subject);
            
            if ($emailSent) {
                error_log("Payment slip email sent successfully to: $email");
                return true;
            } else {
                error_log("Failed to send payment slip email to: $email");
                return false;
            }
            
        } catch (Exception $e) {
            error_log('Payment slip email sending failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get payment slip email template
     */
    private function getPaymentSlipEmailTemplate($name, $slipData, $recipientType) {
        $paymentDate = date('M j, Y g:i A', strtotime($slipData['payment_date']));
        $isUser = $recipientType === 'user';
        $otherParty = $isUser ? $slipData['worker_name'] : $slipData['user_name'];
        $greeting = $isUser ? 'Thank you for your payment!' : 'Payment received for your service!';
        
        return "
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <div style='text-align: center; margin-bottom: 30px;'>
                    <h1 style='color: #28a745; margin: 0;'>Payment Receipt</h1>
                    <p style='color: #666; margin: 5px 0;'>$greeting</p>
                </div>
                
                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                    <h2 style='color: #28a745; margin: 0 0 15px 0; text-align: center;'>Receipt #{$slipData['slip_number']}</h2>
                    
                    <table style='width: 100%; border-collapse: collapse;'>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;'>Service:</td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd;'>{$slipData['service_name']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;'>" . ($isUser ? 'Service Provider:' : 'Customer:') . "</td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd;'>$otherParty</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;'>Payment Method:</td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd;'>" . ucfirst($slipData['payment_method']) . "</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;'>Payment Date:</td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd;'>$paymentDate</td>
                        </tr>
                        " . ($slipData['transaction_id'] ? "
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;'>Transaction ID:</td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #ddd;'>{$slipData['transaction_id']}</td>
                        </tr>
                        " : "") . "
                        <tr>
                            <td style='padding: 12px 0; font-weight: bold; font-size: 18px; color: #28a745;'>Total Amount:</td>
                            <td style='padding: 12px 0; font-weight: bold; font-size: 18px; color: #28a745;'>\${$slipData['amount']}</td>
                        </tr>
                    </table>
                </div>
                
                " . ($slipData['service_description'] ? "
                <div style='background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h4 style='margin: 0 0 10px 0; color: #495057;'>Service Description:</h4>
                    <p style='margin: 0; color: #6c757d;'>{$slipData['service_description']}</p>
                </div>
                " : "") . "
                
                <div style='background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;'>
                    <p style='margin: 0; color: #155724;'><strong>✓ Payment Status:</strong> Completed and Verified</p>
                    <p style='margin: 5px 0 0 0; color: #155724; font-size: 14px;'>This receipt serves as proof of payment.</p>
                </div>
                
                " . ($isUser ? "
                <div style='text-align: center; margin: 20px 0;'>
                    <p style='color: #666;'>You can download this receipt from your profile anytime.</p>
                </div>
                " : "") . "
                
                <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
                <p style='font-size: 12px; color: #666; text-align: center;'>
                    This is an automated receipt. Please keep this for your records.<br>
                    Local Service Provider - Payment System<br>
                    Receipt generated on " . date('M j, Y g:i A') . "
                </p>
            </div>
        </body>
        </html>
        ";
    }
    
}
