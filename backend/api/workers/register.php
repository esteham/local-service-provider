<?php
require_once '../config/init.php';

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'agent'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized Access'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Request'
    ]);
    exit;
}

require_once '../../classes/class_functions.php';
$admin = new Admin();
$pdo = $admin->getPDO();

try 
{
    $first_name         = $_POST['first_name'] ?? '';
    $last_name          = $_POST['last_name'] ?? '';
    $email              = $_POST['email'] ?? '';
    $phone              = $_POST['phone'] ?? '';
    $username           = $_POST['username'] ?? '';
    $category_id        = $_POST['category_id'] ?? '';
    $skill              = $_POST['skills'] ?? null;
    $zone_id            = $_POST['zone_id'] ?? null;
    $area_id            = $_POST['area_id'] ?? null;
    $address            = $_POST['address'] ?? null;
    $emergency_name     = $_POST['emergency_name'] ?? null;
    $emergency_phone    = $_POST['emergency_phone'] ?? null;
    $emergency_relation = $_POST['emergency_relation'] ?? null;

    if (
        trim($first_name) === '' || 
        trim($last_name) === '' || 
        trim($email) === '' || 
        trim($phone) === '' || 
        trim($username) === '' || 
        !is_numeric($category_id)
    ) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        exit;
    }

    $pdo->beginTransaction();

// Step 1: Insert into users first
$rawPassword = bin2hex(random_bytes(4)); 
$hashPassword = password_hash($rawPassword, PASSWORD_DEFAULT);

$userInsert = $pdo->prepare("INSERT INTO users (username, email, password, role, status)
                             VALUES (?, ?, ?, 'worker', 'active')");
$userInsert->execute([$username, $email, $hashPassword]);
$userId = $pdo->lastInsertId(); // we need this for worker.user_id

// Step 2: Insert into workers table using the userId
$stmt = $pdo->prepare("INSERT INTO 
    workers (user_id, first_name, last_name, phone, category_id, zone_id, area_id, address, skills, emergency_name, emergency_phone, emergency_relation, join_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')");
$stmt->execute([
    $userId,
    $first_name,
    $last_name,
    $phone,
    $category_id,
    $zone_id,
    $area_id,
    $address,
    $skill,
    $emergency_name,
    $emergency_phone,
    $emergency_relation
]);

$workerID = $pdo->lastInsertId();


    // Upload Files
    $uploadDir = '../../assets/uploads/documents/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $docFiles = ['certificate', 'experience'];
    $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    foreach ($docFiles as $docType) {
        if (isset($_FILES[$docType]) && $_FILES[$docType]['error'] === 0) {
            if (in_array($_FILES[$docType]['type'], $allowedTypes)) {
                $filename = time() . '_' . basename($_FILES[$docType]['name']);
                $filepath = $uploadDir . $filename;

                move_uploaded_file($_FILES[$docType]['tmp_name'], $filepath);

                $docInsert = $pdo->prepare("INSERT INTO documents(worker_id, doc_type, file_path) VALUES (?, ?, ?)");
                $docInsert->execute([$workerID, $docType, $filename]);
            }
        }
    }

    $pdo->commit();

    // Email Send
    $subject = "Welcome to Our Team - Your Account is Ready!";
    $message = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a6fa5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 25px; background-color: #f9f9f9; border-left: 1px solid #e1e1e1; border-right: 1px solid #e1e1e1; }
            .footer { padding: 15px; text-align: center; font-size: 12px; color: #777; background-color: #f0f0f0; border-radius: 0 0 8px 8px; }
            .credentials { background-color: #fff; border: 1px solid #e1e1e1; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .highlight { font-weight: bold; color: #2c5282; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Welcome to Our Team!</h2>
        </div>
        <div class="content">
            <p>Dear <span class="highlight">'.$first_name.' '.$last_name.'</span>,</p>
            <p><strong>Skill : </strong> <span class="highlight">'.$skill.'</span>,</p>
            <p>We\'re excited to welcome you to our team! Your worker account has been successfully created.</p>
            <div class="credentials">
                <p><strong>Your login credentials:</strong></p>
                <p>Username: <span class="highlight">'.$username.'</span></p>
                <p>Temporary Password: <span class="highlight">'.$rawPassword.'</span></p>
            </div>
            <p style="color: #d33a2c; font-weight: bold;">For security reasons, please change your password immediately after logging in.</p>
            <p style="text-align: center; margin: 25px 0;">
                <a href="https://xetroot.com/" class="button">Login to Your Account</a>
            </p>
            <p>If you have any questions or need assistance, please don\'t hesitate to contact HR.</p>
            <p>Best regards,<br>The HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© '.date('Y').' [Your Company Name]. All rights reserved.</p>
        </div>
    </body>
    </html>
    ';

    $mailSend = $admin->sendMail($email, $message, $subject);

    if ($mailSend) {
        echo json_encode(['success' => true, 'message' => 'Worker registered and mail sent successfully']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Worker registered but mail not sent']);
    }

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
