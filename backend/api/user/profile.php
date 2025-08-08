<?php
require_once '../config/init.php';
require_once '../../classes/Auth.php';
require_once '../../classes/User.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
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

$user = new User();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $result = $user->getUserProfile($userId);
        // Add absolute image_url if image path exists
        if (!empty($result['success']) && !empty($result['data'])) {
            $imgPath = $result['data']['image'] ?? '';
            if ($imgPath) {
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $host = $_SERVER['HTTP_HOST'] ?? '';
                // Ensure proper path construction for stored relative path
                if (strpos($imgPath, '/backend/') !== 0) {
                    // If path doesn't start with /backend/, it's likely just the filename
                    $imgPath = '/backend' . $imgPath;
                }
                $result['data']['image_url'] = ($host ? ($protocol . '://' . $host) : '') . $imgPath;
            }
        }
        echo json_encode($result);
        exit;
    }

    if ($method === 'PUT' || ($method === 'POST' && ($_GET['action'] ?? '') === 'update')) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit;
        }
        // Only allow editable fields
        $allowed = ['username','email','phone','address','skills','experience','hourly_rate','availability'];
        $profileData = [];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $data)) {
                $profileData[$key] = $data[$key];
            }
        }
        $result = $user->updateUserProfile($userId, $profileData);
        echo json_encode($result);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
} catch (Exception $e) {
    error_log('Profile API error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
