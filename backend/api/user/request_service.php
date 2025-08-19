<?php
require_once '../config/init.php';
require_once '../../classes/Auth.php';
require_once '../../classes/Pricing.php';
require_once '../../classes/DB.php';
require_once '../../classes/EmailService.php';

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
$requiredFields = ['service_id', 'area_id', 'title', 'description', 'address', 'contact_name', 'contact_phone'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
        exit;
    }
}

// Sanitize and validate data
$serviceId = intval($data['service_id']);
$areaId = intval($data['area_id']);
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
    $emailService = new EmailService();
    
    // Verify service exists
    $service = $db->fetch("SELECT * FROM services WHERE id = ? AND status = 'active'", [$serviceId]);
    if (!$service) {
        echo json_encode(['success' => false, 'message' => 'Service not found or inactive']);
        exit;
    }
    
    // Verify area exists and get zone information
    $area = $db->fetch("SELECT a.*, z.name as zone_name FROM areas a LEFT JOIN zones z ON a.zone_id = z.id WHERE a.id = ?", [$areaId]);
    if (!$area) {
        echo json_encode(['success' => false, 'message' => 'Area not found']);
        exit;
    }
    $zoneId = $area['zone_id'];
    
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
        'area_id' => $areaId,
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
    
    // Find and notify agents responsible for this area/zone
    $agents = $db->fetchAll(
        "SELECT a.*, u.username, u.email, u.first_name, u.last_name 
         FROM agents a 
         LEFT JOIN users u ON a.user_id = u.id 
         WHERE (a.area_id = ? OR a.zone_id = ?) 
         AND a.status = 'active' AND u.status = 'active'",
        [$areaId, $zoneId]
    );
    
    // Create notifications for all responsible agents and send emails
    foreach ($agents as $agent) {
        $agentNotificationData = [
            'user_id' => $agent['user_id'],
            'title' => 'New Service Request',
            'message' => "New {$service['name']} request in {$area['name']} area. Request ID: #{$requestId}. Urgency: {$urgency}",
            'type' => 'info'
        ];
        $db->insert('notifications', $agentNotificationData);
        
        // Send email notification to agent
        $agentName = ($agent['first_name'] && $agent['last_name']) 
            ? $agent['first_name'] . ' ' . $agent['last_name']
            : $agent['username'];
            
        $emailService->sendServiceRequestNotificationToAgent(
            $agent['email'],
            $agentName,
            [
                'request_id' => $requestId,
                'service_name' => $service['name'],
                'title' => $title,
                'contact_name' => $contactName,
                'contact_phone' => $contactPhone,
                'area_name' => $area['name'],
                'zone_name' => $area['zone_name'],
                'address' => $address,
                'urgency' => $urgency,
                'final_price' => $finalPrice,
                'description' => $description,
                'created_at' => date('Y-m-d H:i:s')
            ]
        );
    }
    
    // Send email notification to admin
    $emailService->sendServiceRequestNotificationToAdmin([
        'request_id' => $requestId,
        'service_name' => $service['name'],
        'title' => $title,
        'contact_name' => $contactName,
        'contact_phone' => $contactPhone,
        'area_name' => $area['name'],
        'zone_name' => $area['zone_name'],
        'address' => $address,
        'urgency' => $urgency,
        'final_price' => $finalPrice,
        'description' => $description,
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
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
            'area_name' => $area['name'],
            'zone_name' => $area['zone_name'],
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