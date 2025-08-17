<?php
// CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Check if user is agent
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'agent') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Access denied. Agent role required.']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get agent ID from session
$user_id = $_SESSION['user']['id'];
$agent_query = "SELECT id FROM agents WHERE user_id = ?";
$agent_stmt = $db->prepare($agent_query);
$agent_stmt->execute([$user_id]);
$agent = $agent_stmt->fetch(PDO::FETCH_ASSOC);

if (!$agent) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Agent not found']);
    exit;
}

$agentId = $agent['id'];

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

try {
    // Get input data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['request_id']) || !isset($data['worker_id'])) {
        echo json_encode(['success' => false, 'message' => 'Request ID and Worker ID are required']);
        exit;
    }
    
    $requestId = intval($data['request_id']);
    $workerId = intval($data['worker_id']);
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    // Begin transaction
    $db->beginTransaction();
    
    // Verify service request exists and is in agent's zone/area
    $requestQuery = "SELECT sr.*, a.zone_id as request_zone_id, a.id as request_area_id
                     FROM service_requests sr
                     LEFT JOIN areas a ON sr.area_id = a.id
                     WHERE sr.id = ?";
    $requestStmt = $db->prepare($requestQuery);
    $requestStmt->execute([$requestId]);
    $request = $requestStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$request) {
        echo json_encode(['success' => false, 'message' => 'Service request not found']);
        exit;
    }
    
    // Check if agent has access to this request (must be in same zone/area)
    $agentQuery = "SELECT zone_id, area_id FROM agents WHERE user_id = ?";
    $agentStmt = $db->prepare($agentQuery);
    $agentStmt->execute([$user_id]);
    $agentInfo = $agentStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agentInfo) {
        echo json_encode(['success' => false, 'message' => 'Agent information not found']);
        exit;
    }
    
    // Check if request is in agent's zone or area
    $hasAccess = false;
    if ($request['request_area_id'] && $agentInfo['area_id'] && $request['request_area_id'] == $agentInfo['area_id']) {
        $hasAccess = true;
    } else if ($request['request_zone_id'] && $agentInfo['zone_id'] && $request['request_zone_id'] == $agentInfo['zone_id']) {
        $hasAccess = true;
    }
    
    if (!$hasAccess) {
        echo json_encode(['success' => false, 'message' => 'You do not have permission to assign workers to this request']);
        exit;
    }
    
    // Verify worker exists and is active
    $workerQuery = "SELECT id, user_id, first_name, last_name FROM workers w 
                    LEFT JOIN users u ON w.user_id = u.id 
                    WHERE w.id = ? AND u.status = 'active'";
    $workerStmt = $db->prepare($workerQuery);
    $workerStmt->execute([$workerId]);
    $worker = $workerStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$worker) {
        echo json_encode(['success' => false, 'message' => 'Worker not found or inactive']);
        exit;
    }
    
    // Check if worker is in the same zone/area as the request
    $workerZoneQuery = "SELECT zone_id, area_id FROM workers WHERE id = ?";
    $workerZoneStmt = $db->prepare($workerZoneQuery);
    $workerZoneStmt->execute([$workerId]);
    $workerZoneInfo = $workerZoneStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$workerZoneInfo) {
        echo json_encode(['success' => false, 'message' => 'Worker zone information not found']);
        exit;
    }
    
    // Check if worker is in same zone/area as request
    $workerHasAccess = false;
    if ($request['request_area_id'] && $workerZoneInfo['area_id'] && $request['request_area_id'] == $workerZoneInfo['area_id']) {
        $workerHasAccess = true;
    } else if ($request['request_zone_id'] && $workerZoneInfo['zone_id'] && $request['request_zone_id'] == $workerZoneInfo['zone_id']) {
        $workerHasAccess = true;
    }
    
    if (!$workerHasAccess) {
        echo json_encode(['success' => false, 'message' => 'Selected worker is not in the same zone/area as the request']);
        exit;
    }
    
    // Update service request status to assigned and set worker
    $updateQuery = "UPDATE service_requests SET status = 'assigned', worker_id = ?, agent_id = ?, assigned_at = NOW() WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $result = $updateStmt->execute([$workerId, $agentId, $requestId]);
    
    if (!$result) {
        throw new Exception('Failed to assign worker to service request');
    }
    
    // Create task assignment record
    $taskQuery = "INSERT INTO tasks (agent_id, worker_id, title, description, status, due_date, created_at) 
                  VALUES (?, ?, ?, ?, 'assigned', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())";
    $taskStmt = $db->prepare($taskQuery);
    $taskTitle = "Service: " . ($request['title'] ?? 'Untitled Request');
    $taskDescription = "Assigned to worker: " . $worker['first_name'] . " " . $worker['last_name'] . "\nNotes: " . $notes;
    $taskStmt->execute([$agentId, $workerId, $taskTitle, $taskDescription]);
    
    // Create notification for worker
    $notificationQuery = "INSERT INTO notifications (user_id, title, message, type, created_at) 
                          VALUES (?, ?, ?, 'info', NOW())";
    $notificationStmt = $db->prepare($notificationQuery);
    $notificationTitle = "New Service Assignment";
    $notificationMessage = "You have been assigned to a new service request: " . ($request['title'] ?? 'Untitled Request');
    $notificationStmt->execute([$worker['user_id'], $notificationTitle, $notificationMessage]);
    
    // Create notification for customer
    $customerNotificationQuery = "INSERT INTO notifications (user_id, title, message, type, created_at) 
                                 VALUES (?, ?, ?, 'info', NOW())";
    $customerNotificationStmt = $db->prepare($customerNotificationQuery);
    $customerNotificationTitle = "Worker Assigned";
    $customerNotificationMessage = "A worker has been assigned to your service request: " . ($request['title'] ?? 'Untitled Request');
    $customerNotificationStmt->execute([$request['user_id'], $customerNotificationTitle, $customerNotificationMessage]);
    
    // Commit transaction
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Worker assigned successfully',
        'data' => [
            'request_id' => $requestId,
            'worker_id' => $workerId,
            'worker_name' => $worker['first_name'] . ' ' . $worker['last_name'],
            'assigned_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db->inTransaction()) {
        $db->rollback();
    }
    
    error_log("Agent assign worker error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to assign worker. Please try again.'
    ]);
}
?>