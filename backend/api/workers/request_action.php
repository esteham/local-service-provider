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

require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';
require_once '../../classes/DB.php';

// Check authentication
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'worker') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if (false) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Workers only.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
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
    
    // Get input data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['request_id']) || !isset($data['action'])) {
        echo json_encode(['success' => false, 'message' => 'Request ID and action are required']);
        exit;
    }
    
    $requestId = intval($data['request_id']);
    $action = $data['action'];
    
    // Validate action
    $validActions = ['accept', 'complete', 'reject'];
    if (!in_array($action, $validActions)) {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    // Verify service request exists and is assigned to this worker
    $request = $db->fetch(
        "SELECT sr.*, s.name as service_name, u.first_name as customer_first_name, u.last_name as customer_last_name, u.email as customer_email
         FROM service_requests sr 
         LEFT JOIN services s ON sr.service_id = s.id 
         LEFT JOIN users u ON sr.user_id = u.id 
         WHERE sr.id = ? AND sr.worker_id = ?", 
        [$requestId, $workerId]
    );
    
    if (!$request) {
        echo json_encode(['success' => false, 'message' => 'Service request not found or not assigned to you']);
        exit;
    }
    
    // Handle different actions
    $updateData = [];
    $notificationTitle = '';
    $notificationMessage = '';
    
    switch ($action) {
        case 'accept':
            if ($request['status'] !== 'assigned') {
                echo json_encode(['success' => false, 'message' => 'Request is not in assigned status']);
                exit;
            }
            $updateData = [
                'status' => 'in_progress',
                'started_at' => date('Y-m-d H:i:s')
            ];
            $notificationTitle = 'Service Started';
            $notificationMessage = "Your service request '{$request['title']}' has been started by the worker.";
            break;
            
        case 'complete':
            if ($request['status'] !== 'in_progress') {
                echo json_encode(['success' => false, 'message' => 'Request is not in progress']);
                exit;
            }
            $updateData = [
                'status' => 'completed',
                'completed_at' => date('Y-m-d H:i:s')
            ];
            $notificationTitle = 'Service Completed';
            $notificationMessage = "Your service request '{$request['title']}' has been completed successfully.";
            break;
            
        case 'reject':
            if ($request['status'] !== 'assigned') {
                echo json_encode(['success' => false, 'message' => 'Can only reject assigned requests']);
                exit;
            }
            $updateData = [
                'status' => 'pending',
                'worker_id' => null // Remove worker assignment
            ];
            $notificationTitle = 'Service Request Available';
            $notificationMessage = "Your service request '{$request['title']}' is now available for assignment to another worker.";
            break;
    }
    
    // Update service request
    $updated = $db->update('service_requests', $updateData, ['id' => $requestId]);
    
    if (!$updated) {
        throw new Exception('Failed to update service request');
    }
    
    // Create notification for customer
    $customerNotificationData = [
        'user_id' => $request['user_id'],
        'title' => $notificationTitle,
        'message' => $notificationMessage,
        'type' => 'info'
    ];
    $db->insert('notifications', $customerNotificationData);
    
    // Commit transaction
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => ucfirst($action) . ' action completed successfully',
        'data' => [
            'request_id' => $requestId,
            'action' => $action,
            'new_status' => $updateData['status'],
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db && $db->getConnection()->inTransaction()) {
        $db->rollback();
    }
    
    error_log('Worker request action failed: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to process request action. Please try again.'
    ]);
}
?>
