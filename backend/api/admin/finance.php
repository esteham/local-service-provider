<?php
// Suppress PHP errors to prevent JSON contamination
error_reporting(0);
ini_set('display_errors', 0);

require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';
require_once '../../classes/Payment.php';

// Add CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    // Get database connection
    $db = DatabaseConfig::getConnection();
    $payment = new Payment();
    $action = $_GET['action'] ?? 'overview';
    
    switch ($action) {
        case 'overview':
            try {
                $payment = new Payment();
                
                // Get basic financial overview using proper PDO methods
                $stmt = $db->prepare("SELECT COALESCE(SUM(final_price), 0) as total FROM service_requests WHERE status IN ('completed', 'paid')");
                $stmt->execute();
                $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                $stmt = $db->prepare("SELECT COALESCE(SUM(final_price), 0) as total FROM service_requests WHERE status IN ('completed', 'paid') AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
                $stmt->execute();
                $monthlyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                $stmt = $db->prepare("SELECT COALESCE(SUM(final_price), 0) as total FROM service_requests WHERE status = 'pending'");
                $stmt->execute();
                $pendingPayments = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                $stmt = $db->prepare("SELECT COUNT(*) as count FROM service_requests WHERE status IN ('completed', 'paid')");
                $stmt->execute();
                $transactionCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                $avgTransaction = $transactionCount > 0 ? $totalRevenue / $transactionCount : 0;
                
                // Get admin commission data with fallback
                $commissionSummary = $payment->getAdminCommissionSummary();
                $monthlyCommissionSummary = $payment->getAdminCommissionSummary(
                    date('Y-m-01'), 
                    date('Y-m-t')
                );
                
                // Calculate fallback commission if admin_earnings table is empty
                $totalCommission = $commissionSummary['total_commission'];
                $monthlyCommission = $monthlyCommissionSummary['total_commission'];
                
                // If no commission data exists, calculate from completed payments
                if ($totalCommission == 0 && $totalRevenue > 0) {
                    $totalCommission = $totalRevenue * 0.10; // 10% commission
                }
                if ($monthlyCommission == 0 && $monthlyRevenue > 0) {
                    $monthlyCommission = $monthlyRevenue * 0.10; // 10% commission
                }
                
                $response = [
                    'success' => true,
                    'data' => [
                        'totalRevenue' => floatval($totalRevenue),
                        'monthlyRevenue' => floatval($monthlyRevenue),
                        'pendingPayments' => floatval($pendingPayments),
                        'platformCommission' => floatval($totalCommission),
                        'workerPayouts' => floatval($totalRevenue - $totalCommission),
                        'averageTransaction' => floatval($avgTransaction),
                        'transactionCount' => intval($transactionCount),
                        'monthlyCommission' => floatval($monthlyCommission),
                        'pendingCommission' => floatval($pendingPayments * 0.10),
                        'completedTransactions' => intval($transactionCount),
                        'averageCommission' => floatval($avgTransaction * 0.10),
                        'commissionRate' => 10.0,
                        
                        // Admin commission data
                        'admin_commission' => [
                            'total_commission' => floatval($totalCommission),
                            'monthly_commission' => floatval($monthlyCommission),
                            'total_transactions' => intval($commissionSummary['total_transactions'] ?: $transactionCount),
                            'avg_commission_rate' => floatval($commissionSummary['avg_commission_rate'])
                        ]
                    ]
                ];
            } catch (Exception $e) {
                $response = [
                    'success' => false,
                    'message' => 'Failed to fetch financial overview: ' . $e->getMessage()
                ];
            }
            
            echo json_encode($response);
            break;
            
        case 'transactions':
            try {
                $limit = $_GET['limit'] ?? 50;
                $offset = $_GET['offset'] ?? 0;
                
                // Get admin commission transactions from admin_earnings table
                $transactions = $payment->getAdminCommissionTransactions($limit, $offset);
                
                // Format transactions for frontend
                $formattedTransactions = array_map(function($transaction) {
                    return [
                        'id' => (int)$transaction['id'],
                        'payment_id' => (int)$transaction['payment_id'],
                        'service_request_id' => (int)$transaction['service_request_id'],
                        'amount' => (float)$transaction['gross_amount'],
                        'commission_amount' => (float)$transaction['commission_amount'],
                        'commission_rate' => (float)$transaction['commission_rate'],
                        'worker_net_amount' => (float)$transaction['worker_net_amount'],
                        'status' => $transaction['status'],
                        'service_name' => $transaction['service_name'] ?? $transaction['service_title'],
                        'customer_name' => $transaction['customer_name'],
                        'customer_email' => $transaction['customer_email'],
                        'worker_name' => $transaction['worker_name'],
                        'worker_email' => $transaction['worker_email'],
                        'created_at' => $transaction['created_at'],
                        'processed_at' => $transaction['processed_at']
                    ];
                }, $transactions);
            } catch (Exception $e) {
                // Return empty array when database queries fail
                error_log("Finance transactions query failed: " . $e->getMessage());
                $formattedTransactions = [];
            }
            
            echo json_encode([
                'success' => true,
                'data' => $formattedTransactions
            ]);
            break;
            
        case 'revenue_chart':
            $period = $_GET['period'] ?? 'monthly';
            
            // Get admin commission chart data using Payment class
            $chartData = $payment->getAdminCommissionByPeriod($period, 12);
            
            // Format data for chart display
            $formattedData = array_map(function($item) {
                return [
                    'period' => $item['period'],
                    'revenue' => (float)$item['revenue'],
                    'commission' => (float)$item['commission'],
                    'transactions' => (int)$item['transactions']
                ];
            }, $chartData);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedData
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
            
            $stmt = $db->prepare($sql);
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
            
        case 'admin_commission':
            // Get admin commission summary and transactions
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            $period = $_GET['period'] ?? 'monthly';
            
            $summary = $payment->getAdminCommissionSummary($startDate, $endDate);
            $chartData = $payment->getAdminCommissionByPeriod($period, 12);
            $recentTransactions = $payment->getAdminCommissionTransactions(10, 0);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'chart_data' => $chartData,
                    'recent_transactions' => $recentTransactions
                ]
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
