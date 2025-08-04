<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../middleware/auth.php';
require_once '../../classes/location_manager.php';

// Check authentication and admin role
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit;
}

$locationManager = new LocationManager();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$type = $_GET['type'] ?? '';

try {
    switch ($method) {
        case 'GET':
            handleGetRequest($locationManager, $action, $type);
            break;
        case 'POST':
            handlePostRequest($locationManager, $action, $type);
            break;
        case 'PUT':
            handlePutRequest($locationManager, $action, $type);
            break;
        case 'DELETE':
            handleDeleteRequest($locationManager, $action, $type);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log('Location API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}

function handleGetRequest($locationManager, $action, $type) {
    error_log("Location API GET request - Type: $type, Action: $action");
    
    switch ($type) {
        case 'divisions':
            error_log("Getting all divisions");
            $result = $locationManager->getAllDivisions();
            error_log("Divisions result: " . json_encode($result));
            break;
        case 'districts':
            $divisionId = $_GET['division_id'] ?? null;
            error_log("Getting districts with division_id: $divisionId");
            $result = $locationManager->getAllDistricts($divisionId);
            error_log("Districts result: " . json_encode($result));
            break;
        case 'upazilas':
            $districtId = $_GET['district_id'] ?? null;
            error_log("Getting upazilas with district_id: $districtId");
            $result = $locationManager->getAllUpazilas($districtId);
            error_log("Upazilas result: " . json_encode($result));
            break;
        case 'zones':
            $upazilaId = $_GET['upazila_id'] ?? null;
            error_log("Getting zones with upazila_id: $upazilaId");
            $result = $locationManager->getAllZones($upazilaId);
            error_log("Zones result: " . json_encode($result));
            break;
        case 'areas':
            $zoneId = $_GET['zone_id'] ?? null;
            error_log("Getting areas with zone_id: $zoneId");
            $result = $locationManager->getAllAreas($zoneId);
            error_log("Areas result: " . json_encode($result));
            break;
        case 'hierarchy':
            $areaId = $_GET['area_id'] ?? null;
            if (!$areaId) {
                echo json_encode(['success' => false, 'message' => 'Area ID is required']);
                return;
            }
            $result = $locationManager->getLocationHierarchy($areaId);
            break;
        case 'search':
            $searchTerm = $_GET['q'] ?? '';
            $searchType = $_GET['search_type'] ?? 'all';
            if (!$searchTerm) {
                echo json_encode(['success' => false, 'message' => 'Search term is required']);
                return;
            }
            $result = $locationManager->searchLocations($searchTerm, $searchType);
            break;
        default:
            // Return all location types with counts
            $divisions = $locationManager->getAllDivisions();
            $districts = $locationManager->getAllDistricts();
            $upazilas = $locationManager->getAllUpazilas();
            $zones = $locationManager->getAllZones();
            $areas = $locationManager->getAllAreas();
            
            $result = [
                'success' => true,
                'data' => [
                    'divisions' => $divisions['data'] ?? [],
                    'districts' => $districts['data'] ?? [],
                    'upazilas' => $upazilas['data'] ?? [],
                    'zones' => $zones['data'] ?? [],
                    'areas' => $areas['data'] ?? [],
                    'counts' => [
                        'divisions' => count($divisions['data'] ?? []),
                        'districts' => count($districts['data'] ?? []),
                        'upazilas' => count($upazilas['data'] ?? []),
                        'zones' => count($zones['data'] ?? []),
                        'areas' => count($areas['data'] ?? [])
                    ]
                ]
            ];
    }
    
    echo json_encode($result);
}

function handlePostRequest($locationManager, $action, $type) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($type) {
        case 'divisions':
            $name = $input['name'] ?? '';
            $result = $locationManager->createDivision($name);
            break;
        case 'districts':
            $divisionId = $input['division_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->createDistrict($divisionId, $name);
            break;
        case 'upazilas':
            $districtId = $input['district_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->createUpazila($districtId, $name);
            break;
        case 'zones':
            $upazilaId = $input['upazila_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->createZone($upazilaId, $name);
            break;
        case 'areas':
            $zoneId = $input['zone_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->createArea($zoneId, $name);
            break;
        default:
            $result = ['success' => false, 'message' => 'Invalid location type'];
    }
    
    echo json_encode($result);
}

function handlePutRequest($locationManager, $action, $type) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID is required']);
        return;
    }
    
    switch ($type) {
        case 'divisions':
            $name = $input['name'] ?? '';
            $result = $locationManager->updateDivision($id, $name);
            break;
        case 'districts':
            $divisionId = $input['division_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->updateDistrict($id, $divisionId, $name);
            break;
        case 'upazilas':
            $districtId = $input['district_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->updateUpazila($id, $districtId, $name);
            break;
        case 'zones':
            $upazilaId = $input['upazila_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->updateZone($id, $upazilaId, $name);
            break;
        case 'areas':
            $zoneId = $input['zone_id'] ?? '';
            $name = $input['name'] ?? '';
            $result = $locationManager->updateArea($id, $zoneId, $name);
            break;
        default:
            $result = ['success' => false, 'message' => 'Invalid location type'];
    }
    
    echo json_encode($result);
}

function handleDeleteRequest($locationManager, $action, $type) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? '';
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID is required']);
        return;
    }
    
    switch ($type) {
        case 'divisions':
            $result = $locationManager->deleteDivision($id);
            break;
        case 'districts':
            $result = $locationManager->deleteDistrict($id);
            break;
        case 'upazilas':
            $result = $locationManager->deleteUpazila($id);
            break;
        case 'zones':
            $result = $locationManager->deleteZone($id);
            break;
        case 'areas':
            $result = $locationManager->deleteArea($id);
            break;
        default:
            $result = ['success' => false, 'message' => 'Invalid location type'];
    }
    
    echo json_encode($result);
}
?>
