<?php
// CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Check if user is agent
$currentUser = getCurrentUser();
if (!$currentUser || $currentUser['role'] !== 'agent') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Access denied. Agent role required.']);
    exit;
}

$db = DatabaseConfig::getConnection();

// Get agent ID from session
$user_id = $_SESSION['user']['id'];
$agent_query = "SELECT id FROM agents WHERE user_id = ?";
$agent_stmt = $db->prepare($agent_query);
$agent_stmt->execute([$user_id]);
$agent = $agent_stmt->fetch(PDO::FETCH_ASSOC);

if (!$agent) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Agent not found']);
    exit;
}

$agentId = $agent['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get agent settings
        $agentQuery = "SELECT a.*, u.username, u.email, u.first_name, u.last_name, u.phone,
                              z.name as zone_name, ar.name as area_name
                       FROM agents a
                       LEFT JOIN users u ON a.user_id = u.id
                       LEFT JOIN zones z ON a.zone_id = z.id
                       LEFT JOIN areas ar ON a.area_id = ar.id
                       WHERE a.user_id = ?";
        
        $agentStmt = $db->prepare($agentQuery);
        $agentStmt->execute([$user_id]);
        $agentData = $agentStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$agentData) {
            echo json_encode([
                'success' => true,
                'data' => []
            ]);
            exit;
        }
        
        $settings = [
            'id' => $agentData['id'],
            'user_id' => $agentData['user_id'],
            'username' => $agentData['username'],
            'email' => $agentData['email'],
            'first_name' => $agentData['first_name'],
            'last_name' => $agentData['last_name'],
            'phone' => $agentData['phone'],
            'address' => $agentData['address'],
            'zone_name' => $agentData['zone_name'],
            'area_name' => $agentData['area_name'],
            'status' => $agentData['status'],
            'join_date' => $agentData['join_date'],
            'created_at' => $agentData['created_at'],
            'updated_at' => $agentData['updated_at']
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $settings
        ]);
        
    } catch (Exception $e) {
        error_log("Agent settings error: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Failed to load settings'
        ]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        // Update agent settings
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
            exit;
        }
        
        // Update user information
        if (isset($data['first_name']) || isset($data['last_name']) || isset($data['phone'])) {
            $userUpdateQuery = "UPDATE users SET ";
            $userUpdateParams = [];
            $userUpdateFields = [];
            
            if (isset($data['first_name'])) {
                $userUpdateFields[] = "first_name = ?";
                $userUpdateParams[] = $data['first_name'];
            }
            
            if (isset($data['last_name'])) {
                $userUpdateFields[] = "last_name = ?";
                $userUpdateParams[] = $data['last_name'];
            }
            
            if (isset($data['phone'])) {
                $userUpdateFields[] = "phone = ?";
                $userUpdateParams[] = $data['phone'];
            }
            
            if (!empty($userUpdateFields)) {
                $userUpdateQuery .= implode(', ', $userUpdateFields);
                $userUpdateQuery .= " WHERE id = ?";
                $userUpdateParams[] = $user_id;
                
                $userUpdateStmt = $db->prepare($userUpdateQuery);
                $userUpdateStmt->execute($userUpdateParams);
            }
        }
        
        // Update agent information
        if (isset($data['address'])) {
            $agentUpdateQuery = "UPDATE agents SET address = ? WHERE user_id = ?";
            $agentUpdateStmt = $db->prepare($agentUpdateQuery);
            $agentUpdateStmt->execute([$data['address'], $user_id]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("Agent settings update error: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update settings'
        ]);
    }
}
?>