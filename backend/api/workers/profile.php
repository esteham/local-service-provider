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
if (!$currentUser) {
    error_log("Profile API: getCurrentUser() returned null");
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

if ($currentUser['role'] !== 'worker') {
    error_log("Profile API: User role is '{$currentUser['role']}', expected 'worker'");
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Access denied. Worker role required.']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get worker ID from session
$user_id = $_SESSION['user']['id'];
error_log("Profile API: Looking for worker with user_id: $user_id");

$worker_query = "SELECT id FROM workers WHERE user_id = ?";
$worker_stmt = $db->prepare($worker_query);
$worker_stmt->execute([$user_id]);
$worker = $worker_stmt->fetch(PDO::FETCH_ASSOC);

if (!$worker) {
    error_log("Profile API: No worker found for user_id: $user_id");
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Worker profile not found. Please contact admin.']);
    exit;
}

error_log("Profile API: Found worker with ID: {$worker['id']}");

$worker_id = $worker['id'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get worker profile data
        $sql = "SELECT w.*, u.username, u.email, u.phone, u.created_at,
                       a.name as area_name, z.name as zone_name
                FROM workers w
                LEFT JOIN users u ON w.user_id = u.id
                LEFT JOIN areas a ON w.area_id = a.id
                LEFT JOIN zones z ON a.zone_id = z.id
                WHERE w.id = ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$worker_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($profile) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $profile['id'],
                    'first_name' => $profile['first_name'],
                    'last_name' => $profile['last_name'],
                    'email' => $profile['email'],
                    'phone' => $profile['phone'],
                    'skills' => $profile['skills'] ?: 'Plumbing, Electrical, HVAC',
                    'experience_years' => $profile['experience_years'] ?: 5,
                    'hourly_rate' => $profile['hourly_rate'] ?: 25,
                    'bio' => $profile['bio'] ?: 'Experienced service professional with expertise in multiple trades.',
                    'certifications' => $profile['certifications'] ?: 'Licensed Professional',
                    'area_name' => $profile['area_name'],
                    'zone_name' => $profile['zone_name'],
                    'status' => $profile['status'],
                    'availability' => $profile['availability'],
                    'created_at' => $profile['created_at']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Profile not found']);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update worker profile
        $input = json_decode(file_get_contents('php://input'), true);
        
        $sql = "UPDATE workers SET 
                first_name = ?, last_name = ?, skills = ?, 
                experience_years = ?, hourly_rate = ?, bio = ?, certifications = ?
                WHERE id = ?";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            $input['first_name'],
            $input['last_name'],
            $input['skills'],
            $input['experience_years'],
            $input['hourly_rate'],
            $input['bio'],
            $input['certifications'],
            $worker_id
        ]);
        
        // Also update user table for email and phone
        if (isset($input['email']) || isset($input['phone'])) {
            $user_sql = "UPDATE users SET email = ?, phone = ? WHERE id = ?";
            $user_stmt = $db->prepare($user_sql);
            $user_stmt->execute([
                $input['email'],
                $input['phone'],
                $user_id
            ]);
        }
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
        }
    }
    
} catch (Exception $e) {
    error_log("Worker Profile API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
