<?php
// Authentication middleware functions

function isAuthenticated() {
    // Check if user is logged in via session
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['user']['id']) && !empty($_SESSION['user']['id']);
}

function getCurrentUser() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isAuthenticated()) {
        return null;
    }
    
    try {
        require_once __DIR__ . '/../config/database.php';
        $pdo = DatabaseConfig::getConnection();
        $stmt = $pdo->prepare("SELECT id, username, email, role, status FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user']['id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Get current user error: " . $e->getMessage());
        return null;
    }
}

function isAdmin() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    // Check if user is logged in and has admin role in session
    if (isset($_SESSION['user']['role']) && $_SESSION['user']['role'] === 'admin') {
        return true;
    }
    
    // Fallback: check database
    $user = getCurrentUser();
    return $user && $user['role'] === 'admin';
}

function isWorker() {
    $user = getCurrentUser();
    return $user && $user['role'] === 'worker';
}

function isAgent() {
    $user = getCurrentUser();
    return $user && $user['role'] === 'agent';
}

function hasRole($role) {
    $user = getCurrentUser();
    return $user && $user['role'] === $role;
}

function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
}

function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
}

function requireRole($role) {
    requireAuth();
    if (!hasRole($role)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => ucfirst($role) . ' access required']);
        exit;
    }
}

function getDBConnection() {
    require_once __DIR__ . '/../config/database.php';
    return DatabaseConfig::getConnection();
}
?>
