<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../classes/DB.php';

// PUBLIC API - No authentication required for public display
try {
    $db = DB::getInstance();
    $action = $_GET['action'] ?? 'services';
    
    switch ($action) {
        case 'services':
            // Get all active services with category names for public display
            $query = "
                SELECT s.id, s.name, s.description, s.image, s.base_price, s.unit, 
                       c.name as category_name, c.icon as category_icon
                FROM services s 
                LEFT JOIN categories c ON s.category_id = c.id 
                WHERE s.status = 'active' AND c.status = 'active'
                ORDER BY c.name, s.name
            ";
            $services = $db->fetchAll($query);
            
            echo json_encode([
                'success' => true,
                'data' => $services
            ]);
            break;
            
        case 'categories':
            // Get all active categories for public display
            $query = "
                SELECT c.id, c.name, c.description, c.icon,
                       COUNT(s.id) as service_count
                FROM categories c 
                LEFT JOIN services s ON c.id = s.category_id AND s.status = 'active'
                WHERE c.status = 'active'
                GROUP BY c.id 
                ORDER BY c.name
            ";
            $categories = $db->fetchAll($query);
            
            echo json_encode([
                'success' => true,
                'data' => $categories
            ]);
            break;
            
        case 'service':
            // Get single service details for public display
            $serviceId = $_GET['id'] ?? null;
            if (!$serviceId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Service ID is required'
                ]);
                break;
            }
            
            $query = "
                SELECT s.*, c.name as category_name, c.icon as category_icon
                FROM services s 
                LEFT JOIN categories c ON s.category_id = c.id 
                WHERE s.id = ? AND s.status = 'active' AND c.status = 'active'
            ";
            $service = $db->fetch($query, [$serviceId]);
            
            if ($service) {
                echo json_encode([
                    'success' => true,
                    'data' => $service
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Service not found or inactive'
                ]);
            }
            break;
            
        case 'category':
            // Get single category with its services for public display
            $categoryId = $_GET['id'] ?? null;
            if (!$categoryId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Category ID is required'
                ]);
                break;
            }
            
            // Get category info
            $category = $db->fetch(
                "SELECT * FROM categories WHERE id = ? AND status = 'active'", 
                [$categoryId]
            );
            
            if (!$category) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Category not found or inactive'
                ]);
                break;
            }
            
            // Get category services
            $services = $db->fetchAll(
                "SELECT * FROM services WHERE category_id = ? AND status = 'active' ORDER BY name", 
                [$categoryId]
            );
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'category' => $category,
                    'services' => $services
                ]
            ]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action. Use: services, categories, service, or category'
            ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching data: ' . $e->getMessage()
    ]);
}
?>
