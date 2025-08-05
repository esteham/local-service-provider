<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once '../../classes/Auth.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input)) {
        echo json_encode(['success' => false, 'message' => 'No input data received']);
        exit;
    }
    
    // Validate required fields
    if (empty($input['user_id']) || empty($input['otp_code'])) {
        echo json_encode(['success' => false, 'message' => 'User ID and OTP code are required']);
        exit;
    }
    
    $userId = (int)$input['user_id'];
    $otpCode = trim($input['otp_code']);
    
    // Validate OTP format (6 digits)
    if (!preg_match('/^\d{6}$/', $otpCode)) {
        echo json_encode(['success' => false, 'message' => 'OTP must be 6 digits']);
        exit;
    }
    
    $auth = new Auth();
    $result = $auth->verifyOTP($userId, $otpCode);
    
    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(400);
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    error_log('OTP verification error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>
