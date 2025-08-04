<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../classes/location_manager.php';

// PUBLIC API - No authentication required for registration forms
$locationManager = new LocationManager();
$type = $_GET['type'] ?? '';

try {
    switch ($type) {
        case 'divisions':
            $result = $locationManager->getAllDivisions();
            break;
        case 'districts':
            $divisionId = $_GET['division_id'] ?? null;
            $result = $locationManager->getAllDistricts($divisionId);
            break;
        case 'upazilas':
            $districtId = $_GET['district_id'] ?? null;
            $result = $locationManager->getAllUpazilas($districtId);
            break;
        case 'zones':
            $upazilaId = $_GET['upazila_id'] ?? null;
            $result = $locationManager->getAllZones($upazilaId);
            break;
        case 'areas':
            $zoneId = $_GET['zone_id'] ?? null;
            $result = $locationManager->getAllAreas($zoneId);
            break;
        default:
            $result = [
                'success' => false,
                'message' => 'Invalid location type. Use: divisions, districts, upazilas, zones, or areas'
            ];
            break;
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'API Error: ' . $e->getMessage()
    ]);
}
?>
