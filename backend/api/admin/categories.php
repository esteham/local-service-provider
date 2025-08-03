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
                // Get single category
                $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $category = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($category) {
                    echo json_encode(['success' => true, 'data' => $category]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Category not found']);
                }
            } else {
                // Get all categories
                $stmt = $db->prepare("SELECT * FROM categories ORDER BY name ASC");
                $stmt->execute();
                $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $categories]);
            }
            break;

        case 'POST':
            // Create new category
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || empty(trim($input['name']))) {
                echo json_encode(['success' => false, 'message' => 'Category name is required']);
                break;
            }
            
            $name = trim($input['name']);
            $description = trim($input['description'] ?? '');
            $active = isset($input['active']) ? (bool)$input['active'] : true;
            
            // Check if category already exists
            $stmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
            $stmt->execute([$name]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Category already exists']);
                break;
            }
            
            $stmt = $db->prepare("INSERT INTO categories (name, description, active, created_at) VALUES (?, ?, ?, NOW())");
            if ($stmt->execute([$name, $description, $active])) {
                $categoryId = $db->lastInsertId();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Category created successfully',
                    'data' => ['id' => $categoryId]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create category']);
            }
            break;

        case 'PUT':
            // Update category
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id']) || !isset($input['name']) || empty(trim($input['name']))) {
                echo json_encode(['success' => false, 'message' => 'Category ID and name are required']);
                break;
            }
            
            $id = $input['id'];
            $name = trim($input['name']);
            $description = trim($input['description'] ?? '');
            $active = isset($input['active']) ? (bool)$input['active'] : true;
            
            // Check if category exists
            $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Category not found']);
                break;
            }
            
            // Check if name already exists for different category
            $stmt = $db->prepare("SELECT id FROM categories WHERE name = ? AND id != ?");
            $stmt->execute([$name, $id]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Category name already exists']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE categories SET name = ?, description = ?, active = ?, updated_at = NOW() WHERE id = ?");
            if ($stmt->execute([$name, $description, $active, $id])) {
                echo json_encode(['success' => true, 'message' => 'Category updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update category']);
            }
            break;

        case 'DELETE':
            // Delete category
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'message' => 'Category ID is required']);
                break;
            }
            
            $id = $input['id'];
            
            // Check if category exists
            $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Category not found']);
                break;
            }
            
            // Check if category is being used by services
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM services WHERE category_id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Cannot delete category. It is being used by services.']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Category deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete category']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Categories API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
