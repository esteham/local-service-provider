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

    // Optional image upload
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../uploads/users/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $imagePath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
            $imagePath = 'uploads/users/' . $fileName;
        }
    }

    $userData = [
        'username' => $input['username'] ?? '',
        'email' => $input['email'] ?? '',
        'password' => $input['password'] ?? '',
        'role' => 'user',
        'image' => $imagePath,
        'first_name' => $input['first_name'] ?? '',
        'last_name' => $input['last_name'] ?? '',
        'phone' => $input['phone'] ?? ''
    ];

    $auth = new Auth();
    $result = $auth->register($userData);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
