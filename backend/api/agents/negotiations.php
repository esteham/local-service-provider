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
    
    // Get service requests with price negotiations in agent's area/zone
    $negotiationsQuery = "SELECT sr.id as request_id, sr.title, sr.base_price, sr.final_price,
                                 sr.price_breakdown, sr.status, sr.created_at,
                                 u.first_name, u.last_name, u.phone as customer_phone,
                                 s.name as service_name, a.name as area_name, z.name as zone_name
                          FROM service_requests sr
                          LEFT JOIN users u ON sr.user_id = u.id
                          LEFT JOIN services s ON sr.service_id = s.id
                          LEFT JOIN areas a ON sr.area_id = a.id
                          LEFT JOIN zones z ON a.zone_id = z.id
                          WHERE (a.zone_id = ? OR sr.area_id = ?) 
                          AND sr.status IN ('pending', 'assigned')
                          AND (sr.base_price != sr.final_price OR sr.price_breakdown IS NOT NULL)
                          ORDER BY sr.created_at DESC
                          LIMIT 50";
    
    $negotiationsStmt = $db->prepare($negotiationsQuery);
    $negotiationsStmt->execute([$agent['zone_id'], $agent['area_id']]);
    
    $negotiations = [];
    while ($negotiation = $negotiationsStmt->fetch(PDO::FETCH_ASSOC)) {
        $priceBreakdown = null;
        if ($negotiation['price_breakdown']) {
            $priceBreakdown = json_decode($negotiation['price_breakdown'], true);
        }
        
        $negotiations[] = [
            'id' => $negotiation['request_id'],
            'title' => $negotiation['title'],
            'service_name' => $negotiation['service_name'],
            'customer_name' => ($negotiation['first_name'] ?? '') . ' ' . ($negotiation['last_name'] ?? ''),
            'customer_phone' => $negotiation['customer_phone'],
            'base_price' => floatval($negotiation['base_price']),
            'final_price' => floatval($negotiation['final_price']),
            'price_difference' => floatval($negotiation['base_price']) - floatval($negotiation['final_price']),
            'price_breakdown' => $priceBreakdown,
            'status' => $negotiation['status'],
            'created_at' => $negotiation['created_at'],
            'area_name' => $negotiation['area_name'],
            'zone_name' => $negotiation['zone_name']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $negotiations
    ]);
    
} catch (Exception $e) {
    error_log("Agent negotiations error: " . $e->getMessage());
    
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
}
?>