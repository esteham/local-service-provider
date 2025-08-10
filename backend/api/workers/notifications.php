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
    
    // Get notifications for this worker
    $notifications = $db->fetchAll(
        "SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50",
        [$userId]
    );
    
    // Format notifications for frontend
    $formattedNotifications = array_map(function($notification) {
        return [
            'id' => $notification['id'],
            'title' => $notification['title'],
            'message' => $notification['message'],
            'type' => $notification['type'],
            'is_read' => (bool)$notification['is_read'],
            'created_at' => $notification['created_at']
        ];
    }, $notifications);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedNotifications,
        'message' => 'Notifications loaded successfully'
    ]);
    
} catch (Exception $e) {
    error_log('Worker notifications loading failed: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load notifications. Please try again.'
    ]);
}
?>
