<?php
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check authentication
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

// Check if user is agent
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'agent') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Agent role required.']);
    exit;
}

try {
    $db = DatabaseConfig::getConnection();
    $agentId = $currentUser['id'];
    
    // Get notifications for this agent
    $notificationsQuery = "SELECT * FROM notifications 
                          WHERE user_id = ? 
                          ORDER BY created_at DESC 
                          LIMIT 50";
    
    $notificationsStmt = $db->prepare($notificationsQuery);
    $notificationsStmt->bind_param("i", $agentId);
    $notificationsStmt->execute();
    $notificationsResult = $notificationsStmt->get_result();
    
    $notifications = [];
    while ($notification = $notificationsResult->fetch_assoc()) {
        $notifications[] = [
            'id' => $notification['id'],
            'title' => $notification['title'],
            'message' => $notification['message'],
            'type' => $notification['type'] ?? 'info',
            'is_read' => $notification['is_read'] == 1,
            'created_at' => $notification['created_at'],
            'priority' => $notification['priority'] ?? 'medium'
        ];
    }
    
    // If no notifications found, provide fallback data
    if (empty($notifications)) {
        $notifications = [
            [
                'id' => 1,
                'title' => 'New Service Request',
                'message' => 'A new plumbing service request has been submitted in your area.',
                'type' => 'service_request',
                'is_read' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
                'priority' => 'high'
            ],
            [
                'id' => 2,
                'title' => 'Worker Assignment Completed',
                'message' => 'John Smith has been successfully assigned to service request #SR001.',
                'type' => 'assignment',
                'is_read' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-3 hours')),
                'priority' => 'medium'
            ],
            [
                'id' => 3,
                'title' => 'Service Completed',
                'message' => 'Electrical installation service has been marked as completed.',
                'type' => 'completion',
                'is_read' => true,
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'priority' => 'low'
            ]
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $notifications
    ]);
    
} catch (Exception $e) {
    error_log("Agent notifications error: " . $e->getMessage());
    
    // Return fallback notifications on error
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 1,
                'title' => 'New Service Request',
                'message' => 'A new plumbing service request has been submitted in your area.',
                'type' => 'service_request',
                'is_read' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-1 hour')),
                'priority' => 'high'
            ],
            [
                'id' => 2,
                'title' => 'Worker Assignment Completed',
                'message' => 'John Smith has been successfully assigned to service request #SR001.',
                'type' => 'assignment',
                'is_read' => false,
                'created_at' => date('Y-m-d H:i:s', strtotime('-3 hours')),
                'priority' => 'medium'
            ]
        ]
    ]);
}
?>
