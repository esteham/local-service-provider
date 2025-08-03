<?php
require_once '../config/init.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Pricing.php';
require_once '../../classes/DB.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Check authentication
$auth = new Auth();
if (!$auth->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$currentUser = $auth->getCurrentUser();
if (!$currentUser['success']) {
    echo json_encode(['success' => false, 'message' => 'Invalid user session']);
    exit;
}

$userId = $currentUser['data']['id'];

// Get and validate input data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Required fields validation
$requiredFields = ['service_id', 'zone_id', 'title', 'description', 'address', 'contact_name', 'contact_phone'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
        exit;
    }
}

// Sanitize and validate data
$serviceId = intval($data['service_id']);
$zoneId = intval($data['zone_id']);
$title = trim($data['title']);
$description = trim($data['description']);
$address = trim($data['address']);
$urgency = trim($data['urgency'] ?? 'normal');
$scheduledAt = !empty($data['scheduled_at']) ? $data['scheduled_at'] : null;
$contactName = trim($data['contact_name']);
$contactPhone = trim($data['contact_phone']);
$contactEmail = trim($data['contact_email'] ?? '');

// Validate urgency
$validUrgencies = ['normal', 'urgent', 'emergency'];
if (!in_array($urgency, $validUrgencies)) {
    echo json_encode(['success' => false, 'message' => 'Invalid urgency level']);
    exit;
}

// Validate email if provided
if (!empty($contactEmail) && !filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Validate phone number
if (!preg_match('/^[0-9+\-\s()]+$/', $contactPhone)) {
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit;
}

// Validate scheduled date if provided
if ($scheduledAt && strtotime($scheduledAt) <= time()) {
    echo json_encode(['success' => false, 'message' => 'Scheduled date must be in the future']);
    exit;
}

try {
    $db = DB::getInstance();
    $pricing = new Pricing();
    
    // Verify service exists
    $service = $db->fetch("SELECT * FROM services WHERE id = ? AND status = 'active'", [$serviceId]);
    if (!$service) {
        echo json_encode(['success' => false, 'message' => 'Service not found or inactive']);
        exit;
    }
    
    // Verify zone exists
    $zone = $db->fetch("SELECT * FROM zones WHERE id = ?", [$zoneId]);
    if (!$zone) {
        echo json_encode(['success' => false, 'message' => 'Zone not found']);
        exit;
    }
    
    // Calculate dynamic pricing
    $priceCalculation = $pricing->calculateDynamicPrice($serviceId, $zoneId, $scheduledAt, $urgency);
    
    if (!$priceCalculation['success']) {
        echo json_encode(['success' => false, 'message' => 'Failed to calculate pricing']);
        exit;
    }
    
    $basePrice = $service['base_price'];
    $finalPrice = $priceCalculation['data']['final_price'];
    $priceBreakdown = json_encode($priceCalculation['data']['breakdown']);
    
    // Begin transaction
    $db->beginTransaction();
    
    // Insert service request
    $requestData = [
        'user_id' => $userId,
        'service_id' => $serviceId,
        'zone_id' => $zoneId,
        'title' => $title,
        'description' => $description,
        'address' => $address,
        'urgency' => $urgency,
        'status' => 'pending',
        'base_price' => $basePrice,
        'final_price' => $finalPrice,
        'price_breakdown' => $priceBreakdown,
        'scheduled_at' => $scheduledAt
    ];
    
    $requestId = $db->insert('service_requests', $requestData);
    
    // Create notification for user
    $notificationData = [
        'user_id' => $userId,
        'title' => 'Service Request Submitted',
        'message' => "Your service request '{$title}' has been submitted successfully. Request ID: #{$requestId}",
        'type' => 'success'
    ];
    $db->insert('notifications', $notificationData);
    
    // Commit transaction
    $db->commit();
    
    // Return success response with request details
    $response = [
        'success' => true,
        'message' => 'Service request submitted successfully',
        'data' => [
            'request_id' => $requestId,
            'title' => $title,
            'service_name' => $service['name'],
            'zone_name' => $zone['name'],
            'urgency' => $urgency,
            'status' => 'pending',
            'base_price' => $basePrice,
            'final_price' => $finalPrice,
            'price_breakdown' => $priceCalculation['data']['breakdown'],
            'scheduled_at' => $scheduledAt,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db && $db->getConnection()->inTransaction()) {
        $db->rollback();
    }
    
    error_log('Service request creation failed: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create service request. Please try again.'
    ]);
}

?>