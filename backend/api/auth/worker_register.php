<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once '../../classes/Auth.php';
require_once '../../config/database.php';

try {
    $input = $_POST ?: json_decode(file_get_contents('php://input'), true);
    if (empty($input)) {
        echo json_encode(['success' => false, 'message' => 'No input data received']);
        exit;
    }

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../assets/uploads/users/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $imagePath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
            $imagePath = '/assets/uploads/users/' . $fileName;
        }
    }

    $userData = [
        'username' => $input['username'] ?? '',
        'email' => $input['email'] ?? '',
        'password' => $input['password'] ?? '',
        'role' => 'worker',
        'image' => $imagePath,
        'first_name' => $input['first_name'] ?? '',
        'last_name' => $input['last_name'] ?? '',
        'phone' => $input['phone'] ?? ''
    ];

    $auth = new Auth();
    $result = $auth->register($userData);

    if ($result['success']) {
        $userId = $result['user_id'];
        $conn = DatabaseConfig::getConnection();

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

        // Insert services
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
    }

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
