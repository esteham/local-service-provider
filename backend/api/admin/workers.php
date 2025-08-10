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

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
DatabaseConfig::createDatabase();
    
    // Get database connection
$pdo = DatabaseConfig::getConnection();

try {
    switch ($method) {
        case 'GET':
            // Get all workers with user details using correct schema
            $sql = "SELECT 
                        w.id,
                        w.user_id,
                        w.phone,
                        w.first_name,
                        w.last_name,
                        w.address,
                        w.skills,
                        w.experience,
                        w.hourly_rate,
                        w.availability,
                        w.status,
                        w.join_date,
                        w.zone_id,
                        w.area_id,
                        u.username,
                        u.email,
                        u.status as user_status,
                        c.name as category_name,
                        z.name as zone_name,
                        a.name as area_name
                    FROM workers w
                    JOIN users u ON w.user_id = u.id
                    LEFT JOIN categories c ON w.category_id = c.id
                    LEFT JOIN zones z ON w.zone_id = z.id
                    LEFT JOIN areas a ON w.area_id = a.id
                    WHERE 1=1";
            
            $params = [];
            
            // Add zone filtering
            if (isset($_GET['zone_id']) && !empty($_GET['zone_id'])) {
                $sql .= " AND w.zone_id = ?";
                $params[] = (int)$_GET['zone_id'];
            }
            
            // Add area filtering
            if (isset($_GET['area_id']) && !empty($_GET['area_id'])) {
                $sql .= " AND w.area_id = ?";
                $params[] = (int)$_GET['area_id'];
            }
            
            // Add status filtering
            if (isset($_GET['status']) && !empty($_GET['status'])) {
                $sql .= " AND w.status = ?";
                $params[] = $_GET['status'];
            }
            
            $sql .= " ORDER BY w.join_date DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the data for frontend compatibility
            $formattedWorkers = array_map(function($worker) {
                return [
                    'id' => (int)$worker['id'],
                    'user_id' => (int)$worker['user_id'],
                    'name' => trim($worker['first_name'] . ' ' . $worker['last_name']),
                    'first_name' => $worker['first_name'],
                    'last_name' => $worker['last_name'],
                    'email' => $worker['email'],
                    'phone' => $worker['phone'],
                    'specialization' => $worker['skills'], // Map skills to specialization
                    'category_name' => $worker['category_name'] ?? 'General',
                    'status' => $worker['status'],
                    'rating' => (float)($worker['hourly_rate'] ?? 0), // Use hourly_rate as rating for demo
                    'completed_jobs' => (int)($worker['experience'] ?? 0), // Use experience as completed jobs
                    'completedJobs' => (int)($worker['experience'] ?? 0),
                    'created_at' => $worker['join_date'],
                    'zone_id' => (int)($worker['zone_id'] ?? 0),
                    'area_id' => (int)($worker['area_id'] ?? 0),
                    'zone_name' => $worker['zone_name'] ?? '',
                    'area_name' => $worker['area_name'] ?? ''
                ];
            }, $workers);
            
            echo json_encode([
                'success' => true,
                'data' => $formattedWorkers
            ]);
            break;
            
        case 'DELETE':
            // Delete worker
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Worker ID is required'
                ]);
                exit;
            }
            
            // Get worker's user_id first
            $stmt = $pdo->prepare("SELECT user_id FROM workers WHERE id = ?");
            $stmt->execute([$input['id']]);
            $worker = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$worker) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Worker not found'
                ]);
                exit;
            }
            
            // Start transaction
            $pdo->beginTransaction();
            
            try {
                // Delete worker record
                $stmt = $pdo->prepare("DELETE FROM workers WHERE id = ?");
                $stmt->execute([$input['id']]);
                
                // Set user status to inactive or delete user record
                $stmt = $pdo->prepare("UPDATE users SET status = 'inactive' WHERE id = ?");
                $stmt->execute([$worker['user_id']]);
                
                $pdo->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Worker deleted successfully'
                ]);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;
            
        case 'PUT':
            // Update worker status
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Worker ID is required'
                ]);
                exit;
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($input['status'])) {
                $updateFields[] = "status = ?";
                $params[] = $input['status'];
            }
            
            if (isset($input['rating'])) {
                $updateFields[] = "rating = ?";
                $params[] = $input['rating'];
            }
            
            if (isset($input['specialization'])) {
                $updateFields[] = "specialization = ?";
                $params[] = $input['specialization'];
            }
            
            if (isset($input['phone'])) {
                $updateFields[] = "phone = ?";
                $params[] = $input['phone'];
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'No fields to update'
                ]);
                exit;
            }
            
            $params[] = $input['id'];
            
            $sql = "UPDATE workers SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Worker updated successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
    
} catch (Exception $e) {
    error_log("Workers API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
