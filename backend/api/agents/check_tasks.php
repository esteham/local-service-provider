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

// Check if we can connect to the database
try {
    // Get all tasks
    $tasksQuery = "SELECT * FROM tasks LIMIT 10";
    $tasksStmt = $db->prepare($tasksQuery);
    $tasksStmt->execute();
    
    $tasks = [];
    while ($task = $tasksStmt->fetch(PDO::FETCH_ASSOC)) {
        $tasks[] = $task;
    }
    
    // Get agent ID from session
    $user_id = $_SESSION['user']['id'];
    
    // Get agent record
    $agentQuery = "SELECT * FROM agents WHERE user_id = ?";
    $agentStmt = $db->prepare($agentQuery);
    $agentStmt->execute([$user_id]);
    $agent = $agentStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'tasks' => $tasks,
        'agent' => $agent,
        'user_id' => $user_id,
        'session' => $_SESSION
    ]);
    
} catch (Exception $e) {
    error_log("Check tasks error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>