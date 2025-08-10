<?php
error_reporting(0);
ini_set('display_errors', 0);
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
require_once '../../classes/DB.php';

// Check authentication
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'worker') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if (false) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Workers only.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $db = DB::getInstance();
    $userId = $_SESSION['user']['id'];
    
    // Get worker ID from workers table using user_id
    $worker = $db->fetch(
        "SELECT id FROM workers WHERE user_id = ? AND status = 'active'",
        [$userId]
    );
    
    if (!$worker) {
        echo json_encode(['success' => false, 'message' => 'Worker profile not found or inactive']);
        exit;
    }
    
    $workerId = $worker['id'];
    
    // Get input data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['availability'])) {
        echo json_encode(['success' => false, 'message' => 'Availability status is required']);
        exit;
    }
    
    $availability = $data['availability'];
    
    // Validate availability status
    $validStatuses = ['available', 'busy', 'offline'];
    if (!in_array($availability, $validStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid availability status']);
        exit;
    }
    
    // Update worker availability
    $updated = $db->update(
        'workers', 
        ['availability' => $availability], 
        ['id' => $workerId]
    );
    
    if (!$updated) {
        throw new Exception('Failed to update availability');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Availability updated successfully',
        'data' => [
            'worker_id' => $workerId,
            'availability' => $availability,
            'updated_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Worker availability update failed: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update availability. Please try again.'
    ]);
}
?>
