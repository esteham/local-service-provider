<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../classes/DB.php';
require_once '../classes/Auth.php';

// Check authentication for admin operations
$auth = new Auth();
if (!$auth->isLoggedIn() || !$auth->hasAnyRole(['admin'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

try {
    $db = DB::getInstance();
    $action = $_GET['action'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($action) {
        case 'services':
            handleServicesRequest($db, $method);
            break;
        case 'service':
            handleServiceRequest($db, $method);
            break;
        case 'categories':
            handleCategoriesRequest($db, $method);
            break;
        case 'category':
            handleCategoryRequest($db, $method);
            break;
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

function handleServicesRequest($db, $method) {
    if ($method === 'GET') {
        // Get all services with category names
        $query = "
            SELECT s.*, c.name as category_name 
            FROM services s 
            LEFT JOIN categories c ON s.category_id = c.id 
            ORDER BY s.created_at DESC
        ";
        $services = $db->fetchAll($query);
        
        echo json_encode([
            'success' => true,
            'data' => $services
        ]);
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
    }
}

function handleServiceRequest($db, $method) {
    switch ($method) {
        case 'POST':
            // Check if this is an update (has ID) or create (no ID)
            $serviceId = $_GET['id'] ?? $_POST['id'] ?? null;
            if ($serviceId) {
                updateService($db);
            } else {
                createService($db);
            }
            break;
        case 'PUT':
            updateService($db);
            break;
        case 'DELETE':
            deleteService($db);
            break;
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
    }
}

function handleCategoriesRequest($db, $method) {
    if ($method === 'GET') {
        // Get all categories with service count
        $query = "
            SELECT c.*, 
                   COUNT(s.id) as service_count
            FROM categories c 
            LEFT JOIN services s ON c.id = s.category_id 
            GROUP BY c.id 
            ORDER BY c.created_at DESC
        ";
        $categories = $db->fetchAll($query);
        
        echo json_encode([
            'success' => true,
            'data' => $categories
        ]);
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
    }
}

function handleCategoryRequest($db, $method) {
    switch ($method) {
        case 'POST':
            createCategory($db);
            break;
        case 'PUT':
            updateCategory($db);
            break;
        case 'DELETE':
            deleteCategory($db);
            break;
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
    }
}

function createService($db) {
    // Validate required fields
    if (empty($_POST['name']) || empty($_POST['category_id']) || empty($_POST['base_price'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Name, category, and base price are required'
        ]);
        return;
    }
    
    // Handle image upload
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imagePath = handleImageUpload($_FILES['image']);
        if (!$imagePath) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to upload image'
            ]);
            return;
        }
    }
    
    try {
        $query = "
            INSERT INTO services (category_id, name, description, image, base_price, unit, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ";
        
        $params = [
            $_POST['category_id'],
            $_POST['name'],
            $_POST['description'] ?? '',
            $imagePath,
            $_POST['base_price'],
            $_POST['unit'] ?? 'hour',
            $_POST['status'] ?? 'active'
        ];
        
        $stmt = $db->query($query, $params);
        $result = $stmt->rowCount() > 0;
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Service created successfully'
            ]);
        } else {
            throw new Exception('Failed to create service');
        }
    } catch (Exception $e) {
        // Clean up uploaded image if database insert fails
        if ($imagePath && file_exists("../$imagePath")) {
            unlink("../$imagePath");
        }
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create service: ' . $e->getMessage()
        ]);
    }
}

function updateService($db) {
    $serviceId = $_GET['id'] ?? null;
    
    // Use POST data directly since we're using POST for updates now
    $inputData = $_POST;
    
    // Debug logging
    error_log('=== UPDATE SERVICE DEBUG ===');
    error_log('Service ID: ' . $serviceId);
    error_log('Method: ' . $_SERVER['REQUEST_METHOD']);
    error_log('POST data: ' . print_r($_POST, true));
    error_log('Input data: ' . print_r($inputData, true));
    error_log('FILES data: ' . print_r($_FILES, true));
    
    if (!$serviceId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Service ID is required'
        ]);
        return;
    }
    
    // Get current service data
    $currentService = $db->fetch("SELECT * FROM services WHERE id = ?", [$serviceId]);
    if (!$currentService) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Service not found'
        ]);
        return;
    }
    
    error_log('Current service data: ' . print_r($currentService, true));
    
    // Handle image upload
    $imagePath = $currentService['image'];
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $newImagePath = handleImageUpload($_FILES['image']);
        if ($newImagePath) {
            // Delete old image
            if ($imagePath && file_exists("../$imagePath")) {
                unlink("../$imagePath");
            }
            $imagePath = $newImagePath;
        }
    }
    
    try {
        // Build dynamic update query only for changed fields
        $updateFields = [];
        $params = [];
        
        // Check each field for changes
        if (isset($inputData['category_id']) && $inputData['category_id'] != $currentService['category_id']) {
            $updateFields[] = 'category_id = ?';
            $params[] = $inputData['category_id'];
        }
        
        if (isset($inputData['name']) && $inputData['name'] != $currentService['name']) {
            $updateFields[] = 'name = ?';
            $params[] = $inputData['name'];
        }
        
        if (isset($inputData['description']) && $inputData['description'] != $currentService['description']) {
            $updateFields[] = 'description = ?';
            $params[] = $inputData['description'];
        }
        
        // Always update image if a new one was uploaded
        if ($imagePath != $currentService['image']) {
            $updateFields[] = 'image = ?';
            $params[] = $imagePath;
        }
        
        if (isset($inputData['base_price']) && $inputData['base_price'] != $currentService['base_price']) {
            $updateFields[] = 'base_price = ?';
            $params[] = $inputData['base_price'];
        }
        
        if (isset($inputData['unit']) && $inputData['unit'] != $currentService['unit']) {
            $updateFields[] = 'unit = ?';
            $params[] = $inputData['unit'];
        }
        
        if (isset($inputData['status']) && $inputData['status'] != $currentService['status']) {
            $updateFields[] = 'status = ?';
            $params[] = $inputData['status'];
        }
        
        // If no fields changed, return success anyway
        if (empty($updateFields)) {
            echo json_encode([
                'success' => true,
                'message' => 'No changes detected - service is already up to date'
            ]);
            return;
        }
        
        // Build and execute query
        $query = "UPDATE services SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $params[] = $serviceId;
        
        error_log('Update query: ' . $query);
        error_log('Update params: ' . print_r($params, true));
        
        $stmt = $db->query($query, $params);
        
        // For UPDATE queries, we should check if the query executed successfully
        // rather than relying on rowCount() which can be 0 even for successful updates
        echo json_encode([
            'success' => true,
            'message' => 'Service updated successfully',
            'changes_made' => count($updateFields)
        ]);
    } catch (Exception $e) {
        error_log('Update service error: ' . $e->getMessage());
        error_log('Service ID: ' . $serviceId);
        error_log('Query: ' . $query);
        error_log('Params: ' . print_r($params, true));
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update service: ' . $e->getMessage()
        ]);
    }
}

