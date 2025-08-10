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
        "SELECT * FROM workers WHERE user_id = ? AND status = 'active'",
        [$userId]
    );
    
    if (!$worker) {
        echo json_encode(['success' => false, 'message' => 'Worker profile not found or inactive']);
        exit;
    }
    
    $workerId = $worker['id'];
    
    // Get worker statistics
    $stats = [
        'total_requests' => 0,
        'completed_requests' => 0,
        'pending_requests' => 0,
        'in_progress_requests' => 0,
        'total_earnings' => 0,
        'this_month_earnings' => 0,
        'average_rating' => 0,
        'availability' => $worker['availability']
    ];
    
    // Count service requests by status
    $requestCounts = $db->fetch(
        "SELECT 
            COUNT(*) as total_requests,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
            SUM(CASE WHEN status = 'pending' OR status = 'assigned' THEN 1 ELSE 0 END) as pending_requests,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_requests,
            SUM(CASE WHEN status = 'completed' THEN final_price ELSE 0 END) as total_earnings,
            SUM(CASE WHEN status = 'completed' AND MONTH(completed_at) = MONTH(NOW()) AND YEAR(completed_at) = YEAR(NOW()) THEN final_price ELSE 0 END) as this_month_earnings
         FROM service_requests 
         WHERE worker_id = ?",
        [$workerId]
    );
    
    if ($requestCounts) {
        $stats = array_merge($stats, $requestCounts);
    }
    
    // Calculate average rating (placeholder - you can implement rating system later)
    $stats['average_rating'] = 4.5; // Default rating
    
    echo json_encode([
        'success' => true,
        'data' => $stats,
        'message' => 'Worker stats loaded successfully'
    ]);
    
} catch (Exception $e) {
    error_log('Worker stats loading failed: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load worker stats. Please try again.'
    ]);
}
?>
