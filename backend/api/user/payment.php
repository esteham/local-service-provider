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
require_once '../../classes/ServiceRequest.php';

// Check authentication
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$payment = new Payment();
$serviceRequest = new ServiceRequest();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            handlePost();
            break;
        case 'PUT':
            handlePut();
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Payment API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}

function handleGet() {
    global $payment;
    
    $action = $_GET['action'] ?? 'history';
    $userId = getCurrentUser()['id'];
    
    switch ($action) {
        case 'history':
            $limit = intval($_GET['limit'] ?? 50);
            $offset = intval($_GET['offset'] ?? 0);
            
            $payments = $payment->getUserPayments($userId, $limit, $offset);
            
            echo json_encode([
                'success' => true,
                'data' => $payments,
                'message' => 'Payment history retrieved successfully'
            ]);
            break;
            
        case 'pending':
            // Get service requests that are completed but not paid
            $pendingPayments = getPendingPayments($userId);
            
            echo json_encode([
                'success' => true,
                'data' => $pendingPayments,
                'message' => 'Pending payments retrieved successfully'
            ]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function handlePost() {
    global $payment, $serviceRequest;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $userId = getCurrentUser()['id'];
    
    switch ($action) {
        case 'initiate':
            $serviceRequestId = $input['service_request_id'] ?? null;
            $paymentMethod = $input['payment_method'] ?? null;
            
            if (!$serviceRequestId || !$paymentMethod) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Service request ID and payment method are required']);
                return;
            }
            
            // Validate service request belongs to user and is completed
            $request = $serviceRequest->getServiceRequestById($serviceRequestId);
            if (!$request || $request['user_id'] != $userId) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Service request not found or access denied']);
                return;
            }
            
            if ($request['status'] !== 'completed') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Service must be completed before payment']);
                return;
            }
            
            // Check if payment already exists
            $existingPayments = $payment->getPaymentsByServiceRequest($serviceRequestId);
            if (!empty($existingPayments)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Payment already exists for this service request']);
                return;
            }
            
            // Create payment
            $amount = $request['final_price'] ?: $request['base_price'];
            $result = $payment->createPayment($serviceRequestId, $userId, $request['worker_id'], $amount, $paymentMethod);
            
            if ($result['success']) {
                // If cash payment, generate verification code
                if ($paymentMethod === 'cash') {
                    $codeResult = $payment->processCashPayment($result['payment_id']);
                    if ($codeResult['success']) {
                        echo json_encode([
                            'success' => true,
                            'payment_id' => $result['payment_id'],
                            'payment_method' => 'cash',
                            'verification_code' => $codeResult['verification_code'],
                            'expires_at' => $codeResult['expires_at'],
                            'message' => 'Cash payment initiated. Verification code sent to worker.'
                        ]);
                    } else {
                        echo json_encode($codeResult);
                    }
                } else {
                    // For online payment, return payment details for frontend processing
                    echo json_encode([
                        'success' => true,
                        'payment_id' => $result['payment_id'],
                        'payment_method' => 'online',
                        'amount' => $amount,
                        'message' => 'Payment created successfully. Proceed with online payment.'
                    ]);
                }
            } else {
                echo json_encode($result);
            }
            break;
            
        case 'process_online':
            $paymentId = $input['payment_id'] ?? null;
            $paymentData = $input['payment_data'] ?? [];
            
            if (!$paymentId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Payment ID is required']);
                return;
            }
            
            // Validate payment belongs to user
            $paymentRecord = $payment->getPaymentById($paymentId);
            if (!$paymentRecord || $paymentRecord['user_id'] != $userId) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Payment not found or access denied']);
                return;
            }
            
            $result = $payment->processOnlinePayment($paymentId, $paymentData);
            echo json_encode($result);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function handlePut() {
    // Reserved for future payment updates (refunds, etc.)
    http_response_code(501);
    echo json_encode(['success' => false, 'message' => 'Payment updates not implemented yet']);
}

function getPendingPayments($userId) {
    global $serviceRequest;
    
    // Get completed service requests that don't have payments yet
    $query = "
        SELECT sr.*, s.name as service_name, s.description as service_description,
               COALESCE(sr.final_price, sr.base_price) as amount,
               u.first_name as worker_first_name, u.last_name as worker_last_name
        FROM service_requests sr
        LEFT JOIN services s ON sr.service_id = s.id
        LEFT JOIN workers w ON sr.worker_id = w.id
        LEFT JOIN users u ON w.user_id = u.id
        WHERE sr.user_id = ? 
        AND sr.status = 'completed' 
        AND sr.payment_status = 'pending'
        AND sr.id NOT IN (SELECT service_request_id FROM payments WHERE user_id = ?)
        ORDER BY sr.completed_at DESC
    ";
    
    $db = new DB();
    return $db->query($query, [$userId, $userId]) ?: [];
}
?>
