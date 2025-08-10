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
if (!$currentUser || $currentUser['role'] !== 'worker') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get worker ID from session
$user_id = $_SESSION['user']['id'];
$worker_query = "SELECT id FROM workers WHERE user_id = ?";
$worker_stmt = $db->prepare($worker_query);
$worker_stmt->execute([$user_id]);
$worker = $worker_stmt->fetch(PDO::FETCH_ASSOC);

if (!$worker) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker not found']);
    exit;
}

$worker_id = $worker['id'];

try {
    // Get work history with filters
    $status_filter = $_GET['status'] ?? '';
    $date_from = $_GET['date_from'] ?? '';
    $date_to = $_GET['date_to'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $sql = "SELECT sr.*, s.name as service_name, c.name as category_name,
                   u.username as customer_name, u.email as customer_email,
                   a.name as area_name, z.name as zone_name
            FROM service_requests sr
            LEFT JOIN services s ON sr.service_id = s.id
            LEFT JOIN categories c ON s.category_id = c.id
            LEFT JOIN users u ON sr.user_id = u.id
            LEFT JOIN areas a ON sr.area_id = a.id
            LEFT JOIN zones z ON a.zone_id = z.id
            WHERE sr.worker_id = ?";
    
    $params = [$worker_id];
    
    if ($status_filter) {
        $sql .= " AND sr.status = ?";
        $params[] = $status_filter;
    }
    
    if ($date_from) {
        $sql .= " AND DATE(sr.created_at) >= ?";
        $params[] = $date_from;
    }
    
    if ($date_to) {
        $sql .= " AND DATE(sr.created_at) <= ?";
        $params[] = $date_to;
    }
    
    if ($search) {
        $sql .= " AND (s.name LIKE ? OR u.username LIKE ? OR sr.address LIKE ?)";
        $search_param = "%$search%";
        $params[] = $search_param;
        $params[] = $search_param;
        $params[] = $search_param;
    }
    
    $sql .= " ORDER BY sr.created_at DESC LIMIT 50";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $history
    ]);
    
} catch (Exception $e) {
    error_log("Work History API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
