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

DatabaseConfig::createDatabase();
$db = DatabaseConfig::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'single' && isset($_GET['id'])) {
                // Get single division with stats
                $stmt = $db->prepare("
                    SELECT d.*, 
                           COUNT(DISTINCT w.id) as workers_count,
                           COUNT(DISTINCT sr.id) as active_requests
                    FROM divisions d
                    LEFT JOIN districts dt ON dt.division_id = d.id
                    LEFT JOIN upazilas u ON u.district_id = dt.id
                    LEFT JOIN zones z ON z.upazila_id = u.id
                    LEFT JOIN areas a ON a.zone_id = z.id
                    LEFT JOIN worker_zones wz ON wz.zone_id = z.id
                    LEFT JOIN workers w ON w.id = wz.worker_id
                    LEFT JOIN service_requests sr ON sr.area_id = a.id AND sr.status IN ('pending', 'assigned', 'in_progress')
                    WHERE d.id = ?
                    GROUP BY d.id
                ");
                $stmt->execute([$_GET['id']]);
                $division = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($division) {
                    echo json_encode(['success' => true, 'data' => $division]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Division not found']);
                }
            } else {
                // Get all divisions with stats
                $stmt = $db->prepare("
                    SELECT d.*, 
                           COUNT(DISTINCT w.id) as workers_count,
                           COUNT(DISTINCT sr.id) as active_requests
                    FROM divisions d
                    LEFT JOIN districts dt ON dt.division_id = d.id
                    LEFT JOIN upazilas u ON u.district_id = dt.id
                    LEFT JOIN zones z ON z.upazila_id = u.id
                    LEFT JOIN areas a ON a.zone_id = z.id
                    LEFT JOIN worker_zones wz ON wz.zone_id = z.id
                    LEFT JOIN workers w ON w.id = wz.worker_id
                    LEFT JOIN service_requests sr ON sr.area_id = a.id AND sr.status IN ('pending', 'assigned', 'in_progress')
                    GROUP BY d.id
                    ORDER BY d.name ASC
                ");
                $stmt->execute();
                $divisions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $divisions]);
            }
            break;

        case 'POST':
            // Create new division
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || empty(trim($input['name']))) {
                echo json_encode(['success' => false, 'message' => 'Division name is required']);
                break;
            }
            
            $name = trim($input['name']);
            $description = trim($input['description'] ?? '');
            $manager = trim($input['manager'] ?? '');
            
            // Check if division already exists
            $stmt = $db->prepare("SELECT id FROM divisions WHERE name = ?");
            $stmt->execute([$name]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Division already exists']);
                break;
            }
            
            $stmt = $db->prepare("INSERT INTO divisions (name, description, manager, created_at) VALUES (?, ?, ?, NOW())");
            if ($stmt->execute([$name, $description, $manager])) {
                $divisionId = $db->lastInsertId();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Division created successfully',
                    'data' => ['id' => $divisionId]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create division']);
            }
            break;

        case 'PUT':
            // Update division
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id']) || !isset($input['name']) || empty(trim($input['name']))) {
                echo json_encode(['success' => false, 'message' => 'Division ID and name are required']);
                break;
            }
            
            $id = $input['id'];
            $name = trim($input['name']);
            $description = trim($input['description'] ?? '');
            $manager = trim($input['manager'] ?? '');
            
            // Check if division exists
            $stmt = $db->prepare("SELECT id FROM divisions WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Division not found']);
                break;
            }
            
            // Check if name already exists for different division
            $stmt = $db->prepare("SELECT id FROM divisions WHERE name = ? AND id != ?");
            $stmt->execute([$name, $id]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Division name already exists']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE divisions SET name = ?, description = ?, manager = ?, updated_at = NOW() WHERE id = ?");
            if ($stmt->execute([$name, $description, $manager, $id])) {
                echo json_encode(['success' => true, 'message' => 'Division updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update division']);
            }
            break;

        case 'DELETE':
            // Delete division
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'Division ID is required']);
                break;
            }
            
            $id = $input['id'];
            
            // Check if division exists
            $stmt = $db->prepare("SELECT id FROM divisions WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Division not found']);
                break;
            }
            
            // Check if division has districts
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM districts WHERE division_id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete division. It contains districts.']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM divisions WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Division deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete division']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Divisions API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
