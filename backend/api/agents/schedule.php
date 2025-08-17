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
    $agent = $agentStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agent) {
        echo json_encode([
            'success' => true,
            'data' => []
        ]);
        exit;
    }
    
    // Get upcoming service requests in agent's area/zone
    $requestsQuery = "SELECT sr.*, s.name as service_name, u.first_name, u.last_name, u.phone as customer_phone,
                             a.name as area_name, z.name as zone_name
                      FROM service_requests sr
                      LEFT JOIN services s ON sr.service_id = s.id
                      LEFT JOIN users u ON sr.user_id = u.id
                      LEFT JOIN areas a ON sr.area_id = a.id
                      LEFT JOIN zones z ON a.zone_id = z.id
                      WHERE (a.zone_id = ? OR sr.area_id = ?) 
                      AND sr.status IN ('pending', 'assigned', 'in_progress')
                      AND sr.scheduled_at >= NOW()
                      ORDER BY sr.scheduled_at ASC
                      LIMIT 50";
    
    $requestsStmt = $db->prepare($requestsQuery);
    $requestsStmt->execute([$agent['zone_id'], $agent['area_id']]);
    
    $scheduleItems = [];
    while ($request = $requestsStmt->fetch(PDO::FETCH_ASSOC)) {
        $scheduleItems[] = [
            'id' => $request['id'],
            'title' => $request['title'],
            'service_name' => $request['service_name'] ?? 'Unknown Service',
            'customer_name' => ($request['first_name'] ?? '') . ' ' . ($request['last_name'] ?? ''),
            'customer_phone' => $request['customer_phone'] ?? '',
            'address' => $request['address'] ?? '',
            'status' => $request['status'] ?? 'pending',
            'scheduled_at' => $request['scheduled_at'],
            'area_name' => $request['area_name'],
            'zone_name' => $request['zone_name']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $scheduleItems
    ]);
    
} catch (Exception $e) {
    error_log("Agent schedule error: " . $e->getMessage());
    
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
}
?>