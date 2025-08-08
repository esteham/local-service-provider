<?php
require_once '../config/init.php';
require_once '../../classes/Auth.php';
require_once '../../classes/DB.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

try {
    $db = DB::getInstance();
    $requests = $db->fetchAll(
        "SELECT r.id, r.title, r.description, r.address, r.urgency, r.status,
                r.base_price, r.final_price, r.scheduled_at, r.created_at,
                s.name AS service_name,
                a.name AS area_name,
                z.name AS zone_name
         FROM service_requests r
         LEFT JOIN services s ON r.service_id = s.id
         LEFT JOIN areas a ON r.area_id = a.id
         LEFT JOIN zones z ON a.zone_id = z.id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC",
        [$userId]
    );

    echo json_encode(['success' => true, 'data' => $requests]);
} catch (Exception $e) {
    error_log('User requests error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to load request history']);
}
