<?php

require_once 'DB.php';
require_once 'EmailService.php';

class Auth {
    private $db;
    private $emailService;
    
    public function __construct() {
        $this->db = DB::getInstance();
        $this->emailService = new EmailService();
    }
    
    public function register($userData) {
        // Validate required fields
        $requiredFields = ['username', 'email', 'password', 'role'];
        foreach ($requiredFields as $field) {
            if (empty($userData[$field])) {
                return ['success' => false, 'message' => ucfirst($field) . ' is required'];
            }
        }
        
        // Validate email format
        if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Invalid email format'];
        }
        
        // Validate role
        $validRoles = ['admin', 'agent', 'worker', 'user'];
        if (!in_array($userData['role'], $validRoles)) {
            return ['success' => false, 'message' => 'Invalid role specified'];
        }
        
        // Check if username or email already exists
        $existingUser = $this->db->fetch(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [$userData['username'], $userData['email']]
        );
        
        if ($existingUser) {
            return ['success' => false, 'message' => 'Username or email already exists'];
        }
        
        // Hash password
        $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);
        
        // Determine initial status based on role
        $initialStatus = 'email_pending'; // All users start with email pending
        
        // Prepare user data for insertion
        $insertData = [
            'username' => $userData['username'],
            'email' => $userData['email'],
            'password' => $hashedPassword,
            'role' => $userData['role'],
            'status' => $initialStatus,
            'email_verified' => false
        ];
        
        // Add optional fields if provided
        if (!empty($userData['image'])) {
            $insertData['image'] = $userData['image'];
        }
        
        try {
            $userId = $this->db->insert('users', $insertData);
            
            // Generate and send OTP
            $otpCode = $this->emailService->generateOTP();
            $this->emailService->storeOTP($userId, $userData['email'], $otpCode, 'registration');
            
            $userName = trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? ''));
            $emailResult = $this->emailService->sendOTPEmail($userId, $userData['email'], $otpCode, $userName);
            
            if (!$emailResult['success']) {
                // If email fails, we still keep the user but log the error
                error_log('OTP email failed for user ' . $userId . ': ' . $emailResult['message']);
            }
            
            return [
                'success' => true,
                'message' => 'Registration successful. Please check your email for the OTP verification code.',
                'user_id' => $userId,
                'requires_otp' => true,
                'data' => [
                    'id' => $userId,
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'role' => $userData['role'],
                    'status' => $initialStatus,
                    'email_verified' => false
                ]
            ];
        } catch (Exception $e) {
            error_log('Registration failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Registration failed'];
        }
    }
    
    public function login($username, $password) {
        if (empty($username) || empty($password)) {
            return ['success' => false, 'message' => 'Username and password are required'];
        }
        
        try {
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 'active'",
                [$username, $username]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }
            
            if (!password_verify($password, $user['password'])) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }
            
            // Update last login
            $this->db->update('users', 
                ['last_login' => date('Y-m-d H:i:s')], 
                ['id' => $user['id']]
            );
            
            // Start session
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ];
            
            return [
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ];
        } catch (Exception $e) {
            error_log('Login failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Login failed'];
        }
    }
    
    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }
    
    public function getCurrentUser() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (isset($_SESSION['user'])) {
            return [
                'success' => true,
                'data' => $_SESSION['user']
            ];
        }
        
        return ['success' => false, 'message' => 'No user logged in'];
    }
    
    public function isLoggedIn() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        return isset($_SESSION['user']);
    }
    
    public function hasRole($role) {
        if (!$this->isLoggedIn()) {
            return false;
        }
        
        return $_SESSION['user']['role'] === $role;
    }
    
    public function hasAnyRole($roles) {
        if (!$this->isLoggedIn()) {
            return false;
        }
        
        return in_array($_SESSION['user']['role'], $roles);
    }
    
    public function changePassword($userId, $currentPassword, $newPassword) {
        if (empty($currentPassword) || empty($newPassword)) {
            return ['success' => false, 'message' => 'Current and new passwords are required'];
        }
        
        if (strlen($newPassword) < 6) {
            return ['success' => false, 'message' => 'New password must be at least 6 characters long'];
        }
        
        try {
            $user = $this->db->fetch("SELECT password FROM users WHERE id = ?", [$userId]);
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            if (!password_verify($currentPassword, $user['password'])) {
                return ['success' => false, 'message' => 'Current password is incorrect'];
            }
            
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            $this->db->update('users', 
                ['password' => $hashedPassword], 
                ['id' => $userId]
            );
            
            return ['success' => true, 'message' => 'Password changed successfully'];
        } catch (Exception $e) {
            error_log('Password change failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Password change failed'];
        }
    }
    
    public function resetPassword($email) {
        if (empty($email)) {
            return ['success' => false, 'message' => 'Email is required'];
        }
        
        try {
            $user = $this->db->fetch("SELECT id, username FROM users WHERE email = ?", [$email]);
            
            if (!$user) {
                return ['success' => false, 'message' => 'Email not found'];
            }
            
            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $resetExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $this->db->update('users', 
                [
                    'reset_token' => $resetToken,
                    'reset_token_expiry' => $resetExpiry
                ], 
                ['id' => $user['id']]
            );
            
            return [
                'success' => true,
                'message' => 'Password reset token generated',
                'data' => ['reset_token' => $resetToken]
            ];
        } catch (Exception $e) {
            error_log('Password reset failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Password reset failed'];
        }
    }
    
    public function verifyResetToken($token) {
        if (empty($token)) {
            return ['success' => false, 'message' => 'Reset token is required'];
        }
        
        try {
            $user = $this->db->fetch(
                "SELECT id, username, email FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
                [$token]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'Invalid or expired reset token'];
            }
            
            return [
                'success' => true,
                'data' => $user
            ];
        } catch (Exception $e) {
            error_log('Token verification failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Token verification failed'];
        }
    }
    
    public function updatePasswordWithToken($token, $newPassword) {
        $tokenVerification = $this->verifyResetToken($token);
        
        if (!$tokenVerification['success']) {
            return $tokenVerification;
        }
        
        if (strlen($newPassword) < 6) {
            return ['success' => false, 'message' => 'Password must be at least 6 characters long'];
        }
        
        try {
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            $this->db->update('users', 
                [
                    'password' => $hashedPassword,
                    'reset_token' => null,
                    'reset_token_expiry' => null
                ], 
                ['id' => $tokenVerification['data']['id']]
            );
            
            return ['success' => true, 'message' => 'Password updated successfully'];
        } catch (Exception $e) {
            error_log('Password update failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Password update failed'];
        }
    }
    
    /**
     * Verify OTP and activate user account
     */
    public function verifyOTP($userId, $otpCode) {
        try {
            // Get user details
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE id = ?",
                [$userId]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            // Verify OTP
            $otpResult = $this->emailService->verifyOTP($userId, $otpCode, 'registration');
            
            if (!$otpResult['success']) {
                // If OTP is invalid, increment attempt count
                if ($otpCode) {
                    $this->emailService->incrementOTPAttempt($userId, $otpCode, 'registration');
                }
                return $otpResult;
            }
            
            // Determine final status based on role
            $finalStatus = 'active';
            if (in_array($user['role'], ['worker', 'agent'])) {
                $finalStatus = 'pending'; // Workers and agents need admin approval
            }
            
            // Update user status and email verification
            $this->db->update('users', [
                'status' => $finalStatus,
                'email_verified' => true,
                'email_verified_at' => date('Y-m-d H:i:s')
            ], ['id' => $userId]);
            
            $message = 'Email verified successfully.';
            if ($finalStatus === 'pending') {
                $message .= ' Your account is now pending admin approval.';
            } else {
                $message .= ' Your account is now active.';
            }
            
            return [
                'success' => true,
                'message' => $message,
                'data' => [
                    'id' => $userId,
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'status' => $finalStatus,
                    'email_verified' => true
                ]
            ];
            
        } catch (Exception $e) {
            error_log('OTP verification failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'OTP verification failed'];
        }
    }
    
    /**
     * Resend OTP to user
     */
    public function resendOTP($userId) {
        try {
            // Get user details
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE id = ?",
                [$userId]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            if ($user['email_verified']) {
                return ['success' => false, 'message' => 'Email is already verified'];
            }
            
            // Check if user can receive new OTP (rate limiting)
            $recentOTP = $this->db->fetch(
                "SELECT * FROM otp_verifications 
                 WHERE user_id = ? AND otp_type = 'registration' 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
                 ORDER BY created_at DESC LIMIT 1",
                [$userId]
            );
            
            if ($recentOTP) {
                return ['success' => false, 'message' => 'Please wait before requesting a new OTP'];
            }
            
            // Generate and send new OTP
            $otpCode = $this->emailService->generateOTP();
            $this->emailService->storeOTP($userId, $user['email'], $otpCode, 'registration');
            
            $emailResult = $this->emailService->sendOTPEmail($userId, $user['email'], $otpCode, $user['username']);
            
            if (!$emailResult['success']) {
                return ['success' => false, 'message' => 'Failed to send OTP email'];
            }
            
            return ['success' => true, 'message' => 'OTP sent successfully'];
            
        } catch (Exception $e) {
            error_log('Resend OTP failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to resend OTP'];
        }
    }
    
    /**
     * Admin approve user (for workers and agents)
     */
    public function approveUser($userId, $adminId) {
        try {
            // Verify admin permissions
            $admin = $this->db->fetch(
                "SELECT role FROM users WHERE id = ? AND role = 'admin'",
                [$adminId]
            );
            
            if (!$admin) {
                return ['success' => false, 'message' => 'Admin access required'];
            }
            
            // Get user details
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE id = ?",
                [$userId]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            if (!$user['email_verified']) {
                return ['success' => false, 'message' => 'User must verify email first'];
            }
            
            if ($user['status'] !== 'pending') {
                return ['success' => false, 'message' => 'User is not pending approval'];
            }
            
            // Approve user
            $this->db->update('users', [
                'status' => 'active'
            ], ['id' => $userId]);
            
            return [
                'success' => true,
                'message' => 'User approved successfully',
                'data' => [
                    'id' => $userId,
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'status' => 'active'
                ]
            ];
            
        } catch (Exception $e) {
            error_log('User approval failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'User approval failed'];
        }
    }
}

?>