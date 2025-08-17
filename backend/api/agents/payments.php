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
            'data' => [
                'total_earnings' => 0,
                'pending_payments' => 0,
                'completed_payments' => 0,
                'transactions' => []
            ]
        ]);
        exit;
    }
    
    // Get payment transactions for service requests in agent's area/zone
    $paymentsQuery = "SELECT sr.id as request_id, sr.title, sr.final_price, sr.payment_status,
                             sr.completed_at, u.first_name, u.last_name,
                             a.name as area_name, z.name as zone_name
                      FROM service_requests sr
                      LEFT JOIN users u ON sr.user_id = u.id
                      LEFT JOIN areas a ON sr.area_id = a.id
                      LEFT JOIN zones z ON a.zone_id = z.id
                      WHERE (a.zone_id = ? OR sr.area_id = ?) 
                      AND sr.status = 'completed'
                      AND sr.payment_status IS NOT NULL
                      ORDER BY sr.completed_at DESC
                      LIMIT 50";
    
    $paymentsStmt = $db->prepare($paymentsQuery);
    $paymentsStmt->execute([$agent['zone_id'], $agent['area_id']]);
    
    $transactions = [];
    $totalEarnings = 0;
    $pendingPayments = 0;
    $completedPayments = 0;
    
    while ($payment = $paymentsStmt->fetch(PDO::FETCH_ASSOC)) {
        $amount = floatval($payment['final_price']);
        
        $transactions[] = [
            'id' => $payment['request_id'],
            'title' => $payment['title'],
            'customer_name' => ($payment['first_name'] ?? '') . ' ' . ($payment['last_name'] ?? ''),
            'amount' => $amount,
            'status' => $payment['payment_status'] ?? 'pending',
            'completed_at' => $payment['completed_at'],
            'area_name' => $payment['area_name'],
            'zone_name' => $payment['zone_name']
        ];
        
        $totalEarnings += $amount;
        
        if ($payment['payment_status'] === 'completed') {
            $completedPayments += $amount;
        } else {
            $pendingPayments += $amount;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_earnings' => $totalEarnings,
            'pending_payments' => $pendingPayments,
            'completed_payments' => $completedPayments,
            'transactions' => $transactions
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Agent payments error: " . $e->getMessage());
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_earnings' => 0,
            'pending_payments' => 0,
            'completed_payments' => 0,
            'transactions' => []
        ]
    ]);
}
?>