<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../../middleware/auth.php';
require_once '../../config/database.php';

// Check authentication
$currentUser = getCurrentUser();
if (!$currentUser) {
    error_log("Services API: getCurrentUser() returned null");
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

if ($currentUser['role'] !== 'worker') {
    error_log("Services API: User role is '{$currentUser['role']}', expected 'worker'");
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Access denied. Worker role required.']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get worker ID from session
$user_id = $_SESSION['user']['id'];
error_log("Services API: Looking for worker with user_id: $user_id");

$worker_query = "SELECT id FROM workers WHERE user_id = ?";
$worker_stmt = $db->prepare($worker_query);
$worker_stmt->execute([$user_id]);
$worker = $worker_stmt->fetch(PDO::FETCH_ASSOC);

if (!$worker) {
    error_log("Services API: No worker found for user_id: $user_id");
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker profile not found. Please contact admin.']);
    exit;
}

error_log("Services API: Found worker with ID: {$worker['id']}");

$worker_id = $worker['id'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // First check if worker_services table has data for this worker
        error_log("Services API: Checking worker_services table for worker_id: $worker_id");
        $check_sql = "SELECT COUNT(*) as count FROM worker_services WHERE worker_id = ?";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->execute([$worker_id]);
        $count = $check_stmt->fetch(PDO::FETCH_ASSOC)['count'];
        error_log("Services API: Found $count services for worker_id: $worker_id");
        
        if ($count == 0) {
            // No services assigned to worker, return empty array
            echo json_encode([
                'success' => true,
                'data' => [],
                'message' => 'No services assigned to this worker'
            ]);
            exit;
        }
        
        // Get worker's services
        $sql = "SELECT s.*, c.name as category_name, ws.price_override, ws.is_active
                FROM worker_services ws
                JOIN services s ON ws.service_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE ws.worker_id = ?
                ORDER BY c.name, s.name";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$worker_id]);
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $services
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Add new service to worker
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['service_id'])) {
            echo json_encode(['success' => false, 'message' => 'Service ID is required']);
            exit;
        }
        
        // Check if service already exists for this worker
        $check_sql = "SELECT COUNT(*) as count FROM worker_services WHERE worker_id = ? AND service_id = ?";
        $check_stmt = $db->prepare($check_sql);
        $check_stmt->execute([$worker_id, $input['service_id']]);
        $exists = $check_stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        if ($exists) {
            echo json_encode(['success' => false, 'message' => 'Service already added to your profile']);
            exit;
        }
        
        // Add service to worker
        $insert_sql = "INSERT INTO worker_services (worker_id, service_id, price_override, is_active, created_at) 
                       VALUES (?, ?, ?, ?, NOW())";
        $insert_stmt = $db->prepare($insert_sql);
        $result = $insert_stmt->execute([
            $worker_id,
            $input['service_id'],
            $input['price_override'] ?? null,
            $input['is_active'] ?? 1
        ]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Service added successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add service']);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update service status or price
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['service_id'])) {
            $sql = "UPDATE worker_services SET 
                    is_active = ?, price_override = ?
                    WHERE worker_id = ? AND service_id = ?";
            
            $stmt = $db->prepare($sql);
            $result = $stmt->execute([
                $input['is_active'] ?? 1,
                $input['price_override'] ?? null,
                $worker_id,
                $input['service_id']
            ]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Service updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update service']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Service ID required']);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Remove service from worker
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['service_id'])) {
            echo json_encode(['success' => false, 'message' => 'Service ID is required']);
            exit;
        }
        
        $delete_sql = "DELETE FROM worker_services WHERE worker_id = ? AND service_id = ?";
        $delete_stmt = $db->prepare($delete_sql);
        $result = $delete_stmt->execute([$worker_id, $input['service_id']]);
        
        if ($result && $delete_stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Service removed successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Service not found or already removed']);
        }
    }
    
} catch (Exception $e) {
    error_log("Worker Services API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
