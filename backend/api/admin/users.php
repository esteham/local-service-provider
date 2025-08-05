<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
DatabaseConfig::createDatabase();
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();

try {
    switch ($method) {
        case 'GET':
            // Check for status filter
            $statusFilter = $_GET['status'] ?? null;
            
            if ($statusFilter === 'pending') {
                // Get pending users with additional details
                $stmt = $pdo->query("
                    SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, 
                           u.role, u.status, u.created_at, u.profile_image,
                           CASE 
                               WHEN u.role = 'worker' THEN w.skills
                               WHEN u.role = 'agent' THEN a.zone_id
                               ELSE NULL
                           END as additional_info,
                           CASE 
                               WHEN u.role = 'worker' THEN z.name
                               WHEN u.role = 'agent' THEN z2.name
                               ELSE NULL
                           END as zone_name
                    FROM users u
                    LEFT JOIN workers w ON u.id = w.user_id AND u.role = 'worker'
                    LEFT JOIN zones z ON w.zone_id = z.id
                    LEFT JOIN agents a ON u.id = a.user_id AND u.role = 'agent'
                    LEFT JOIN zones z2 ON a.zone_id = z2.id
                    WHERE u.status = 'pending'
                    ORDER BY u.created_at DESC
                ");
            } else {
                // Get all users or filter by specific status
                $whereClause = '';
                if ($statusFilter) {
                    $whereClause = "WHERE status = '" . $pdo->quote($statusFilter) . "'";
                }
                
                $stmt = $pdo->query("SELECT id, username, email, role, status, created_at 
                                    FROM users 
                                    $whereClause
                                    ORDER BY created_at DESC");
            }
            
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $users
            ]);
            break;
            
        case 'POST':
            // Create new user
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Name, email, and password are required'
                ]);
                exit;
            }
            
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Email already exists'
                ]);
                exit;
            }
            
            // Parse name into first and last name
            $nameParts = explode(' ', trim($input['name']), 2);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? $nameParts[1] : '';
            
            // Hash password
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            // Insert user
            $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password, role, status) 
                                  VALUES (?, ?, ?, ?, ?, 'active')");
            $stmt->execute([
                $firstName,
                $lastName,
                $input['email'],
                $hashedPassword,
                $input['role'] ?? 'customer'
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'data' => ['id' => $pdo->lastInsertId()]
            ]);
            break;
            
        case 'PUT':
            // Update user
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
                exit;
            }
            
            // Build update query dynamically
            $updateFields = [];
            $params = [];
            
            if (!empty($input['name'])) {
                $nameParts = explode(' ', trim($input['name']), 2);
                $updateFields[] = "first_name = ?";
                $updateFields[] = "last_name = ?";
                $params[] = $nameParts[0];
                $params[] = isset($nameParts[1]) ? $nameParts[1] : '';
            }
            
            if (!empty($input['email'])) {
                // Check if email already exists for other users
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
                $stmt->execute([$input['email'], $input['id']]);
                if ($stmt->fetch()) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Email already exists'
                    ]);
                    exit;
                }
                $updateFields[] = "email = ?";
                $params[] = $input['email'];
            }
            
            if (!empty($input['role'])) {
                $updateFields[] = "role = ?";
                $params[] = $input['role'];
            }
            
            if (!empty($input['password'])) {
                $updateFields[] = "password = ?";
                $params[] = password_hash($input['password'], PASSWORD_DEFAULT);
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'No fields to update'
                ]);
                exit;
            }
            
            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            $params[] = $input['id'];
            
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete user
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
                exit;
            }
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$input['id']]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                exit;
            }
            
            // Soft delete by setting status to inactive
            $stmt = $pdo->prepare("UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
    
} catch (Exception $e) {
    error_log("Users API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
