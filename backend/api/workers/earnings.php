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
    // Get earnings data
    $period = $_GET['period'] ?? 'month'; // week, month, year
    
    // Calculate date range based on period
    $date_condition = '';
    switch ($period) {
        case 'week':
            $date_condition = "AND sr.completed_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $date_condition = "AND sr.completed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            break;
        case 'year':
            $date_condition = "AND sr.completed_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            break;
    }
    
    // Get total earnings
    $total_sql = "SELECT SUM(final_price) as total_earnings, COUNT(*) as total_jobs
                  FROM service_requests sr
                  WHERE sr.worker_id = ? AND sr.status = 'completed' $date_condition";
    
    $total_stmt = $db->prepare($total_sql);
    $total_stmt->execute([$worker_id]);
    $totals = $total_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get recent earnings
    $recent_sql = "SELECT sr.*, s.name as service_name, u.username as customer_name
                   FROM service_requests sr
                   LEFT JOIN services s ON sr.service_id = s.id
                   LEFT JOIN users u ON sr.user_id = u.id
                   WHERE sr.worker_id = ? AND sr.status = 'completed'
                   ORDER BY sr.completed_at DESC
                   LIMIT 10";
    
    $recent_stmt = $db->prepare($recent_sql);
    $recent_stmt->execute([$worker_id]);
    $recent_earnings = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get monthly breakdown for chart
    $monthly_sql = "SELECT 
                        DATE_FORMAT(sr.completed_at, '%Y-%m') as month,
                        SUM(sr.final_price) as earnings,
                        COUNT(*) as jobs
                    FROM service_requests sr
                    WHERE sr.worker_id = ? AND sr.status = 'completed'
                        AND sr.completed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    GROUP BY DATE_FORMAT(sr.completed_at, '%Y-%m')
                    ORDER BY month DESC";
    
    $monthly_stmt = $db->prepare($monthly_sql);
    $monthly_stmt->execute([$worker_id]);
    $monthly_data = $monthly_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_earnings' => $totals['total_earnings'] ?: 0,
            'total_jobs' => $totals['total_jobs'] ?: 0,
            'average_per_job' => $totals['total_jobs'] > 0 ? round($totals['total_earnings'] / $totals['total_jobs'], 2) : 0,
            'recent_earnings' => $recent_earnings,
            'monthly_breakdown' => $monthly_data,
            'period' => $period
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Earnings API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
