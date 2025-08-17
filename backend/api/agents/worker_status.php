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

// Only allow PUT requests for status updates
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use PUT.']);
    exit;
}

try {
    // Get input data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['worker_id']) || !isset($data['status'])) {
        echo json_encode(['success' => false, 'message' => 'Worker ID and status are required']);
        exit;
    }
    
    $workerId = intval($data['worker_id']);
    $newStatus = $data['status'];
    
    // Validate status
    $validStatuses = ['active', 'inactive'];
    if (!in_array($newStatus, $validStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status. Must be "active" or "inactive".']);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    // Check if worker exists and is in agent's zone/area
    $workerQuery = "SELECT w.id, w.user_id, u.username, u.first_name, u.last_name, w.zone_id, w.area_id 
                    FROM workers w 
                    LEFT JOIN users u ON w.user_id = u.id 
                    WHERE w.id = ?";
    $workerStmt = $db->prepare($workerQuery);
    $workerStmt->execute([$workerId]);
    $worker = $workerStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$worker) {
        echo json_encode(['success' => false, 'message' => 'Worker not found']);
        exit;
    }
    
    // Check if agent has access to this worker (must be in same zone/area)
    $agentQuery = "SELECT zone_id, area_id FROM agents WHERE user_id = ?";
    $agentStmt = $db->prepare($agentQuery);
    $agentStmt->execute([$user_id]);
    $agentInfo = $agentStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agentInfo) {
        echo json_encode(['success' => false, 'message' => 'Agent information not found']);
        exit;
    }
    
    // Check if worker is in agent's zone or area
    $hasAccess = false;
    if ($worker['area_id'] && $agentInfo['area_id'] && $worker['area_id'] == $agentInfo['area_id']) {
        $hasAccess = true;
    } else if ($worker['zone_id'] && $agentInfo['zone_id'] && $worker['zone_id'] == $agentInfo['zone_id']) {
        $hasAccess = true;
    }
    
    if (!$hasAccess) {
        echo json_encode(['success' => false, 'message' => 'You do not have permission to modify this worker']);
        exit;
    }
    
    // Update worker status in users table
    $updateQuery = "UPDATE users SET status = ? WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $result = $updateStmt->execute([$newStatus, $worker['user_id']]);
    
    if (!$result) {
        throw new Exception('Failed to update worker status');
    }
    
    // Update worker status in workers table
    $updateWorkerQuery = "UPDATE workers SET status = ? WHERE id = ?";
    $updateWorkerStmt = $db->prepare($updateWorkerQuery);
    $updateWorkerStmt->execute([$newStatus, $workerId]);
    
    // Create notification for worker
    $notificationQuery = "INSERT INTO notifications (user_id, title, message, type, created_at) 
                          VALUES (?, ?, ?, 'info', NOW())";
    $notificationStmt = $db->prepare($notificationQuery);
    $notificationTitle = "Account " . ucfirst($newStatus);
    $notificationMessage = "Your account has been " . $newStatus . " by the agent.";
    $notificationStmt->execute([$worker['user_id'], $notificationTitle, $notificationMessage]);
    
    // Commit transaction
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Worker status updated successfully',
        'data' => [
            'worker_id' => $workerId,
            'worker_name' => $worker['first_name'] . ' ' . $worker['last_name'],
            'username' => $worker['username'],
            'new_status' => $newStatus,
            'updated_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db->inTransaction()) {
        $db->rollback();
    }
    
    error_log("Agent worker status update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update worker status. Please try again.'
    ]);
}
?>