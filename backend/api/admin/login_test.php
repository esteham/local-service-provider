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

try {
    // Test login with admin credentials
    $username = 'admin';
    $password = '09876543';
    
    // Simulate the login process
    require_once '../../classes/class_functions.php';
    
    $admin = new Admin();
    $result = $admin->login($username, $password);
    
    if ($result['success']) {
        $_SESSION['user'] = [
            'id' => $result['data']['id'],
            'role' => $result['data']['role']
        ];
        
        // Now test authentication
        require_once '../../middleware/auth.php';
        
        $auth_test = [
            'isAuthenticated' => isAuthenticated(),
            'isAdmin' => isAdmin(),
            'session_data' => $_SESSION,
            'getCurrentUser' => getCurrentUser()
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Login and authentication test successful',
            'login_result' => $result,
            'auth_test' => $auth_test
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Login failed',
            'error' => $result['message']
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
