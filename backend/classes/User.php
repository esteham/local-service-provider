<?php

require_once 'DB.php';

class User {
    private $db;
    
    public function __construct() {
        $this->db = DB::getInstance();
    }
    
    public function getAllUsers($filters = []) {
        $sql = "SELECT id, username, email, role, status, created_at FROM users WHERE 1=1";
        $params = [];
        
        if (!empty($filters['role'])) {
            $sql .= " AND role = ?";
            $params[] = $filters['role'];
        }
        
        if (!empty($filters['status'])) {
            $sql .= " AND status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (username LIKE ? OR email LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        try {
            return [
                'success' => true,
                'data' => $this->db->fetchAll($sql, $params)
            ];
        } catch (Exception $e) {
            error_log('Get users failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve users'];
        }
    }
    
    public function getUserById($id) {
        try {
            $user = $this->db->fetch(
                "SELECT id, username, email, role, status, created_at FROM users WHERE id = ?",
                [$id]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            return [
                'success' => true,
                'data' => $user
            ];
        } catch (Exception $e) {
            error_log('Get user failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve user'];
        }
    }
    
    public function updateUser($id, $userData) {
        // Remove sensitive fields that shouldn't be updated directly
        unset($userData['password']);
        unset($userData['id']);
        
        if (empty($userData)) {
            return ['success' => false, 'message' => 'No data to update'];
        }
        
        // Validate email if provided
        if (isset($userData['email']) && !filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Invalid email format'];
        }
        
        // Validate role if provided
        if (isset($userData['role'])) {
            $validRoles = ['admin', 'agent', 'worker', 'user'];
            if (!in_array($userData['role'], $validRoles)) {
                return ['success' => false, 'message' => 'Invalid role specified'];
            }
        }
        
        // Check if username or email already exists (excluding current user)
        if (isset($userData['username']) || isset($userData['email'])) {
            $checkSql = "SELECT id FROM users WHERE (";
            $checkParams = [];
            
            if (isset($userData['username'])) {
                $checkSql .= "username = ?";
                $checkParams[] = $userData['username'];
            }
            
            if (isset($userData['email'])) {
                if (isset($userData['username'])) {
                    $checkSql .= " OR ";
                }
                $checkSql .= "email = ?";
                $checkParams[] = $userData['email'];
            }
            
            $checkSql .= ") AND id != ?";
            $checkParams[] = $id;
            
            $existingUser = $this->db->fetch($checkSql, $checkParams);
            
            if ($existingUser) {
                return ['success' => false, 'message' => 'Username or email already exists'];
            }
        }
        
        try {
            $result = $this->db->update('users', $userData, ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'User updated successfully'];
            } else {
                return ['success' => false, 'message' => 'No changes made'];
            }
        } catch (Exception $e) {
            error_log('Update user failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update user'];
        }
    }
    
    public function deleteUser($id) {
        try {
            // Check if user exists
            $user = $this->getUserById($id);
            if (!$user['success']) {
                return $user;
            }
            
            // Soft delete - update status to inactive
            $result = $this->db->update('users', ['status' => 'inactive'], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'User deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to delete user'];
            }
        } catch (Exception $e) {
            error_log('Delete user failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete user'];
        }
    }
    
    public function activateUser($id) {
        try {
            $result = $this->db->update('users', ['status' => 'active'], ['id' => $id]);
            
            if ($result) {
                return ['success' => true, 'message' => 'User activated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to activate user'];
            }
        } catch (Exception $e) {
            error_log('Activate user failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to activate user'];
        }
    }
    
    public function getUserStats() {
        try {
            $stats = [];
            
            // Total users
            $totalUsers = $this->db->fetch("SELECT COUNT(*) as count FROM users");
            $stats['total_users'] = $totalUsers['count'];
            
            // Active users
            $activeUsers = $this->db->fetch("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
            $stats['active_users'] = $activeUsers['count'];
            
            // Users by role
            $roleStats = $this->db->fetchAll(
                "SELECT role, COUNT(*) as count FROM users WHERE status = 'active' GROUP BY role"
            );
            
            foreach ($roleStats as $roleStat) {
                $stats['users_by_role'][$roleStat['role']] = $roleStat['count'];
            }
            
            // Recent registrations (last 30 days)
            $recentUsers = $this->db->fetch(
                "SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
            );
            $stats['recent_registrations'] = $recentUsers['count'];
            
            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            error_log('Get user stats failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve user statistics'];
        }
    }
    
    public function getUserProfile($id) {
        try {
            $user = $this->db->fetch(
                "SELECT u.id, u.username, u.address, u.email, u.role, u.status, u.created_at, u.phone, u.image,
                        w.phone AS worker_phone, w.address AS worker_address, w.skills, w.experience, w.hourly_rate, w.availability
                 FROM users u
                 LEFT JOIN workers w ON u.id = w.user_id
                 WHERE u.id = ?",
                [$id]
            );
            
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
            
            // Use worker address if available, otherwise use user address
            if (empty($user['worker_address']) && !empty($user['address'])) {
                $user['address'] = $user['address'];
            } else if (!empty($user['worker_address'])) {
                $user['address'] = $user['worker_address'];
            }
            
            // Clean up the worker_address field from the result
            unset($user['worker_address']);
            
            return [
                'success' => true,
                'data' => $user
            ];
        } catch (Exception $e) {
            error_log('Get user profile failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to retrieve user profile'];
        }
    }
    
    public function updateUserProfile($id, $profileData) {
        try {
            $this->db->beginTransaction();
            
            // Update user table
            if (isset($profileData['username']) || isset($profileData['email']) || isset($profileData['phone'])) {
                $userData = [];
                if (isset($profileData['username'])) {
                    $userData['username'] = $profileData['username'];
                }
                if (isset($profileData['email'])) {
                    $userData['email'] = $profileData['email'];
                }
                if (isset($profileData['phone'])) {
                    $userData['phone'] = $profileData['phone'];
                }
                if (isset($profileData['address'])) {
                    $userData['address'] = $profileData['address'];
                }
                
                $this->db->update('users', $userData, ['id' => $id]);
            }
            
            // Update worker profile if user is a worker
            $user = $this->db->fetch("SELECT role FROM users WHERE id = ?", [$id]);
            if ($user && $user['role'] === 'worker') {
                $workerData = [];
                $workerFields = ['phone', 'address', 'skills', 'experience', 'hourly_rate', 'availability'];
                
                foreach ($workerFields as $field) {
                    if (isset($profileData[$field])) {
                        $workerData[$field] = $profileData[$field];
                    }
                }
                
                if (!empty($workerData)) {
                    // Check if worker profile exists
                    $existingWorker = $this->db->fetch("SELECT id FROM workers WHERE user_id = ?", [$id]);
                    
                    if ($existingWorker) {
                        $this->db->update('workers', $workerData, ['user_id' => $id]);
                    } else {
                        $workerData['user_id'] = $id;
                        $this->db->insert('workers', $workerData);
                    }
                }
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Profile updated successfully'];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log('Update user profile failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update profile'];
        }
    }
}

?>