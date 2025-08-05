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
    
}
