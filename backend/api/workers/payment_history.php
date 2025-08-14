<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../middleware/auth.php';
require_once '../../classes/Payment.php';

// Check authentication
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$user = getCurrentUser();
if ($user['role'] !== 'worker') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Worker access required']);
    exit;
}

// Get worker ID
$db = DB::getInstance();
$worker = $db->fetch("SELECT id FROM workers WHERE user_id = ?", [$user['id']]);

if (!$worker) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker profile not found']);
    exit;
}

$payment = new Payment();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($payment, $worker['id']);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Worker payment history API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}

function handleGet($payment, $workerId) {
    $action = $_GET['action'] ?? 'history';
    
    switch ($action) {
        case 'history':
            $limit = intval($_GET['limit'] ?? 50);
            $offset = intval($_GET['offset'] ?? 0);
            
            $payments = $payment->getWorkerPaymentHistory($workerId, $limit, $offset);
            
            echo json_encode([
                'success' => true,
                'data' => $payments,
                'message' => 'Payment history retrieved successfully'
            ]);
            break;
            
        case 'stats':
            // Get payment statistics for the worker
            $db = DB::getInstance();
            
            $stats = $db->fetch(
                "SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
                    SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_earnings,
                    SUM(CASE WHEN payment_status = 'completed' AND payment_method = 'cash' THEN 1 ELSE 0 END) as cash_payments,
                    SUM(CASE WHEN payment_status = 'completed' AND payment_method = 'online' THEN 1 ELSE 0 END) as online_payments,
                    AVG(CASE WHEN payment_status = 'completed' THEN amount ELSE NULL END) as avg_payment_amount
                 FROM worker_payment_history 
                 WHERE worker_id = ?",
                [$workerId]
            );
            
            // Get monthly earnings for the current year
            $monthlyEarnings = $db->fetchAll(
                "SELECT 
                    MONTH(payment_date) as month,
                    YEAR(payment_date) as year,
                    SUM(amount) as monthly_total,
                    COUNT(*) as monthly_count
                 FROM worker_payment_history 
                 WHERE worker_id = ? AND payment_status = 'completed' AND YEAR(payment_date) = YEAR(NOW())
                 GROUP BY YEAR(payment_date), MONTH(payment_date)
                 ORDER BY month",
                [$workerId]
            );
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'monthly_earnings' => $monthlyEarnings
                ],
                'message' => 'Payment statistics retrieved successfully'
            ]);
            break;
            
        case 'slip':
            $paymentId = $_GET['payment_id'] ?? null;
            $slipNumber = $_GET['slip_number'] ?? null;
            
            if ($paymentId) {
                $slip = $payment->getPaymentSlip($paymentId);
            } elseif ($slipNumber) {
                $slip = $payment->getPaymentSlipByNumber($slipNumber);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Payment ID or slip number is required']);
                return;
            }
            
            if (!$slip || $slip['worker_id'] != $workerId) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Payment slip not found']);
                return;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $slip,
                'message' => 'Payment slip retrieved successfully'
            ]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
?>
