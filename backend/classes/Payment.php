<?php
require_once 'DB.php';
require_once 'EmailService.php';

class Payment {
    private $db;
    private $emailService;
    
    public function __construct() {
        $this->db = new DB();
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
            
            $paymentId = $this->db->create('payments', $paymentData);
            
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
     * Process cash payment - generate verification code and send to worker
     */
    public function processCashPayment($paymentId) {
        try {
            $this->db->beginTransaction();
            
            // Get payment details
            $payment = $this->getPaymentById($paymentId);
            if (!$payment) {
                throw new Exception('Payment not found');
            }
            
            // Generate 6-digit verification code
            $verificationCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Set expiry time (24 hours from now)
            $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            // Save verification code
            $codeData = [
                'payment_id' => $paymentId,
                'service_request_id' => $payment['service_request_id'],
                'worker_id' => $payment['worker_id'],
                'verification_code' => $verificationCode,
                'expires_at' => $expiresAt
            ];
            
            $this->db->create('cash_payment_codes', $codeData);
            
            // Update payment status
            $this->db->update('payments', 
                ['payment_status' => 'processing'],
                ['id' => $paymentId]
            );
            
            // Get worker email
            $worker = $this->db->query(
                "SELECT u.email, u.first_name, u.last_name, w.phone 
                 FROM workers w 
                 JOIN users u ON w.user_id = u.id 
                 WHERE w.id = ?",
                [$payment['worker_id']]
            );
            
            if ($worker) {
                // Send verification code to worker's email
                $emailSent = $this->emailService->sendCashPaymentCode(
                    $worker[0]['email'],
                    $worker[0]['first_name'] . ' ' . $worker[0]['last_name'],
                    $verificationCode,
                    $payment['amount'],
                    $payment['service_request_id']
                );
                
                if (!$emailSent) {
                    error_log("Failed to send cash payment code email to worker");
                }
            }
            
            // Log action
            $this->logPaymentAction($paymentId, 'cash_code_generated', [
                'verification_code' => $verificationCode,
                'expires_at' => $expiresAt
            ]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'verification_code' => $verificationCode,
                'expires_at' => $expiresAt,
                'message' => 'Cash payment initiated. Verification code sent to worker.'
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
     * Verify cash payment code entered by worker
     */
    public function verifyCashPaymentCode($verificationCode, $workerId) {
        try {
            $this->db->beginTransaction();
            
            // Find valid code
            $codeRecord = $this->db->query(
                "SELECT * FROM cash_payment_codes 
                 WHERE verification_code = ? AND worker_id = ? 
                 AND is_used = FALSE AND expires_at > NOW()",
                [$verificationCode, $workerId]
            );
            
            if (!$codeRecord) {
                return [
                    'success' => false,
                    'message' => 'Invalid or expired verification code'
                ];
            }
            
            $code = $codeRecord[0];
            
            // Mark code as used
            $this->db->update('cash_payment_codes',
                ['is_used' => true, 'used_at' => date('Y-m-d H:i:s')],
                ['id' => $code['id']]
            );
            
            // Complete payment
            $this->completePayment($code['payment_id']);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'payment_id' => $code['payment_id'],
                'service_request_id' => $code['service_request_id'],
                'message' => 'Cash payment verified and completed successfully'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Cash payment verification failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to verify payment code: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Complete payment (mark as paid)
     */
    public function completePayment($paymentId) {
        try {
            $this->db->beginTransaction();
            
            $payment = $this->getPaymentById($paymentId);
            if (!$payment) {
                throw new Exception('Payment not found');
            }
            
            // Update payment status
            $this->db->update('payments',
                ['payment_status' => 'completed', 'paid_at' => date('Y-m-d H:i:s')],
                ['id' => $paymentId]
            );
            
            // Update service request status
            $this->db->update('service_requests',
                ['status' => 'paid', 'payment_status' => 'paid'],
                ['id' => $payment['service_request_id']]
            );
            
            // Calculate worker earnings
            $this->calculateWorkerEarnings($paymentId);
            
            // Log completion
            $this->logPaymentAction($paymentId, 'completed', [
                'completed_at' => date('Y-m-d H:i:s')
            ]);
            
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
        $commissionRate = $this->db->query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'payment_commission_rate'"
        );
        $commissionRate = $commissionRate ? floatval($commissionRate[0]['setting_value']) : 10.00;
        
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
        
        $this->db->create('worker_earnings', $earningsData);
    }
    
    /**
     * Get payment by ID
     */
    public function getPaymentById($paymentId) {
        $result = $this->db->query("SELECT * FROM payments WHERE id = ?", [$paymentId]);
        return $result ? $result[0] : null;
    }
    
    /**
     * Get payments for a service request
     */
    public function getPaymentsByServiceRequest($serviceRequestId) {
        return $this->db->query(
            "SELECT * FROM payments WHERE service_request_id = ? ORDER BY created_at DESC",
            [$serviceRequestId]
        );
    }
    
    /**
     * Get user's payment history
     */
    public function getUserPayments($userId, $limit = 50, $offset = 0) {
        return $this->db->query(
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
        
        $this->db->create('payment_logs', $logData);
    }
    
    /**
     * Process online payment (placeholder for payment gateway integration)
     */
    public function processOnlinePayment($paymentId, $paymentData) {
        try {
            $this->db->beginTransaction();
            
            // Update payment with transaction details
            $updateData = [
                'payment_status' => 'processing',
                'transaction_id' => $paymentData['transaction_id'] ?? null,
                'gateway_response' => json_encode($paymentData)
            ];
            
            $this->db->update('payments', $updateData, ['id' => $paymentId]);
            
            // Log processing
            $this->logPaymentAction($paymentId, 'processing', $paymentData);
            
            // Simulate payment processing (replace with actual gateway integration)
            $success = $this->simulatePaymentGateway($paymentData);
            
            if ($success) {
                $this->completePayment($paymentId);
                $this->db->commit();
                
                return [
                    'success' => true,
                    'message' => 'Online payment completed successfully'
                ];
            } else {
                $this->db->update('payments', 
                    ['payment_status' => 'failed'], 
                    ['id' => $paymentId]
                );
                
                $this->logPaymentAction($paymentId, 'failed', ['reason' => 'Gateway processing failed']);
                $this->db->commit();
                
                return [
                    'success' => false,
                    'message' => 'Payment processing failed'
                ];
            }
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Online payment processing failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to process online payment: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Simulate payment gateway processing (replace with actual gateway)
     */
    private function simulatePaymentGateway($paymentData) {
        // Simulate 95% success rate for demo purposes
        return rand(1, 100) <= 95;
    }
}
?>
