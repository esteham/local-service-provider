<?php
require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';
require_once '../../classes/class_functions.php'

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    DatabaseConfig::createDatabase();
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();
    $timeRange = $_GET['timeRange'] ?? 'month'; // week, month, quarter, year
    
    // Calculate date range
    $dateCondition = '';
    $params = [];
    
    switch ($timeRange) {
        case 'week':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            break;
        case 'quarter':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
            break;
        case 'year':
            $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            break;
    }
    
    // Get current period revenue
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_price), 0) as current_revenue 
                          FROM service_requests 
                          WHERE status = 'completed' $dateCondition");
    $stmt->execute($params);
    $currentRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['current_revenue'];
    
    // Get previous period revenue for growth calculation
    $prevDateCondition = '';
    switch ($timeRange) {
        case 'week':
            $prevDateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 2 WEEK) AND created_at < DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $prevDateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MONTH) AND created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            break;
        case 'quarter':
            $prevDateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)";
            break;
        case 'year':
            $prevDateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 2 YEAR) AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            break;
    }
    
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total_price), 0) as prev_revenue 
                          FROM service_requests 
                          WHERE status = 'completed' $prevDateCondition");
    $stmt->execute($params);
    $prevRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['prev_revenue'];
    
    $revenueGrowth = $prevRevenue > 0 ? (($currentRevenue - $prevRevenue) / $prevRevenue) * 100 : 0;
    
    // Get current period users
    $stmt = $pdo->prepare("SELECT COUNT(*) as current_users 
                          FROM users 
                          WHERE status = 'active' $dateCondition");
    $stmt->execute($params);
    $currentUsers = $stmt->fetch(PDO::FETCH_ASSOC)['current_users'];
    
    // Get previous period users
    $stmt = $pdo->prepare("SELECT COUNT(*) as prev_users 
                          FROM users 
                          WHERE status = 'active' $prevDateCondition");
    $stmt->execute($params);
    $prevUsers = $stmt->fetch(PDO::FETCH_ASSOC)['prev_users'];
    
    $usersGrowth = $prevUsers > 0 ? (($currentUsers - $prevUsers) / $prevUsers) * 100 : 0;
    
    // Get current period requests
    $stmt = $pdo->prepare("SELECT COUNT(*) as current_requests 
                          FROM service_requests 
                          WHERE 1=1 $dateCondition");
    $stmt->execute($params);
    $currentRequests = $stmt->fetch(PDO::FETCH_ASSOC)['current_requests'];
    
    // Get previous period requests
    $stmt = $pdo->prepare("SELECT COUNT(*) as prev_requests 
                          FROM service_requests 
                          WHERE 1=1 $prevDateCondition");
    $stmt->execute($params);
    $prevRequests = $stmt->fetch(PDO::FETCH_ASSOC)['prev_requests'];
    
    $requestsGrowth = $prevRequests > 0 ? (($currentRequests - $prevRequests) / $prevRequests) * 100 : 0;
    
    // Get current period workers
    $stmt = $pdo->prepare("SELECT COUNT(*) as current_workers 
                          FROM workers w 
                          JOIN users u ON w.user_id = u.id 
                          WHERE w.status = 'active' AND u.status = 'active' $dateCondition");
    $stmt->execute($params);
    $currentWorkers = $stmt->fetch(PDO::FETCH_ASSOC)['current_workers'];
    
    // Get previous period workers
    $stmt = $pdo->prepare("SELECT COUNT(*) as prev_workers 
                          FROM workers w 
                          JOIN users u ON w.user_id = u.id 
                          WHERE w.status = 'active' AND u.status = 'active' $prevDateCondition");
    $stmt->execute($params);
    $prevWorkers = $stmt->fetch(PDO::FETCH_ASSOC)['prev_workers'];
    
    $workersGrowth = $prevWorkers > 0 ? (($currentWorkers - $prevWorkers) / $prevWorkers) * 100 : 0;
    
    // Get monthly revenue trend (last 12 months)
    $stmt = $pdo->query("SELECT 
                            DATE_FORMAT(created_at, '%Y-%m') as month,
                            COALESCE(SUM(total_price), 0) as revenue
                        FROM service_requests 
                        WHERE status = 'completed' 
                        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                        ORDER BY month");
    $monthlyRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get top services by revenue
    $stmt = $pdo->query("SELECT 
                            s.name as service_name,
                            COUNT(sr.id) as total_requests,
                            COALESCE(SUM(sr.total_price), 0) as total_revenue
                        FROM service_requests sr
                        JOIN services s ON sr.service_id = s.id
                        WHERE sr.status = 'completed'
                        GROUP BY s.id, s.name
                        ORDER BY total_revenue DESC
                        LIMIT 10");
    $topServices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get top workers by completed requests
    $stmt = $pdo->query("SELECT 
                            CONCAT(u.first_name, ' ', u.last_name) as worker_name,
                            COUNT(sr.id) as completed_requests,
                            COALESCE(AVG(r.rating), 0) as avg_rating,
                            COALESCE(SUM(sr.total_price), 0) as total_revenue
                        FROM workers w
                        JOIN users u ON w.user_id = u.id
                        LEFT JOIN service_requests sr ON w.id = sr.worker_id AND sr.status = 'completed'
                        LEFT JOIN reviews r ON sr.id = r.service_request_id
                        WHERE w.status = 'active'
                        GROUP BY w.id, u.first_name, u.last_name
                        HAVING completed_requests > 0
                        ORDER BY completed_requests DESC
                        LIMIT 10");
    $topWorkers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response
    $analytics = [
        'metrics' => [
            'revenue' => [
                'current' => (float)$currentRevenue,
                'growth' => round($revenueGrowth, 2)
            ],
            'users' => [
                'current' => (int)$currentUsers,
                'growth' => round($usersGrowth, 2)
            ],
            'requests' => [
                'current' => (int)$currentRequests,
                'growth' => round($requestsGrowth, 2)
            ],
            'workers' => [
                'current' => (int)$currentWorkers,
                'growth' => round($workersGrowth, 2)
            ]
        ],
        'charts' => [
            'monthlyRevenue' => $monthlyRevenue,
            'topServices' => $topServices,
            'topWorkers' => $topWorkers
        ],
        'timeRange' => $timeRange
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $analytics
    ]);
    
} catch (Exception $e) {
    error_log("Analytics API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch analytics data'
    ]);
}
?>
