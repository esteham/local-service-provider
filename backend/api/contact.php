<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    // Create database if it doesn't exist
    DatabaseConfig::createDatabase();
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }
    
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }
    
    // Validate required fields
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $message = trim($data['message'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $service = trim($data['service'] ?? '');
    
    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Name, email, and message are required fields'
        ]);
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid email format'
        ]);
        exit;
    }
    
    // Create contact_messages table if it doesn't exist
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            phone VARCHAR(20),
            service VARCHAR(100),
            message TEXT NOT NULL,
            status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_created_at (created_at),
            INDEX idx_email (email)
        )
    ";
    
    $pdo->exec($createTableSQL);
    
    // Insert the contact message
    $sql = "INSERT INTO contact_messages (name, email, phone, service, message, status, created_at) 
            VALUES (?, ?, ?, ?, ?, 'new', NOW())";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$name, $email, $phone, $service, $message]);
    
    if ($result) {
        $messageId = $pdo->lastInsertId();
        
        // Optionally create a notification for admins
        try {
            $notificationSQL = "INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
                               VALUES (1, 'New Contact Message', ?, 'contact', 0, NOW())";
            $notificationStmt = $pdo->prepare($notificationSQL);
            $notificationMessage = "New contact message from {$name} ({$email}): " . substr($message, 0, 100) . "...";
            $notificationStmt->execute([$notificationMessage]);
        } catch (Exception $e) {
            // Notification creation failed, but contact message was saved
            error_log("Failed to create notification: " . $e->getMessage());
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message! We will get back to you soon.',
            'data' => [
                'id' => $messageId,
                'name' => $name,
                'email' => $email
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save your message. Please try again.'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in contact.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("General error in contact.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ]);
}
?>
