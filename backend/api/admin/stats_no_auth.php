<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/init.php';
require_once '../../config/database.php';

try {
    DatabaseConfig::createDatabase();
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();
    
    // Get total users count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE status = 'active'");
    $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get active workers count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM workers w 
                        INNER JOIN users u ON w.user_id = u.id 
                        WHERE u.status = 'active'");
    $totalWorkers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get pending service requests count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM service_requests WHERE status = 'pending'");
    $pendingRequests = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total revenue (completed requests)
    $stmt = $pdo->query("SELECT SUM(total_cost) as revenue FROM service_requests WHERE status = 'completed'");
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['revenue'] ?? 0;
    
    $stats = [
        'totalUsers' => (int)$totalUsers,
        'totalWorkers' => (int)$totalWorkers,
        'pendingRequests' => (int)$pendingRequests,
        'totalRevenue' => (float)$totalRevenue
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $stats,
        'message' => 'Stats retrieved successfully (no auth)'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
