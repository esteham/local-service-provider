<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../classes/DB.php';

$db = DB::getInstance();

// Method & action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET': handleGet($db, $action); break;
        case 'POST': handlePost($db, $action); break;
        case 'PUT': handlePut($db, $action); break;
        case 'DELETE': handleDelete($db, $action); break;
        default: throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// GET handlers
function handleGet($db, $action) {
    switch ($action) {
        case 'categories': getCategories($db); break;
        case 'services': getServices($db); break;
        case 'service': getService($db); break;
        case 'category': getCategory($db); break;
        case 'services_by_category': getServicesByCategory($db); break;
        default: getAllServicesWithCategories($db); break;
    }
}

// POST handler
function handlePost($db, $action) {
    // Check authentication for write operations
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    // Check if user is admin or agent
    $user = getCurrentUser();
    if (!$user || !in_array($user['role'], ['admin', 'agent'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden - Admin or Agent access required']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    switch ($action) {
        case 'category': createCategory($db, $input); break;
        case 'service': createService($db, $input); break;
        default: throw new Exception('Invalid action');
    }
}

// PUT handler
function handlePut($db, $action) {
    // Check authentication for write operations
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    // Check if user is admin or agent
    $user = getCurrentUser();
    if (!$user || !in_array($user['role'], ['admin', 'agent'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden - Admin or Agent access required']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    switch ($action) {
        case 'category': updateCategory($db, $input); break;
        case 'service': updateService($db, $input); break;
        default: throw new Exception('Invalid action');
    }
}

// DELETE handler
function handleDelete($db, $action) {
    // Check authentication for delete operations
    if (!isAuthenticated() || !isAdmin()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Admin access required']);
        return;
    }

    switch ($action) {
        case 'category': deleteCategory($db); break;
        case 'service': deleteService($db); break;
        default: throw new Exception('Invalid action');
    }
}

function getAllServicesWithCategories($db) {
    $sql = "SELECT 
                s.id, s.name, s.description, s.base_price, s.unit, s.status as service_status,
                c.id as category_id, c.name as category_name, c.description as category_description,
                c.icon as category_icon, c.status as category_status
            FROM services s
            JOIN categories c ON s.category_id = c.id
            WHERE s.status = 'active' AND c.status = 'active'
            ORDER BY c.name, s.name";

    $rows = $db->fetchAll($sql);
    $categories = [];

    foreach ($rows as $row) {
        $catId = $row['category_id'];
        if (!isset($categories[$catId])) {
            $categories[$catId] = [
                'id' => $catId,
                'name' => $row['category_name'],
                'description' => $row['category_description'],
                'icon' => $row['category_icon'],
                'status' => $row['category_status'],
                'services' => []
            ];
        }

        $categories[$catId]['services'][] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'base_price' => $row['base_price'],
            'unit' => $row['unit'],
            'status' => $row['service_status']
        ];
    }

    echo json_encode(['success' => true, 'data' => array_values($categories)]);
}

function getCategories($db) {
    $rows = $db->fetchAll("SELECT * FROM categories ORDER BY name");
    echo json_encode(['success' => true, 'data' => $rows]);
}

function getServices($db) {
    $categoryId = $_GET['category_id'] ?? null;
    $sql = "SELECT s.*, c.name as category_name 
            FROM services s 
            JOIN categories c ON s.category_id = c.id";

    if ($categoryId) {
        $sql .= " WHERE s.category_id = ?";
        $rows = $db->fetchAll($sql, [$categoryId]);
    } else {
        $sql .= " ORDER BY s.name";
        $rows = $db->fetchAll($sql);
    }

    echo json_encode(['success' => true, 'data' => $rows]);
}

function getService($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) throw new Exception('Service ID required');

    $sql = "SELECT s.*, c.name as category_name 
            FROM services s 
            JOIN categories c ON s.category_id = c.id 
            WHERE s.id = ?";

    $row = $db->fetch($sql, [$id]);
    if ($row) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Service not found']);
    }
}

function getCategory($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) throw new Exception('Category ID required');

    $row = $db->fetch("SELECT * FROM categories WHERE id = ?", [$id]);
    if ($row) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Category not found']);
    }
}

