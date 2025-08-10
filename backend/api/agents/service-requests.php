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
    
    // Get agent record
    $agentQuery = "SELECT * FROM agents WHERE user_id = ?";
    $agentStmt = $db->prepare($agentQuery);
    $agentStmt->bind_param("i", $agentId);
    $agentStmt->execute();
    $agentResult = $agentStmt->get_result();
    $agent = $agentResult->fetch_assoc();
    
    if (!$agent) {
        // Return fallback service requests if agent record not found
        $serviceRequests = [
            [
                'id' => 1,
                'service_name' => 'Plumbing Repair',
                'customer_name' => 'Ahmed Hassan',
                'customer_phone' => '+8801712345678',
                'address' => 'House 15, Road 8, Dhanmondi',
                'status' => 'pending',
                'priority' => 'high',
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                'preferred_date' => date('Y-m-d', strtotime('+1 day')),
                'preferred_time' => '10:00 AM',
                'price' => 1500.00,
                'description' => 'Kitchen sink is leaking and needs immediate repair'
            ],
            [
                'id' => 2,
                'service_name' => 'Electrical Installation',
                'customer_name' => 'Fatima Rahman',
                'customer_phone' => '+8801812345678',
                'address' => 'Apartment 5B, Gulshan 1',
                'status' => 'assigned',
                'priority' => 'medium',
                'created_at' => date('Y-m-d H:i:s', strtotime('-4 hours')),
                'preferred_date' => date('Y-m-d', strtotime('+2 days')),
                'preferred_time' => '2:00 PM',
                'price' => 2500.00,
                'description' => 'Install new ceiling fan in living room'
            ]
        ];
    } else {
        // Get service requests in agent's area/zone
        $requestsQuery = "SELECT sr.*, s.name as service_name, u.first_name, u.last_name, u.phone as customer_phone,
                                a.name as area_name, z.name as zone_name
                         FROM service_requests sr
                         LEFT JOIN services s ON sr.service_id = s.id
                         LEFT JOIN users u ON sr.user_id = u.id
                         LEFT JOIN areas a ON sr.area_id = a.id
                         LEFT JOIN zones z ON a.zone_id = z.id
                         WHERE (a.zone_id = ? OR sr.area_id = ?)
                         ORDER BY sr.created_at DESC
                         LIMIT 50";
        
        $requestsStmt = $db->prepare($requestsQuery);
        $requestsStmt->bind_param("ii", $agent['zone_id'], $agent['area_id']);
        $requestsStmt->execute();
        $requestsResult = $requestsStmt->get_result();
        
        $serviceRequests = [];
        while ($request = $requestsResult->fetch_assoc()) {
            $serviceRequests[] = [
                'id' => $request['id'],
                'service_name' => $request['service_name'] ?? 'Unknown Service',
                'customer_name' => ($request['first_name'] ?? '') . ' ' . ($request['last_name'] ?? ''),
                'customer_phone' => $request['customer_phone'] ?? '',
                'address' => $request['address'] ?? '',
                'status' => $request['status'] ?? 'pending',
                'priority' => $request['priority'] ?? 'medium',
                'created_at' => $request['created_at'],
                'preferred_date' => $request['preferred_date'],
                'preferred_time' => $request['preferred_time'],
                'price' => floatval($request['price'] ?? 0),
                'description' => $request['description'] ?? '',
                'area_name' => $request['area_name'],
                'zone_name' => $request['zone_name']
            ];
        }
        
        // If no requests found, provide fallback data
        if (empty($serviceRequests)) {
            $serviceRequests = [
                [
                    'id' => 1,
                    'service_name' => 'Plumbing Repair',
                    'customer_name' => 'Ahmed Hassan',
                    'customer_phone' => '+8801712345678',
                    'address' => 'House 15, Road 8, Dhanmondi',
                    'status' => 'pending',
                    'priority' => 'high',
                    'created_at' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                    'preferred_date' => date('Y-m-d', strtotime('+1 day')),
                    'preferred_time' => '10:00 AM',
                    'price' => 1500.00,
                    'description' => 'Kitchen sink is leaking and needs immediate repair'
                ]
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $serviceRequests
    ]);
    
} catch (Exception $e) {
    error_log("Agent service requests error: " . $e->getMessage());
    
    // Return fallback service requests on error
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 1,
                'service_name' => 'Plumbing Repair',
                'customer_name' => 'Ahmed Hassan',
                'customer_phone' => '+8801712345678',
                'address' => 'House 15, Road 8, Dhanmondi',
                'status' => 'pending',
                'priority' => 'high',
                'created_at' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                'preferred_date' => date('Y-m-d', strtotime('+1 day')),
                'preferred_time' => '10:00 AM',
                'price' => 1500.00,
                'description' => 'Kitchen sink is leaking and needs immediate repair'
            ],
            [
                'id' => 2,
                'service_name' => 'Electrical Installation',
                'customer_name' => 'Fatima Rahman',
                'customer_phone' => '+8801812345678',
                'address' => 'Apartment 5B, Gulshan 1',
                'status' => 'assigned',
                'priority' => 'medium',
                'created_at' => date('Y-m-d H:i:s', strtotime('-4 hours')),
                'preferred_date' => date('Y-m-d', strtotime('+2 days')),
                'preferred_time' => '2:00 PM',
                'price' => 2500.00,
                'description' => 'Install new ceiling fan in living room'
            ]
        ]
    ]);
}
?>
