<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../classes/DB.php';

// Live validation API for all forms
try {
    $db = DB::getInstance();
    
    $table = $_GET['table'] ?? '';
    $field = $_GET['field'] ?? '';
    $value = $_GET['value'] ?? '';
    $excludeId = $_GET['exclude_id'] ?? null; // For edit forms
    
    if (empty($table) || empty($field) || empty($value)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required parameters'
        ]);
        exit;
    }
    
    // Sanitize table and field names (whitelist approach)
    $allowedTables = [
        'users', 'divisions', 'districts', 'upazilas', 'zones', 'areas',
        'categories', 'services', 'workers', 'agents'
    ];
    
    $allowedFields = [
        'username', 'email', 'name', 'phone', 'title'
    ];
    
    if (!in_array($table, $allowedTables) || !in_array($field, $allowedFields)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid table or field'
        ]);
        exit;
    }
    
    // Build query
    $sql = "SELECT COUNT(*) as count FROM `$table` WHERE `$field` = ?";
    $params = [$value];
    
    // Exclude current record for edit forms
    if ($excludeId) {
        $sql .= " AND id != ?";
        $params[] = $excludeId;
    }
    
    $result = $db->fetch($sql, $params);
    $exists = $result['count'] > 0;
    
    echo json_encode([
        'success' => true,
        'exists' => $exists,
        'message' => $exists ? 'This data is already in use.' : 'Available.',
        'available' => !$exists
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Validation error: ' . $e->getMessage()
    ]);
}
?>
