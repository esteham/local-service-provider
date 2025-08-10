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
require_once '../../classes/DB.php';

// Check if user is authenticated
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Check if user is a worker
if ($_SESSION['user']['role'] !== 'worker') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Workers only.']);
    exit;
}

try {
    $db = DB::getInstance();
    $userId = $_SESSION['user']['id'];
    
    // Get worker ID from workers table using user_id
    $worker = $db->fetch(
        "SELECT id FROM workers WHERE user_id = ? AND status = 'active'",
        [$userId]
    );
    
    if (!$worker) {
        echo json_encode(['success' => false, 'message' => 'Worker profile not found or inactive']);
        exit;
    }
    
    $workerId = $worker['id'];
    
    // Get service requests assigned to this worker
    $sql = "SELECT sr.*, 
            s.name as service_name, 
            c.name as category_name,
            u.username as customer_name, 
            u.email as customer_email, 
            u.phone as customer_phone,
            a.name as area_name, 
            z.name as zone_name,
            sr.created_at,
            sr.scheduled_at,
            sr.started_at,
            sr.completed_at
            FROM service_requests sr
            LEFT JOIN services s ON sr.service_id = s.id
            LEFT JOIN categories c ON s.category_id = c.id
            LEFT JOIN users u ON sr.user_id = u.id
            LEFT JOIN areas a ON sr.area_id = a.id
            LEFT JOIN zones z ON a.zone_id = z.id
            WHERE sr.worker_id = ? 
            ORDER BY 
                CASE sr.status 
                    WHEN 'assigned' THEN 1
                    WHEN 'in_progress' THEN 2
                    WHEN 'completed' THEN 3
                    WHEN 'cancelled' THEN 4
                    ELSE 5
                END,
                sr.created_at DESC";
    
    $serviceRequests = $db->fetchAll($sql, [$workerId]);
    
    // Format the data for frontend
    $formattedRequests = array_map(function($request) {
        return [
            'id' => $request['id'],
            'title' => $request['title'],
            'description' => $request['description'],
            'service_name' => $request['service_name'],
            'category_name' => $request['category_name'],
            'customer_name' => $request['customer_name'],
            'customer_email' => $request['customer_email'],
            'customer_phone' => $request['customer_phone'],
            'address' => $request['address'],
            'area_name' => $request['area_name'],
            'zone_name' => $request['zone_name'],
            'status' => $request['status'],
            'urgency' => $request['urgency'],
            'base_price' => $request['base_price'],
            'final_price' => $request['final_price'],
            'service_type' => $request['service_type'],
            'created_at' => $request['created_at'],
            'scheduled_at' => $request['scheduled_at'],
            'started_at' => $request['started_at'],
            'completed_at' => $request['completed_at']
        ];
    }, $serviceRequests);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedRequests,
        'message' => 'Service requests loaded successfully'
    ]);
    
} catch (Exception $e) {
    error_log('Worker tasks loading failed: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load tasks. Please try again.'
    ]);
}
?>
