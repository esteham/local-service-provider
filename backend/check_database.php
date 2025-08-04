<?php
require_once 'classes/DB.php';

echo "Checking database contents...\n\n";

try {
    $db = DB::getInstance();
    
    // Check divisions
    echo "=== DIVISIONS ===\n";
    $divisions = $db->fetchAll("SELECT * FROM divisions ORDER BY name");
    echo "Count: " . count($divisions) . "\n";
    foreach ($divisions as $div) {
        echo "ID: {$div['id']}, Name: {$div['name']}\n";
    }
    echo "\n";
    
    // Check districts
    echo "=== DISTRICTS ===\n";
    $districts = $db->fetchAll("SELECT d.*, div.name as division_name FROM districts d LEFT JOIN divisions div ON d.division_id = div.id ORDER BY d.name");
    echo "Count: " . count($districts) . "\n";
    foreach ($districts as $dist) {
        echo "ID: {$dist['id']}, Name: {$dist['name']}, Division: {$dist['division_name']} (ID: {$dist['division_id']})\n";
    }
    echo "\n";
    
    // Check upazilas
    echo "=== UPAZILAS ===\n";
    $upazilas = $db->fetchAll("SELECT u.*, d.name as district_name FROM upazilas u LEFT JOIN districts d ON u.district_id = d.id ORDER BY u.name");
    echo "Count: " . count($upazilas) . "\n";
    foreach ($upazilas as $upazila) {
        echo "ID: {$upazila['id']}, Name: {$upazila['name']}, District: {$upazila['district_name']} (ID: {$upazila['district_id']})\n";
    }
    echo "\n";
    
    // Check zones
    echo "=== ZONES ===\n";
    $zones = $db->fetchAll("SELECT z.*, u.name as upazila_name FROM zones z LEFT JOIN upazilas u ON z.upazila_id = u.id ORDER BY z.name");
    echo "Count: " . count($zones) . "\n";
    foreach ($zones as $zone) {
        echo "ID: {$zone['id']}, Name: {$zone['name']}, Upazila: {$zone['upazila_name']} (ID: {$zone['upazila_id']})\n";
    }
    echo "\n";
    
    // Check areas
    echo "=== AREAS ===\n";
    $areas = $db->fetchAll("SELECT a.*, z.name as zone_name FROM areas a LEFT JOIN zones z ON a.zone_id = z.id ORDER BY a.name");
    echo "Count: " . count($areas) . "\n";
    foreach ($areas as $area) {
        echo "ID: {$area['id']}, Name: {$area['name']}, Zone: {$area['zone_name']} (ID: {$area['zone_id']})\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "Database check completed.\n";
?>
