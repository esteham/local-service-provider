<?php
require_once 'DB.php';
require_once 'EmailService.php';

class Payment {
    private $db;
    private $emailService;
    
    public function __construct() {
        $this->db = DB::getInstance();
        $this->emailService = new EmailService();
    }
    
    /**
     * Create a new payment record
     */
    public function createPayment($serviceRequestId, $userId, $workerId, $amount, $paymentMethod) {
        try {
            $this->db->beginTransaction();
            
            // Create payment record
            $paymentData = [
                'service_request_id' => $serviceRequestId,
                'user_id' => $userId,
                'worker_id' => $workerId,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending'
            ];
            
            $paymentId = $this->db->insert('payments', $paymentData);
            
            // Update service request status to payment_pending
            $this->db->update('service_requests', 
                ['status' => 'payment_pending', 'payment_status' => 'pending', 'payment_method' => $paymentMethod],
                ['id' => $serviceRequestId]
            );
            
            // Log payment creation
            $this->logPaymentAction($paymentId, 'created', [
                'payment_method' => $paymentMethod,
                'amount' => $amount
            ]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'payment_id' => $paymentId,
                'message' => 'Payment created successfully'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Payment creation failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to create payment: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Process cash payment - generate OTP and send to worker
     */
    public function processCashPayment($paymentId) {
        try {
            $this->db->beginTransaction();
            
            // Get payment details with service and user info
            $payment = $this->db->fetch(
                "SELECT p.*, sr.title, sr.service_id, s.name as service_name, s.description as service_description,
                        u.username as user_name, u.email as user_email
                 FROM payments p
                 JOIN service_requests sr ON p.service_request_id = sr.id
                 LEFT JOIN services s ON sr.service_id = s.id
                 JOIN users u ON p.user_id = u.id
                 WHERE p.id = ?",
                [$paymentId]
            );
            
            if (!$payment) {
                throw new Exception('Payment not found');
            }
            
            // Generate 6-digit OTP code
            $otpCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Set expiry time (24 hours from now)
            $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            // Save OTP code
            $otpData = [
                'payment_id' => $paymentId,
                'service_request_id' => $payment['service_request_id'],
                'user_id' => $payment['user_id'],
                'worker_id' => $payment['worker_id'],
                'otp_code' => $otpCode,
                'expires_at' => $expiresAt
            ];
            
            $this->db->insert('payment_otps', $otpData);
            
            // Update payment status
            $this->db->update('payments', 
                ['payment_status' => 'processing'],
                ['id' => $paymentId]
            );
            
            // Get worker email
            $worker = $this->db->fetch(
                "SELECT u.email, u.username, w.first_name, w.last_name, w.phone 
                 FROM workers w 
                 JOIN users u ON w.user_id = u.id 
                 WHERE w.id = ?",
                [$payment['worker_id']]
            );
            
            if ($worker) {
                // Send OTP to worker's email
                $workerName = ($worker['first_name'] && $worker['last_name']) 
                    ? $worker['first_name'] . ' ' . $worker['last_name']
                    : $worker['username'];
                
                $emailSent = $this->emailService->sendPaymentOTP(
                    $worker['email'],
                    $workerName,
                    $otpCode,
                    $payment['amount'],
                    $payment['service_name'] ?? $payment['title'],
                    $payment['user_name'],
                    $expiresAt
                );
                
                if (!$emailSent) {
                    error_log("Failed to send OTP email to worker");
                }
            }
            
            // Log cash payment initiation
            $this->logPaymentAction($paymentId, 'cash_payment_initiated', [
                'otp_sent' => isset($emailSent) ? $emailSent : false,
                'expires_at' => $expiresAt
            ]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'otp_code' => $otpCode, // For development/testing - remove in production
                'expires_at' => $expiresAt,
                'message' => 'OTP generated and sent to worker'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Cash payment processing failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to process cash payment: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Verify OTP entered by user for payment confirmation
     */
    public function verifyPaymentOTP($otpCode, $userId) {
        try {
            $this->db->beginTransaction();
            
            // Find valid OTP code
            $otpRecord = $this->db->fetch(
                "SELECT * FROM payment_otps 
                 WHERE otp_code = ? AND user_id = ? AND expires_at > NOW() AND is_used = 0",
                [$otpCode, $userId]
            );
            
            if (!$otpRecord) {
                return [
                    'success' => false,
                    'message' => 'Invalid or expired OTP code'
                ];
            }
            
            // Mark OTP as used
            $this->db->update('payment_otps',
                ['is_used' => 1, 'used_at' => date('Y-m-d H:i:s')],
                ['id' => $otpRecord['id']]
            );
            
            // Update payment with OTP verification
            $this->db->update('payments',
                ['otp_verified' => 1, 'otp_verified_at' => date('Y-m-d H:i:s')],
                ['id' => $otpRecord['payment_id']]
            );
            
            // Complete payment directly (avoid nested transaction)
            $payment = $this->getPaymentById($otpRecord['payment_id']);
            
            // Update payment status to completed
            $this->db->update('payments', 
                [
                    'payment_status' => 'completed',
                    'completed_at' => date('Y-m-d H:i:s')
                ],
                ['id' => $otpRecord['payment_id']]
            );
            
            // Update service request status
            $this->db->update('service_requests',
                ['status' => 'paid', 'payment_status' => 'completed'],
                ['id' => $payment['service_request_id']]
            );
            
            // Generate payment slip
            $slipResult = $this->generatePaymentSlip($otpRecord['payment_id']);
            
            // Send confirmation emails
            $this->sendPaymentConfirmationEmails($otpRecord['payment_id']);
            
            // Log the action
            $this->logPaymentAction($otpRecord['payment_id'], 'otp_verified');
            
            $this->db->commit();
            
            return [
                'success' => true,
                'payment_id' => $otpRecord['payment_id'],
                'slip_number' => $slipResult['slip_number'] ?? null,
                'message' => 'Payment verified and completed successfully'
            ];    
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Payment OTP verification failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to verify payment: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Complete payment (mark as paid)
     */
    public function completePayment($paymentId) {
        try {
            $this->db->beginTransaction();
            
            // Update payment status
            $this->db->update('payments', 
                [
                    'payment_status' => 'completed',
                    'completed_at' => date('Y-m-d H:i:s')
                ],
                ['id' => $paymentId]
            );
            
            // Update service request status
            $payment = $this->getPaymentById($paymentId);
            $this->db->update('service_requests',
                ['status' => 'paid', 'payment_status' => 'completed'],
                ['id' => $payment['service_request_id']]
            );
            
            // Calculate worker earnings
            $this->calculateWorkerEarnings($paymentId);
            
            // Generate payment slip if not already generated
            if (!$payment['slip_generated']) {
                $this->generatePaymentSlip($paymentId);
            }
            
            // Send payment confirmation emails to both user and worker
            $this->sendPaymentConfirmationEmails($paymentId);
            
            // Log payment completion
            $this->logPaymentAction($paymentId, 'completed');
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Payment completed successfully'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Payment completion failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to complete payment: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Calculate and record worker earnings
     */
    private function calculateWorkerEarnings($paymentId) {
        $payment = $this->getPaymentById($paymentId);
        if (!$payment) return;
        
        // Get commission rate from settings
        $commissionRateRecord = $this->db->fetch(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'payment_commission_rate'"
        );
        $commissionRate = $commissionRateRecord ? floatval($commissionRateRecord['setting_value']) : 10.00;
        
        $grossAmount = floatval($payment['amount']);
        $commissionAmount = ($grossAmount * $commissionRate) / 100;
        $netAmount = $grossAmount - $commissionAmount;
        
        $earningsData = [
            'worker_id' => $payment['worker_id'],
            'payment_id' => $paymentId,
            'service_request_id' => $payment['service_request_id'],
            'gross_amount' => $grossAmount,
            'commission_rate' => $commissionRate,
            'commission_amount' => $commissionAmount,
            'net_amount' => $netAmount,
            'status' => 'pending'
        ];
        
        $this->db->insert('worker_earnings', $earningsData);
    }
    
    /**
     * Get payment by ID
     */
    public function getPaymentById($paymentId) {
        return $this->db->fetch("SELECT * FROM payments WHERE id = ?", [$paymentId]);
    }
    
    /**
     * Get payments for a service request
     */
    public function getPaymentsByServiceRequest($serviceRequestId) {
        return $this->db->fetchAll(
            "SELECT * FROM payments WHERE service_request_id = ? ORDER BY created_at DESC",
            [$serviceRequestId]
        );
    }
    
    /**
     * Get user's payment history
     */
    public function getUserPayments($userId, $limit = 50, $offset = 0) {
        return $this->db->fetchAll(
            "SELECT p.*, sr.title, sr.service_type, s.name as service_name
             FROM payments p
             JOIN service_requests sr ON p.service_request_id = sr.id
             LEFT JOIN services s ON sr.service_id = s.id
             WHERE p.user_id = ?
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?",
            [$userId, $limit, $offset]
        );
    }
    
    /**
     * Log payment action for audit trail
     */
    private function logPaymentAction($paymentId, $action, $details = null) {
        $logData = [
            'payment_id' => $paymentId,
            'action' => $action,
            'details' => $details ? json_encode($details) : null,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ];
        
        $this->db->insert('payment_logs', $logData);
    }
    

    
    /**
     * Generate payment slip
     */
    public function generatePaymentSlip($paymentId) {
        try {
            // Get payment details with all related information
            $paymentDetails = $this->db->fetch(
                "SELECT p.*, sr.title, sr.service_id, s.name as service_name, s.description as service_description,
                        u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                        w_user.first_name as worker_first_name, w_user.last_name as worker_last_name, w.phone as worker_phone
                 FROM payments p
                 JOIN service_requests sr ON p.service_request_id = sr.id
                 LEFT JOIN services s ON sr.service_id = s.id
                 JOIN users u ON p.user_id = u.id
                 JOIN workers w ON p.worker_id = w.id
                 JOIN users w_user ON w.user_id = w_user.id
                 WHERE p.id = ?",
                [$paymentId]
            );
            
            if (!$paymentDetails) {
                throw new Exception('Payment not found');
            }
            
            // Generate unique slip number
            $slipNumber = 'PS' . date('Ymd') . str_pad($paymentId, 6, '0', STR_PAD_LEFT);
            
            // Create payment slip record
            $slipData = [
                'payment_id' => $paymentId,
                'service_request_id' => $paymentDetails['service_request_id'],
                'user_id' => $paymentDetails['user_id'],
                'worker_id' => $paymentDetails['worker_id'],
                'slip_number' => $slipNumber,
                'service_name' => $paymentDetails['service_name'] ?? $paymentDetails['title'],
                'service_description' => $paymentDetails['service_description'] ?? '',
                'amount' => $paymentDetails['amount'],
                'payment_method' => $paymentDetails['payment_method'],
                'payment_date' => $paymentDetails['completed_at'] ?? date('Y-m-d H:i:s'),
                'worker_name' => $paymentDetails['worker_first_name'] . ' ' . $paymentDetails['worker_last_name'],
                'worker_phone' => $paymentDetails['worker_phone'],
                'user_name' => $paymentDetails['user_first_name'] . ' ' . $paymentDetails['user_last_name'],
                'user_email' => $paymentDetails['user_email'],
                'transaction_id' => $paymentDetails['transaction_id']
            ];
            
            $this->db->insert('payment_slips', $slipData);
            
            // Mark payment as slip generated
            $this->db->update('payments', 
                ['slip_generated' => 1],
                ['id' => $paymentId]
            );
            
            return [
                'success' => true,
                'slip_number' => $slipNumber,
                'message' => 'Payment slip generated successfully'
            ];
            
        } catch (Exception $e) {
            error_log("Payment slip generation failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to generate payment slip: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get payment slip by payment ID
     */
    public function getPaymentSlip($paymentId) {
        return $this->db->fetch("SELECT * FROM payment_slips WHERE payment_id = ?", [$paymentId]);
    }
    
    /**
     * Get payment slip by slip number
     */
    public function getPaymentSlipByNumber($slipNumber) {
        return $this->db->fetch("SELECT * FROM payment_slips WHERE slip_number = ?", [$slipNumber]);
    }
    
    /**
     * Send payment confirmation emails to both user and worker
     */
    private function sendPaymentConfirmationEmails($paymentId) {
        try {
            // Get payment slip details
            $slip = $this->getPaymentSlip($paymentId);
            if (!$slip) {
                error_log("Payment slip not found for payment ID: $paymentId");
                return false;
            }
            
            // Get worker email
            $worker = $this->db->fetch(
                "SELECT u.email FROM workers w JOIN users u ON w.user_id = u.id WHERE w.id = ?",
                [$slip['worker_id']]
            );
            
            // Send email to user
            $userEmailSent = $this->emailService->sendPaymentSlipEmail(
                $slip['user_email'],
                $slip['user_name'],
                $slip,
                'user'
            );
            
            // Send email to worker
            $workerEmailSent = false;
            if ($worker) {
                $workerEmailSent = $this->emailService->sendPaymentSlipEmail(
                    $worker['email'],
                    $slip['worker_name'],
                    $slip,
                    'worker'
                );
            }
            
            // Log email sending results
            $this->logPaymentAction($paymentId, 'confirmation_emails_sent', [
                'user_email_sent' => $userEmailSent,
                'worker_email_sent' => $workerEmailSent
            ]);
            
            return $userEmailSent && $workerEmailSent;
            
        } catch (Exception $e) {
            error_log("Failed to send payment confirmation emails: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get worker payment history
     */
    public function getWorkerPaymentHistory($workerId, $limit = 50, $offset = 0) {
        return $this->db->fetchAll(
            "SELECT * FROM worker_payment_history WHERE worker_id = ? ORDER BY payment_date DESC LIMIT ? OFFSET ?",
            [$workerId, $limit, $offset]
        );
    }
    
    /**
     * Get user payment history with slip information
     */
    public function getUserPaymentHistoryWithSlips($userId, $limit = 50, $offset = 0) {
        return $this->db->fetchAll(
            "SELECT 
                p.id as payment_id,
                p.user_id,
                p.worker_id,
                p.amount,
                p.payment_method,
                p.payment_status,
                p.otp_verified,
                p.created_at as payment_date,
                p.updated_at as last_updated,
                sr.id as service_request_id,
                sr.title as service_title,
                s.name as service_name,
                s.description as service_description,
                CONCAT(w_user.first_name, ' ', w_user.last_name) as worker_name,
                w.phone as worker_phone,
                ps.slip_number,
                ps.transaction_id,
                ps.created_at as slip_created_at
            FROM payments p
            JOIN service_requests sr ON p.service_request_id = sr.id
            LEFT JOIN services s ON sr.service_id = s.id
            JOIN workers w ON p.worker_id = w.id
            JOIN users w_user ON w.user_id = w_user.id
            LEFT JOIN payment_slips ps ON p.id = ps.payment_id
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?",
            [$userId, $limit, $offset]
        );
    }


}
?>
