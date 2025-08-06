<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../classes/Auth.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Handle both JSON and form data
    $input = [];
    
    // Check if it's multipart form data (file upload)
    if (isset($_POST) && !empty($_POST)) {
        $input = $_POST;
    } else {
        // Try to get JSON input
        $jsonInput = json_decode(file_get_contents('php://input'), true);
        if ($jsonInput) {
            $input = $jsonInput;
        }
    }
    
    if (empty($input)) {
        echo json_encode(['success' => false, 'message' => 'No input data received']);
        exit;
    }

    $auth = new Auth();
    
    // Handle file upload if present
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../assets/uploads/users/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $imagePath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
            $imagePath = '/assets/uploads/users/' . $fileName; // Store relative path
        } else {
            $imagePath = null;
        }
    }
    
    // Prepare user data
    $userData = [
        'username' => $input['username'] ?? '',
        'email' => $input['email'] ?? '',
        'password' => $input['password'] ?? '',
        'role' => $input['role'] ?? 'user',
        'image' => $imagePath,
        'first_name' => $input['first_name'] ?? '',
        'last_name' => $input['last_name'] ?? '',
        'phone' => $input['phone'] ?? ''
    ];

    // Register the user
    $result = $auth->register($userData);
    
    if ($result['success']) {
        // If user is a worker or agent, create additional profile
        if (in_array($input['role'], ['worker', 'agent'])) {
            $userId = $result['user_id'];
            $conn = DatabaseConfig::getConnection();
            
            if ($input['role'] === 'worker') {
                // Create worker profile
                $stmt = $conn->prepare("
                    INSERT INTO workers (
                        user_id, phone, first_name, last_name, address, skills, 
                        experience, hourly_rate, join_date, emergency_name, 
                        emergency_phone, emergency_relation, zone_id, area_id, category_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $userId,
                    $input['phone'] ?? '',
                    $input['first_name'] ?? '',
                    $input['last_name'] ?? '',
                    $input['address'] ?? '',
                    $input['skills'] ?? '',
                    $input['experience'] ?? 0,
                    $input['hourly_rate'] ?? 0.00,
                    $input['emergency_name'] ?? '',
                    $input['emergency_phone'] ?? '',
                    $input['emergency_relation'] ?? '',
                    $input['zone_id'] ?? null,
                    $input['area_id'] ?? null,
                    $input['category_id'] ?? null
                ]);
                
                // Add worker services if provided
                if (!empty($input['service_ids']) && is_array($input['service_ids'])) {
                    $workerStmt = $conn->prepare("SELECT id FROM workers WHERE user_id = ?");
                    $workerStmt->execute([$userId]);
                    $worker = $workerStmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($worker) {
                        $serviceStmt = $conn->prepare("INSERT INTO worker_services (worker_id, service_id) VALUES (?, ?)");
                        foreach ($input['service_ids'] as $serviceId) {
                            $serviceStmt->execute([$worker['id'], $serviceId]);
                        }
                    }
                }
                
            } elseif ($input['role'] === 'agent') {
                // Create agent profile
                $stmt = $conn->prepare("
                    INSERT INTO agents (
                        user_id, phone, first_name, last_name, address, 
                        join_date, zone_id, area_id
                    ) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)
                ");
                
                $stmt->execute([
                    $userId,
                    $input['phone'] ?? '',
                    $input['first_name'] ?? '',
                    $input['last_name'] ?? '',
                    $input['address'] ?? '',
                    $input['zone_id'] ?? null,
                    $input['area_id'] ?? null
                ]);
            }
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Registration successful',
            'user_id' => $result['user_id']
        ]);
    } else {
        echo json_encode($result);
    }

} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Registration failed: ' . $e->getMessage()
    ]);
}
?>
