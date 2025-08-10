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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get and validate input data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Required fields validation
$requiredFields = ['request_id', 'worker_id'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
        exit;
    }
}

$requestId = intval($data['request_id']);
$workerId = intval($data['worker_id']);
$notes = trim($data['notes'] ?? '');

error_log('Assignment attempt - Request ID: ' . $requestId . ', Worker ID: ' . $workerId);
error_log('Input data: ' . print_r($data, true));

try {
    $db = DB::getInstance();
    
    // Begin transaction
    $db->beginTransaction();
    
    // Verify service request exists and is pending
    $request = $db->fetch(
        "SELECT sr.*, s.name as service_name, u.first_name, u.last_name, u.email, u.phone 
         FROM service_requests sr 
         LEFT JOIN services s ON sr.service_id = s.id 
         LEFT JOIN users u ON sr.user_id = u.id 
         WHERE sr.id = ?", 
        [$requestId]
    );
    
    if (!$request) {
        echo json_encode(['success' => false, 'message' => 'Service request not found']);
        exit;
    }
    
    if ($request['status'] !== 'pending') {
        echo json_encode(['success' => false, 'message' => 'Service request is not in pending status']);
        exit;
    }
    
    // Verify worker exists and is active
    $worker = $db->fetch(
        "SELECT w.*, u.email, u.phone 
         FROM workers w 
         LEFT JOIN users u ON w.user_id = u.id 
         WHERE w.id = ? AND w.status = 'active' AND u.status = 'active'", 
        [$workerId]
    );
    
    if (!$worker) {
        echo json_encode(['success' => false, 'message' => 'Worker not found or inactive']);
        exit;
    }
    
    // Update service request status and assign worker
    $updateData = [
        'status' => 'assigned',
        'worker_id' => $workerId
    ];
    
    $updated = $db->update('service_requests', $updateData, ['id' => $requestId]);
    
    if (!$updated) {
        throw new Exception('Failed to update service request');
    }
    
    // Create notification for worker
    $workerNotificationData = [
        'user_id' => $worker['user_id'],
        'title' => 'New Service Assignment',
        'message' => "You have been assigned to: {$request['title']}. Request ID: #{$requestId}",
        'type' => 'info'
    ];
    $db->insert('notifications', $workerNotificationData);
    
    // Create notification for customer
    $customerNotificationData = [
        'user_id' => $request['user_id'],
        'title' => 'Worker Assigned',
        'message' => "A worker has been assigned to your service request: {$request['title']}. We will contact you soon.",
        'type' => 'info'
    ];
    $db->insert('notifications', $customerNotificationData);
    
    // Commit transaction
    $db->commit();
    
    // Return success response
    $response = [
        'success' => true,
        'message' => 'Worker assigned successfully',
        'data' => [
            'request_id' => $requestId,
            'worker_id' => $workerId,
            'worker_name' => $worker['first_name'] . ' ' . $worker['last_name'],
            'service_name' => $request['service_name'],
            'status' => 'assigned',
            'assigned_at' => date('Y-m-d H:i:s')
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db && $db->getConnection()->inTransaction()) {
        $db->rollback();
    }
    
    error_log('Worker assignment failed: ' . $e->getMessage());
    error_log('Request ID: ' . $requestId . ', Worker ID: ' . $workerId);
    error_log('Session data: ' . print_r($_SESSION, true));
    
    echo json_encode([
        'success' => false,
        'message' => 'Failed to assign worker. Error: ' . $e->getMessage()
    ]);
}
?>
