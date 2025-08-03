<?php
require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

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
    $action = $_GET['action'] ?? 'overview';
    
    switch ($action) {
        case 'overview':
            // Get total revenue from completed requests
            $stmt = $pdo->query("SELECT COALESCE(SUM(total_price), 0) as total_revenue 
                               FROM service_requests 
                               WHERE status = 'completed'");
            $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'];
            
            // Get this month's revenue
            $stmt = $pdo->query("SELECT COALESCE(SUM(total_price), 0) as monthly_revenue 
                               FROM service_requests 
                               WHERE status = 'completed' 
                               AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
                               AND YEAR(created_at) = YEAR(CURRENT_DATE())");
            $monthlyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['monthly_revenue'];
            
            // Get pending payments (confirmed but not completed)
            $stmt = $pdo->query("SELECT COALESCE(SUM(total_price), 0) as pending_payments 
                               FROM service_requests 
                               WHERE status IN ('confirmed', 'in_progress')");
            $pendingPayments = $stmt->fetch(PDO::FETCH_ASSOC)['pending_payments'];
            
            // Calculate platform commission (assuming 10% commission)
            $platformCommission = $totalRevenue * 0.10;
            $workerPayouts = $totalRevenue - $platformCommission;
            
            // Get average transaction value
            $stmt = $pdo->query("SELECT COALESCE(AVG(total_price), 0) as avg_transaction 
                               FROM service_requests 
                               WHERE status = 'completed'");
            $avgTransaction = $stmt->fetch(PDO::FETCH_ASSOC)['avg_transaction'];
            
            // Get transaction count
            $stmt = $pdo->query("SELECT COUNT(*) as transaction_count 
                               FROM service_requests 
                               WHERE status = 'completed'");
            $transactionCount = $stmt->fetch(PDO::FETCH_ASSOC)['transaction_count'];
            
            $overview = [
                'totalRevenue' => (float)$totalRevenue,
                'monthlyRevenue' => (float)$monthlyRevenue,
                'pendingPayments' => (float)$pendingPayments,
                'platformCommission' => (float)$platformCommission,
                'workerPayouts' => (float)$workerPayouts,
                'avgTransaction' => (float)$avgTransaction,
                'transactionCount' => (int)$transactionCount
            ];
            
            echo json_encode([
                'success' => true,
                'data' => $overview
            ]);
            break;
            
        case 'transactions':
            $limit = $_GET['limit'] ?? 50;
            $offset = $_GET['offset'] ?? 0;
            $status = $_GET['status'] ?? null;
            
            $whereClause = "WHERE 1=1";
            $params = [];
            
            if ($status) {
                $whereClause .= " AND sr.status = ?";
                $params[] = $status;
            }
            
            // Get transactions with customer and worker details
            $sql = "SELECT 
                        sr.id,
                        sr.total_price,
                        sr.status,
                        sr.created_at,
                        sr.updated_at,
                        s.name as service_name,
                        CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
                        cu.email as customer_email,
                        CONCAT(wu.first_name, ' ', wu.last_name) as worker_name,
                        wu.email as worker_email,
                        sr.total_price * 0.10 as platform_commission,
                        sr.total_price * 0.90 as worker_payout
                    FROM service_requests sr
                    LEFT JOIN services s ON sr.service_id = s.id
                    LEFT JOIN users cu ON sr.user_id = cu.id
                    LEFT JOIN workers w ON sr.worker_id = w.id
                    LEFT JOIN users wu ON w.user_id = wu.id
                    $whereClause
                    ORDER BY sr.created_at DESC
                    LIMIT ? OFFSET ?";
            
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format transactions
            $formattedTransactions = array_map(function($transaction) {
                return [
                    'id' => (int)$transaction['id'],
                    'amount' => (float)$transaction['total_price'],
                    'status' => $transaction['status'],
                    'service_name' => $transaction['service_name'],
                    'customer_name' => $transaction['customer_name'],
                    'customer_email' => $transaction['customer_email'],
                    'worker_name' => $transaction['worker_name'],
                    'worker_email' => $transaction['worker_email'],
                    'platform_commission' => (float)$transaction['platform_commission'],
                    'worker_payout' => (float)$transaction['worker_payout'],
                    'created_at' => $transaction['created_at'],
                    'updated_at' => $transaction['updated_at']
                ];
            }, $transactions);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedTransactions
            ]);
            break;
            
        case 'revenue_chart':
            $period = $_GET['period'] ?? 'monthly'; // daily, weekly, monthly, yearly
            
            switch ($period) {
                case 'daily':
                    $sql = "SELECT 
                                DATE(created_at) as period,
                                COALESCE(SUM(total_price), 0) as revenue
                            FROM service_requests 
                            WHERE status = 'completed' 
                            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                            GROUP BY DATE(created_at)
                            ORDER BY period";
                    break;
                case 'weekly':
                    $sql = "SELECT 
                                YEARWEEK(created_at) as period,
                                COALESCE(SUM(total_price), 0) as revenue
                            FROM service_requests 
                            WHERE status = 'completed' 
                            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
                            GROUP BY YEARWEEK(created_at)
                            ORDER BY period";
                    break;
                case 'yearly':
                    $sql = "SELECT 
                                YEAR(created_at) as period,
                                COALESCE(SUM(total_price), 0) as revenue
                            FROM service_requests 
                            WHERE status = 'completed' 
                            AND created_at >= DATE_SUB(NOW(), INTERVAL 5 YEAR)
                            GROUP BY YEAR(created_at)
                            ORDER BY period";
                    break;
                default: // monthly
                    $sql = "SELECT 
                                DATE_FORMAT(created_at, '%Y-%m') as period,
                                COALESCE(SUM(total_price), 0) as revenue
                            FROM service_requests 
                            WHERE status = 'completed' 
                            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                            ORDER BY period";
            }
            
            $stmt = $pdo->query($sql);
            $chartData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $chartData
            ]);
            break;
            
        case 'worker_payouts':
            $limit = $_GET['limit'] ?? 20;
            
            // Get worker payout summary
            $sql = "SELECT 
                        w.id as worker_id,
                        CONCAT(u.first_name, ' ', u.last_name) as worker_name,
                        u.email as worker_email,
                        COUNT(sr.id) as completed_jobs,
                        COALESCE(SUM(sr.total_price), 0) as total_earned,
                        COALESCE(SUM(sr.total_price * 0.90), 0) as worker_payout,
                        COALESCE(SUM(sr.total_price * 0.10), 0) as platform_commission,
                        COALESCE(AVG(sr.total_price), 0) as avg_job_value
                    FROM workers w
                    JOIN users u ON w.user_id = u.id
                    LEFT JOIN service_requests sr ON w.id = sr.worker_id AND sr.status = 'completed'
                    WHERE w.status = 'active'
                    GROUP BY w.id, u.first_name, u.last_name, u.email
                    HAVING completed_jobs > 0
                    ORDER BY total_earned DESC
                    LIMIT ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([(int)$limit]);
            $workerPayouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format data
            $formattedPayouts = array_map(function($payout) {
                return [
                    'worker_id' => (int)$payout['worker_id'],
                    'worker_name' => $payout['worker_name'],
                    'worker_email' => $payout['worker_email'],
                    'completed_jobs' => (int)$payout['completed_jobs'],
                    'total_earned' => (float)$payout['total_earned'],
                    'worker_payout' => (float)$payout['worker_payout'],
                    'platform_commission' => (float)$payout['platform_commission'],
                    'avg_job_value' => (float)$payout['avg_job_value']
                ];
            }, $workerPayouts);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedPayouts
            ]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action specified'
            ]);
            break;
    }
    
} catch (Exception $e) {
    error_log("Finance API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch finance data'
    ]);
}
?>
