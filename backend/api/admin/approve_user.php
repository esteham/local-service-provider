<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../middleware/auth.php';
require_once '../../classes/Auth.php';

// Check authentication and admin role
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    require_once '../../config/database.php';
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input)) {
        echo json_encode(['success' => false, 'message' => 'No input data received']);
        exit;
    }
    
    // Validate required fields
    if (empty($input['user_id']) || empty($input['role'])) {
        echo json_encode(['success' => false, 'message' => 'User ID and role are required']);
        exit;
    }
    
    $userId = (int)$input['user_id'];
    $role = $input['role'];
    $adminId = $_SESSION['user']['id'];
    
    DatabaseConfig::createDatabase();
    $pdo = DatabaseConfig::getConnection();
    
    // Start transaction to ensure both updates succeed
    $pdo->beginTransaction();
    
    try {
        // First, update the users table status to 'active'
        $userStmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ? AND status = 'pending'");
        $userStmt->execute([$userId]);
        
        if ($userStmt->rowCount() === 0) {
            throw new Exception('User not found or already processed');
        }
        
        // Then update the role-specific table
        if ($role === 'worker') {
            $roleStmt = $pdo->prepare("UPDATE workers SET status = 'active' WHERE user_id = ? AND status = 'pending'");
            $roleStmt->execute([$userId]);
            
            if ($roleStmt->rowCount() === 0) {
                throw new Exception('Worker record not found or already processed');
            }
            
            $message = 'Worker approved successfully';
        } elseif ($role === 'agent') {
            $roleStmt = $pdo->prepare("UPDATE agents SET status = 'active' WHERE user_id = ? AND status = 'pending'");
            $roleStmt->execute([$userId]);
            
            if ($roleStmt->rowCount() === 0) {
                throw new Exception('Agent record not found or already processed');
            }
            
            $message = 'Agent approved successfully';
        } else {
            throw new Exception('Invalid role specified');
        }
        
        // Commit the transaction
        $pdo->commit();
        $result = ['success' => true, 'message' => $message];
        
    } catch (Exception $e) {
        // Rollback the transaction on error
        $pdo->rollback();
        $result = ['success' => false, 'message' => $e->getMessage()];
    }
    
    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(400);
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    error_log('User approval error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>
