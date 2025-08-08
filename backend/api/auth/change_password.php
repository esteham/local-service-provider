<?php
require_once '../config/init.php';
require_once '../../classes/Auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$auth = new Auth();
if (!$auth->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$current = $auth->getCurrentUser();
if (!$current['success']) {
    echo json_encode(['success' => false, 'message' => 'Invalid user session']);
    exit;
}
$userId = $current['data']['id'];

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

$currentPassword = trim($payload['current_password'] ?? '');
$newPassword = trim($payload['new_password'] ?? '');

if ($currentPassword === '' || $newPassword === '') {
    echo json_encode(['success' => false, 'message' => 'Current and new password are required']);
    exit;
}

$result = $auth->changePassword($userId, $currentPassword, $newPassword);
echo json_encode($result);