function getServicesByCategory($db) {
    $categoryId = $_GET['category_id'] ?? null;
    if (!$categoryId) throw new Exception('Category ID required');

    $sql = "SELECT * FROM services WHERE category_id = ? AND status = 'active' ORDER BY name";
    $rows = $db->fetchAll($sql, [$categoryId]);
    echo json_encode(['success' => true, 'data' => $rows]);
}

function createCategory($db, $input) {
    if (empty($input['name'])) throw new Exception("Field 'name' is required");

    $data = [
        'name' => $input['name'],
        'description' => $input['description'] ?? '',
        'icon' => $input['icon'] ?? '',
        'status' => $input['status'] ?? 'active'
    ];

    $id = $db->insert('categories', $data);
    echo json_encode(['success' => true, 'message' => 'Category created successfully', 'id' => $id]);
}

function updateCategory($db, $input) {
    if (empty($input['id'])) throw new Exception('Category ID is required');

    $data = [
        'name' => $input['name'],
        'description' => $input['description'],
        'icon' => $input['icon'],
        'status' => $input['status']
    ];
    $db->update('categories', $data, ['id' => $input['id']]);
    echo json_encode(['success' => true, 'message' => 'Category updated successfully']);
}

function deleteCategory($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) throw new Exception('Category ID required');

    $count = $db->fetch("SELECT COUNT(*) as total FROM services WHERE category_id = ?", [$id]);
    if ($count['total'] > 0) {
        throw new Exception('Cannot delete category with existing services');
    }

    $db->delete('categories', ['id' => $id]);
    echo json_encode(['success' => true, 'message' => 'Category deleted successfully']);
}

//Create Service
function createService($db, $input) {
    $required = ['category_id', 'name', 'base_price'];
    foreach ($required as $field) {
        if (empty($input[$field])) throw new Exception("Field '$field' is required");
    }

    $data = [
        'category_id' => $input['category_id'],
        'name' => $input['name'],
        'description' => $input['description'] ?? '',
        'base_price' => $input['base_price'],
        'unit' => $input['unit'] ?? 'hour',
        'status' => $input['status'] ?? 'active'
    ];

    // Handle image upload if present
    if (!empty($_FILES['image'])) {
        $uploadDir = '../assets/uploads/services/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileExt = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = 'service_' . uniqid() . '.' . $fileExt;
        $filePath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
            $data['image'] = 'assets/uploads/services/' . $fileName;
        } else {
            throw new Exception('Failed to upload image');
        }
    }

    $id = $db->insert('services', $data);
    echo json_encode(['success' => true, 'message' => 'Service created successfully', 'id' => $id]);
}

//updateService function
function updateService($db, $input) {
    if (empty($input['id'])) throw new Exception('Service ID is required');

    $data = [
        'category_id' => $input['category_id'],
        'name' => $input['name'],
        'description' => $input['description'],
        'base_price' => $input['base_price'],
        'unit' => $input['unit'],
        'status' => $input['status']
    ];

    // Handle image upload if present
    if (!empty($_FILES['image'])) {
        $uploadDir = '../assets/uploads/services/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileExt = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = 'service_' . uniqid() . '.' . $fileExt;
        $filePath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
            // Delete old image if exists
            $oldImage = $db->fetch("SELECT image FROM services WHERE id = ?", [$input['id']]);
            if ($oldImage && $oldImage['image'] && file_exists('../' . $oldImage['image'])) {
                unlink('../' . $oldImage['image']);
            }
            
            $data['image'] = 'assets/uploads/services/' . $fileName;
        } else {
            throw new Exception('Failed to upload image');
        }
    }

    $db->update('services', $data, ['id' => $input['id']]);
    echo json_encode(['success' => true, 'message' => 'Service updated successfully']);
}

function deleteService($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) throw new Exception('Service ID required');

    $db->delete('services', ['id' => $id]);
    echo json_encode(['success' => true, 'message' => 'Service deleted successfully']);
}
?>
