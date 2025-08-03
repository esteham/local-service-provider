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
require_once '../../classes/ServiceRequest.php';

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$serviceRequest = new ServiceRequest();

try {
    switch ($method) {
        case 'GET':
            // Handle different GET operations
            if (isset($_GET['id'])) {
                // Get specific service request
                $result = $serviceRequest->getServiceRequestById($_GET['id']);
            } elseif (isset($_GET['stats'])) {
                // Get service request statistics
                $filters = [];
                if (isset($_GET['date_from'])) $filters['date_from'] = $_GET['date_from'];
                if (isset($_GET['date_to'])) $filters['date_to'] = $_GET['date_to'];
                if (isset($_GET['worker_id'])) $filters['worker_id'] = $_GET['worker_id'];
                if (isset($_GET['user_id'])) $filters['user_id'] = $_GET['user_id'];
                
                $result = $serviceRequest->getServiceRequestStats($filters);
            } else {
                // Get all service requests with filters
                $filters = [];
                if (isset($_GET['status'])) $filters['status'] = $_GET['status'];
                if (isset($_GET['urgency'])) $filters['urgency'] = $_GET['urgency'];
                if (isset($_GET['worker_id'])) $filters['worker_id'] = $_GET['worker_id'];
                if (isset($_GET['user_id'])) $filters['user_id'] = $_GET['user_id'];
                if (isset($_GET['service_id'])) $filters['service_id'] = $_GET['service_id'];
                if (isset($_GET['area_id'])) $filters['area_id'] = $_GET['area_id'];
                if (isset($_GET['date_from'])) $filters['date_from'] = $_GET['date_from'];
                if (isset($_GET['date_to'])) $filters['date_to'] = $_GET['date_to'];
                if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
                if (isset($_GET['limit'])) $filters['limit'] = $_GET['limit'];
                
                $result = $serviceRequest->getAllServiceRequests($filters);
            }
            break;
            
        case 'POST':
            // Create new service request
            $data = json_decode(file_get_contents('php://input'), true);
            $result = $serviceRequest->createServiceRequest($data);
            break;
            
        case 'PUT':
            // Update service request
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['id'])) {
                if (isset($data['action'])) {
                    switch ($data['action']) {
                        case 'assign_worker':
                            $result = $serviceRequest->assignWorker($_GET['id'], $data['worker_id']);
                            break;
                        case 'update_status':
                            $additionalData = isset($data['additional_data']) ? $data['additional_data'] : [];
                            $result = $serviceRequest->updateStatus($_GET['id'], $data['status'], $additionalData);
                            break;
                        default:
                            $result = $serviceRequest->updateServiceRequest($_GET['id'], $data);
                    }
                } else {
                    $result = $serviceRequest->updateServiceRequest($_GET['id'], $data);
                }
            } else {
                $result = ['success' => false, 'message' => 'Service request ID is required'];
            }
            break;
            
        case 'DELETE':
            // Delete service request
            if (isset($_GET['id'])) {
                $result = $serviceRequest->deleteServiceRequest($_GET['id']);
            } else {
                $result = ['success' => false, 'message' => 'Service request ID is required'];
            }
            break;
            
        default:
            $result = ['success' => false, 'message' => 'Method not allowed'];
            break;
    }
    
    if ($result['success']) {
        echo json_encode($result);
    } else {
        http_response_code(400);
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    error_log("Service Requests API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to process service request operation'
    ]);
}
?>
