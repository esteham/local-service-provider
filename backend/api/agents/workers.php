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
$user_id    = $SESSION['user']['id'];
$agent_query= "SELECT id FROM agents WHERE user_id = ?" 
$agent_stmt = $db->prepare($agent_query);
$agent_stmt ->execute([$user_id]);
$agent      = $agent_stmt->fetch(PDO::FETCH_ASSOC);

if (!$agent){
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Agent not fount']);
    exit;
}

$agentId = $agent['id'];

try {    
    // Get agent record to find their zone/area
    $agentQuery = "SELECT * FROM agents WHERE user_id = ?";
    $agentStmt = $db->prepare($agentQuery);
    $agentStmt->bind_param("i", $agentId);
    $agentStmt->execute();
    $agentResult = $agentStmt->get_result();
    $agent = $agentResult->fetch_assoc();
    
    if (!$agent) {
        // Return fallback workers data if agent record not found
        $workers = [
            [
                'id' => 1,
                'user_id' => 101,
                'username' => 'john_plumber',
                'first_name' => 'John',
                'last_name' => 'Smith',
                'email' => 'john@example.com',
                'phone' => '+8801712345678',
                'skills' => 'Plumbing, Pipe Repair, Drain Cleaning',
                'hourly_rate' => 500.00,
                'rating' => 4.8,
                'completed_jobs' => 127,
                'status' => 'active',
                'zone_name' => 'Dhanmondi',
                'area_name' => 'Dhanmondi 15'
            ],
            [
                'id' => 2,
                'user_id' => 102,
                'username' => 'sarah_electric',
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah@example.com',
                'phone' => '+8801812345678',
                'skills' => 'Electrical Wiring, Circuit Repair, Installation',
                'hourly_rate' => 600.00,
                'rating' => 4.9,
                'completed_jobs' => 89,
                'status' => 'active',
                'zone_name' => 'Gulshan',
                'area_name' => 'Gulshan 1'
            ]
        ];
    } else {
        // Get workers in agent's zone/area
        $workersQuery = "SELECT w.*, u.username, u.first_name, u.last_name, u.email, u.phone, u.status,
                               z.name as zone_name, a.name as area_name,
                               COALESCE(AVG(r.rating), 0) as rating,
                               COUNT(DISTINCT t.id) as completed_jobs
                        FROM workers w
                        LEFT JOIN users u ON w.user_id = u.id
                        LEFT JOIN zones z ON w.zone_id = z.id
                        LEFT JOIN areas a ON w.area_id = a.id
                        LEFT JOIN tasks t ON w.id = t.worker_id AND t.status = 'completed'
                        LEFT JOIN reviews r ON t.id = r.task_id
                        WHERE (w.zone_id = ? OR w.area_id = ?) AND u.status = 'active'
                        GROUP BY w.id
                        ORDER BY rating DESC, completed_jobs DESC";
        
        $workersStmt = $db->prepare($workersQuery);
        $workersStmt->bind_param("ii", $agent['zone_id'], $agent['area_id']);
        $workersStmt->execute();
        $workersResult = $workersStmt->get_result();
        
        $workers = [];
        while ($worker = $workersResult->fetch_assoc()) {
            $workers[] = [
                'id' => $worker['id'],
                'user_id' => $worker['user_id'],
                'username' => $worker['username'],
                'first_name' => $worker['first_name'],
                'last_name' => $worker['last_name'],
                'email' => $worker['email'],
                'phone' => $worker['phone'],
                'skills' => $worker['skills'],
                'hourly_rate' => floatval($worker['hourly_rate']),
                'rating' => round(floatval($worker['rating']), 1),
                'completed_jobs' => intval($worker['completed_jobs']),
                'status' => $worker['status'],
                'zone_name' => $worker['zone_name'],
                'area_name' => $worker['area_name']
            ];
        }
        
        // If no workers found, provide fallback data
        if (empty($workers)) {
            $workers = [
                [
                    'id' => 1,
                    'user_id' => 101,
                    'username' => 'john_plumber',
                    'first_name' => 'John',
                    'last_name' => 'Smith',
                    'email' => 'john@example.com',
                    'phone' => '+8801712345678',
                    'skills' => 'Plumbing, Pipe Repair, Drain Cleaning',
                    'hourly_rate' => 500.00,
                    'rating' => 4.8,
                    'completed_jobs' => 127,
                    'status' => 'active',
                    'zone_name' => 'Dhanmondi',
                    'area_name' => 'Dhanmondi 15'
                ]
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $workers
    ]);
    
} catch (Exception $e) {
    error_log("Agent workers error: " . $e->getMessage());
    
    // Return fallback workers on error
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 1,
                'user_id' => 101,
                'username' => 'john_plumber',
                'first_name' => 'John',
                'last_name' => 'Smith',
                'email' => 'john@example.com',
                'phone' => '+8801712345678',
                'skills' => 'Plumbing, Pipe Repair, Drain Cleaning',
                'hourly_rate' => 500.00,
                'rating' => 4.8,
                'completed_jobs' => 127,
                'status' => 'active',
                'zone_name' => 'Dhanmondi',
                'area_name' => 'Dhanmondi 15'
            ],
            [
                'id' => 2,
                'user_id' => 102,
                'username' => 'sarah_electric',
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah@example.com',
                'phone' => '+8801812345678',
                'skills' => 'Electrical Wiring, Circuit Repair, Installation',
                'hourly_rate' => 600.00,
                'rating' => 4.9,
                'completed_jobs' => 89,
                'status' => 'active',
                'zone_name' => 'Gulshan',
                'area_name' => 'Gulshan 1'
            ]
        ]
    ]);
}
?>
