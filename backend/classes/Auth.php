<?php

require_once 'DB.php';

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
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
        
        // Prepare user data for insertion
        $insertData = [
            'username' => $userData['username'],
            'email' => $userData['email'],
            'password' => $hashedPassword,
            'role' => $userData['role'],
            'status' => 'active'
        ];
        
        // Add optional fields if provided
        if (!empty($userData['image'])) {
            $insertData['image'] = $userData['image'];
        }
        
        try {
            $userId = $this->db->insert('users', $insertData);
            
            return [
                'success' => true,
                'message' => 'User registered successfully',
                'user_id' => $userId,
                'data' => [
                    'id' => $userId,
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'role' => $userData['role']
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
}

?>