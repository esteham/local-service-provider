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

session_start();
require_once '../../middleware/auth.php';
require_once '../../config/database.php';

// Check authentication
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'worker') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get worker ID from session
$user_id = $_SESSION['user']['id'];
$worker_query = "SELECT id FROM workers WHERE user_id = ?";
$worker_stmt = $db->prepare($worker_query);
$worker_stmt->execute([$user_id]);
$worker = $worker_stmt->fetch(PDO::FETCH_ASSOC);

if (!$worker) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker not found']);
    exit;
}

$worker_id = $worker['id'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get worker settings
        $sql = "SELECT w.*, u.email, u.phone
                FROM workers w
                LEFT JOIN users u ON w.user_id = u.id
                WHERE w.id = ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$worker_id]);
        $worker_data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get or create settings record
        $settings_sql = "SELECT * FROM worker_settings WHERE worker_id = ?";
        $settings_stmt = $db->prepare($settings_sql);
        $settings_stmt->execute([$worker_id]);
        $settings = $settings_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$settings) {
            // Create default settings
            $create_sql = "INSERT INTO worker_settings (worker_id, email_notifications, sms_notifications, auto_accept_radius, working_hours_start, working_hours_end) VALUES (?, 1, 1, 10, '09:00', '17:00')";
            $create_stmt = $db->prepare($create_sql);
            $create_stmt->execute([$worker_id]);
            
            $settings = [
                'email_notifications' => 1,
                'sms_notifications' => 1,
                'auto_accept_radius' => 10,
                'working_hours_start' => '09:00',
                'working_hours_end' => '17:00'
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'email' => $worker_data['email'],
                'phone' => $worker_data['phone'],
                'email_notifications' => (bool)$settings['email_notifications'],
                'sms_notifications' => (bool)$settings['sms_notifications'],
                'auto_accept_radius' => $settings['auto_accept_radius'],
                'working_hours_start' => $settings['working_hours_start'],
                'working_hours_end' => $settings['working_hours_end']
            ]
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update worker settings
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Update user email/phone if provided
        if (isset($input['email']) || isset($input['phone'])) {
            $user_sql = "UPDATE users SET email = ?, phone = ? WHERE id = ?";
            $user_stmt = $db->prepare($user_sql);
            $user_stmt->execute([
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $user_id
            ]);
        }
        
        // Update worker settings
        $settings_sql = "UPDATE worker_settings SET 
                        email_notifications = ?, sms_notifications = ?, 
                        auto_accept_radius = ?, working_hours_start = ?, working_hours_end = ?
                        WHERE worker_id = ?";
        
        $settings_stmt = $db->prepare($settings_sql);
        $result = $settings_stmt->execute([
            $input['email_notifications'] ? 1 : 0,
            $input['sms_notifications'] ? 1 : 0,
            $input['auto_accept_radius'] ?? 10,
            $input['working_hours_start'] ?? '09:00',
            $input['working_hours_end'] ?? '17:00',
            $worker_id
        ]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Settings updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update settings']);
        }
    }
    
} catch (Exception $e) {
    error_log("Worker Settings API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
