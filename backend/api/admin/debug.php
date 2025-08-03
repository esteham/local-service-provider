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
require_once '../../middleware/auth.php';

try {
    // Debug session information
    $debug_info = [
        'session_status' => session_status(),
        'session_id' => session_id(),
        'session_data' => $_SESSION ?? 'No session data',
        'php_session_none' => PHP_SESSION_NONE,
        'php_session_active' => PHP_SESSION_ACTIVE
    ];
    
    // Test authentication functions
    $auth_info = [
        'isAuthenticated' => isAuthenticated(),
        'isAdmin' => function_exists('isAdmin') ? isAdmin() : 'Function not found',
        'getCurrentUser' => function_exists('getCurrentUser') ? getCurrentUser() : 'Function not found'
    ];
    
    // Test database connection
    try {
        $pdo = DatabaseConfig::getConnection();
        $db_info = [
            'connection' => 'Success',
            'database_name' => $pdo->query('SELECT DATABASE()')->fetchColumn()
        ];
    } catch (Exception $e) {
        $db_info = [
            'connection' => 'Failed',
            'error' => $e->getMessage()
        ];
    }
    
    echo json_encode([
        'success' => true,
        'debug' => $debug_info,
        'auth' => $auth_info,
        'database' => $db_info,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
    
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
