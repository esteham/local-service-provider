<?php
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
            // Get all workers with user details
            $sql = "SELECT 
                        w.id,
                        w.user_id,
                        w.specialization,
                        w.phone,
                        w.rating,
                        w.completed_jobs,
                        w.status,
                        w.created_at,
                        u.first_name,
                        u.last_name,
                        CONCAT(u.first_name, ' ', u.last_name) as name,
                        u.email,
                        u.status as user_status,
                        c.name as category_name
                    FROM workers w
                    JOIN users u ON w.user_id = u.id
                    LEFT JOIN categories c ON w.category_id = c.id
                    WHERE u.status = 'active'
                    ORDER BY w.created_at DESC";
            
            $stmt = $pdo->query($sql);
            $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the data
            $formattedWorkers = array_map(function($worker) {
                return [
                    'id' => (int)$worker['id'],
                    'user_id' => (int)$worker['user_id'],
                    'name' => $worker['name'],
                    'first_name' => $worker['first_name'],
                    'last_name' => $worker['last_name'],
                    'email' => $worker['email'],
                    'phone' => $worker['phone'],
                    'specialization' => $worker['specialization'],
                    'category_name' => $worker['category_name'],
                    'status' => $worker['status'],
                    'rating' => (float)$worker['rating'],
                    'completed_jobs' => (int)$worker['completed_jobs'],
                    'completedJobs' => (int)$worker['completed_jobs'], // For compatibility
                    'created_at' => $worker['created_at']
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