function deleteService($db) {
    $serviceId = $_GET['id'] ?? null;
    
    if (!$serviceId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Service ID is required'
        ]);
        return;
    }
    
    try {
        // Get service data to delete image
        $service = $db->fetch("SELECT image FROM services WHERE id = ?", [$serviceId]);
        
        // Delete the service
        $stmt = $db->query("DELETE FROM services WHERE id = ?", [$serviceId]);
        $result = $stmt->rowCount() > 0;
        
        if ($result) {
            // Delete associated image file
            if ($service && $service['image'] && file_exists("../" . $service['image'])) {
                unlink("../" . $service['image']);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Service deleted successfully'
            ]);
        } else {
            throw new Exception('Failed to delete service');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete service: ' . $e->getMessage()
        ]);
    }
}

function createCategory($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Category name is required'
        ]);
        return;
    }
    
    try {
        $query = "INSERT INTO categories (name, description, icon, status) VALUES (?, ?, ?, ?)";
        $params = [
            $input['name'],
            $input['description'] ?? '',
            $input['icon'] ?? '',
            $input['status'] ?? 'active'
        ];
        
        $stmt = $db->query($query, $params);
        $result = $stmt->rowCount() > 0;
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Category created successfully'
            ]);
        } else {
            throw new Exception('Failed to create category');
        }
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Category name already exists'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create category: ' . $e->getMessage()
            ]);
        }
    }
}

function updateCategory($db) {
    $categoryId = $_GET['id'] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$categoryId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Category ID is required'
        ]);
        return;
    }
    
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Category name is required'
        ]);
        return;
    }
    
    try {
        $query = "UPDATE categories SET name = ?, description = ?, icon = ?, status = ? WHERE id = ?";
        $params = [
            $input['name'],
            $input['description'] ?? '',
            $input['icon'] ?? '',
            $input['status'] ?? 'active',
            $categoryId
        ];
        
        $stmt = $db->query($query, $params);
        $result = $stmt->rowCount() > 0;
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Category updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update category');
        }
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Category name already exists'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update category: ' . $e->getMessage()
            ]);
        }
    }
}

function deleteCategory($db) {
    $categoryId = $_GET['id'] ?? null;
    
    if (!$categoryId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Category ID is required'
        ]);
        return;
    }
    
    try {
        // Check if category has services
        $serviceCount = $db->fetch("SELECT COUNT(*) as count FROM services WHERE category_id = ?", [$categoryId]);
        
        if ($serviceCount['count'] > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete category with associated services. Please delete or reassign services first.'
            ]);
            return;
        }
        
        $stmt = $db->query("DELETE FROM categories WHERE id = ?", [$categoryId]);
        $result = $stmt->rowCount() > 0;
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } else {
            throw new Exception('Failed to delete category');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete category: ' . $e->getMessage()
        ]);
    }
}

function handleImageUpload($file) {
    try {
        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            error_log('Invalid file type: ' . $file['type']);
            return false;
        }
        
        // Check file size (5MB max)
        if ($file['size'] > 5 * 1024 * 1024) {
            error_log('File too large: ' . $file['size']);
            return false;
        }
        
        // Create upload directory if it doesn't exist
        $uploadDir = '../uploads/services/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                error_log('Failed to create upload directory: ' . $uploadDir);
                return false;
            }
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('service_') . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return 'uploads/services/' . $filename;
        } else {
            error_log('Failed to move uploaded file from ' . $file['tmp_name'] . ' to ' . $filepath);
            return false;
        }
    } catch (Exception $e) {
        error_log('Image upload error: ' . $e->getMessage());
        return false;
    }
}
?>
