<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../middleware/auth.php';
require_once '../../classes/Payment.php';
require_once '../../classes/DatabaseConfig.php';

// Suppress PHP errors to ensure clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Check authentication
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'worker') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Worker access required']);
    exit;
}

// Get worker ID
$db = DatabaseConfig::getConnection();
$stmt = $db->prepare("SELECT id FROM workers WHERE user_id = ?");
$stmt->execute([$currentUser['id']]);
$worker = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$worker) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker profile not found']);
    exit;
}

$workerId = $worker['id'];
$payment = new Payment();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($workerId);
            break;
        case 'POST':
            handlePost($workerId);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Worker payment verification API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}

function handleGet($workerId) {
    global $payment;
    
    $action = $_GET['action'] ?? 'pending_codes';
    
    switch ($action) {
        case 'pending_codes':
            // Get pending cash payment codes for this worker
            $pendingCodes = getPendingCashPayments($workerId);
            
            echo json_encode([
                'success' => true,
                'data' => $pendingCodes,
                'message' => 'Pending cash payments retrieved successfully'
            ]);
            break;
            
        case 'earnings':
            // Get worker earnings history
            $earnings = getWorkerEarnings($workerId);
            
            echo json_encode([
                'success' => true,
                'data' => $earnings,
                'message' => 'Earnings history retrieved successfully'
            ]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function handlePost($workerId) {
    global $payment;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'verify_code':
            $verificationCode = $input['verification_code'] ?? '';
            
            if (!$verificationCode) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Verification code is required']);
                return;
            }
            
            // Verify the code
            $result = $payment->verifyCashPaymentCode($verificationCode, $workerId);
            
            if ($result['success']) {
                echo json_encode([
                    'success' => true,
                    'payment_id' => $result['payment_id'],
                    'service_request_id' => $result['service_request_id'],
                    'message' => 'Cash payment verified successfully! Payment has been marked as completed.'
                ]);
            } else {
                echo json_encode($result);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function getPendingCashPayments($workerId) {
    $db = DatabaseConfig::getConnection();
    
    $query = "
        SELECT cpc.*, p.amount, sr.title as service_title, sr.id as service_request_id,
               u.first_name as customer_first_name, u.last_name as customer_last_name,
               s.name as service_name
        FROM cash_payment_codes cpc
        JOIN payments p ON cpc.payment_id = p.id
        JOIN service_requests sr ON cpc.service_request_id = sr.id
        JOIN users u ON sr.user_id = u.id
        LEFT JOIN services s ON sr.service_id = s.id
        WHERE cpc.worker_id = ? 
        AND cpc.is_used = FALSE 
        AND cpc.expires_at > NOW()
        ORDER BY cpc.created_at DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$workerId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getWorkerEarnings($workerId) {
    $db = DatabaseConfig::getConnection();
    
    $query = "
        SELECT we.*, sr.title as service_title, sr.service_type,
               u.first_name as customer_first_name, u.last_name as customer_last_name,
               p.paid_at, p.payment_method
        FROM worker_earnings we
        JOIN service_requests sr ON we.service_request_id = sr.id
        JOIN users u ON sr.user_id = u.id
        JOIN payments p ON we.payment_id = p.id
        WHERE we.worker_id = ?
        ORDER BY we.created_at DESC
        LIMIT 50
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$workerId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>
