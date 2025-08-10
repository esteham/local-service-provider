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

session_start();
require_once '../../middleware/auth.php';
require_once '../../config/database.php';

// Check authentication
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'worker') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get worker ID from session
$user_id = $_SESSION['user']['id'];
$worker_query = "SELECT id FROM workers WHERE user_id = ?";
$worker_stmt = $db->prepare($worker_query);
$worker_stmt->execute([$user_id]);
$worker = $worker_stmt->fetch(PDO::FETCH_ASSOC);

if (!$worker) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker not found']);
    exit;
}

$worker_id = $worker['id'];

try {
    // Get schedule data
    $view = $_GET['view'] ?? 'week'; // week, month
    
    // Get upcoming tasks
    $upcoming_sql = "SELECT sr.*, s.name as service_name, u.username as customer_name,
                            a.name as area_name, z.name as zone_name
                     FROM service_requests sr
                     LEFT JOIN services s ON sr.service_id = s.id
                     LEFT JOIN users u ON sr.user_id = u.id
                     LEFT JOIN areas a ON sr.area_id = a.id
                     LEFT JOIN zones z ON a.zone_id = z.id
                     WHERE sr.worker_id = ? 
                     AND sr.status IN ('assigned', 'in_progress')
                     AND sr.scheduled_date >= CURDATE()
                     ORDER BY sr.scheduled_date ASC, sr.scheduled_time ASC
                     LIMIT 20";
    
    $upcoming_stmt = $db->prepare($upcoming_sql);
    $upcoming_stmt->execute([$worker_id]);
    $upcoming_tasks = $upcoming_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get today's tasks
    $today_sql = "SELECT sr.*, s.name as service_name, u.username as customer_name
                  FROM service_requests sr
                  LEFT JOIN services s ON sr.service_id = s.id
                  LEFT JOIN users u ON sr.user_id = u.id
                  WHERE sr.worker_id = ? 
                  AND DATE(sr.scheduled_date) = CURDATE()
                  AND sr.status IN ('assigned', 'in_progress')
                  ORDER BY sr.scheduled_time ASC";
    
    $today_stmt = $db->prepare($today_sql);
    $today_stmt->execute([$worker_id]);
    $today_tasks = $today_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get schedule stats
    $stats_sql = "SELECT 
                    COUNT(CASE WHEN DATE(sr.scheduled_date) = CURDATE() THEN 1 END) as today_tasks,
                    COUNT(CASE WHEN sr.scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as week_tasks,
                    COUNT(CASE WHEN sr.scheduled_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as month_tasks
                  FROM service_requests sr
                  WHERE sr.worker_id = ? AND sr.status IN ('assigned', 'in_progress')";
    
    $stats_stmt = $db->prepare($stats_sql);
    $stats_stmt->execute([$worker_id]);
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'upcoming_tasks' => $upcoming_tasks,
            'today_tasks' => $today_tasks,
            'stats' => [
                'today' => $stats['today_tasks'] ?: 0,
                'this_week' => $stats['week_tasks'] ?: 0,
                'this_month' => $stats['month_tasks'] ?: 0
            ],
            'view' => $view
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Schedule API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
