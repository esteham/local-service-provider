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

try {
    // Get agent record to find their zone/area
    $agentQuery = "SELECT * FROM agents WHERE user_id = ?";
    $agentStmt = $db->prepare($agentQuery);
    $agentStmt->execute([$user_id]);
    $agentData = $agentStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get assignments for this agent
    $assignmentsQuery = "SELECT t.*,
                                w.first_name as worker_first_name, w.last_name as worker_last_name,
                                w.phone as worker_phone, w.email as worker_email,
                                u.first_name as agent_first_name, u.last_name as agent_last_name
                         FROM tasks t
                         LEFT JOIN workers w ON t.worker_id = w.id
                         LEFT JOIN agents a ON t.agent_id = a.id
                         LEFT JOIN users u ON a.user_id = u.id
                         WHERE t.agent_id = ?
                         ORDER BY t.created_at DESC";
    
    $assignmentsStmt = $db->prepare($assignmentsQuery);
    $assignmentsStmt->execute([$agentId]);
    
    $assignments = [];
    while ($assignment = $assignmentsStmt->fetch(PDO::FETCH_ASSOC)) {
        $assignments[] = [
            'id' => $assignment['id'],
            'title' => $assignment['title'],
            'description' => $assignment['description'],
            'status' => $assignment['status'],
            'due_date' => $assignment['due_date'],
            'created_at' => $assignment['created_at'],
            'updated_at' => $assignment['updated_at'],
            'worker' => $assignment['worker_first_name'] ? [
                'name' => $assignment['worker_first_name'] . ' ' . $assignment['worker_last_name'],
                'phone' => $assignment['worker_phone'],
                'email' => $assignment['worker_email']
            ] : null,
            'agent' => [
                'name' => ($assignment['agent_first_name'] ?? '') . ' ' . ($assignment['agent_last_name'] ?? '')
            ]
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $assignments,
        'debug' => [
            'agent_data' => $agentData,
            'agent_id' => $agentId,
            'user_id' => $user_id
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Agent assignments error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load assignments: ' . $e->getMessage(),
        'debug' => [
            'agent_id' => $agentId,
            'user_id' => $user_id
        ]
    ]);
}
?>