<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Test step 1: Basic response
    $step = $_GET['step'] ?? '1';
    
    if ($step == '1') {
        echo json_encode(['success' => true, 'message' => 'Step 1: Basic response working']);
        exit;
    }
    
    // Test step 2: Include init.php
    if ($step == '2') {
        require_once '../config/init.php';
        echo json_encode(['success' => true, 'message' => 'Step 2: init.php included successfully']);
        exit;
    }
    
    // Test step 3: Include database.php
    if ($step == '3') {
        require_once '../config/init.php';
        require_once '../../config/database.php';
        echo json_encode(['success' => true, 'message' => 'Step 3: database.php included successfully']);
        exit;
    }
    
    // Test step 4: Include auth.php
    if ($step == '4') {
        require_once '../config/init.php';
        require_once '../../config/database.php';
        require_once '../../middleware/auth.php';
        echo json_encode(['success' => true, 'message' => 'Step 4: auth.php included successfully']);
        exit;
    }
    
    // Test step 5: Include class_functions.php
    if ($step == '5') {
        require_once '../config/init.php';
        require_once '../../config/database.php';
        require_once '../../middleware/auth.php';
        require_once '../../classes/class_functions.php';
        echo json_encode(['success' => true, 'message' => 'Step 5: class_functions.php included successfully']);
        exit;
    }
    
    // Test step 6: Test authentication functions
    if ($step == '6') {
        require_once '../config/init.php';
        require_once '../../config/database.php';
        require_once '../../middleware/auth.php';
        
        $auth_test = [
            'isAuthenticated' => isAuthenticated(),
            'session_data' => $_SESSION ?? 'No session'
        ];
        
        echo json_encode(['success' => true, 'message' => 'Step 6: Auth functions working', 'data' => $auth_test]);
        exit;
    }
    
    echo json_encode(['success' => false, 'message' => 'Invalid step parameter']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Fatal Error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
