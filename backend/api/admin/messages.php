<?php
require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';


try {
    DatabaseConfig::createDatabase();
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            if (isset($_GET['stats'])) {
                // Get message statistics
                getMessageStats($pdo);
            } elseif (isset($_GET['id'])) {
                // Get specific message
                getMessage($pdo, $_GET['id']);
            } else {
                // Get all messages with filters
                getMessages($pdo);
            }
            break;
            
        case 'POST':
            // Create new message or perform bulk action
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['action'])) {
                switch ($data['action']) {
                    case 'send_message':
                        sendMessage($pdo, $data);
                        break;
                    case 'broadcast_message':
                        broadcastMessage($pdo, $data);
                        break;
                    case 'bulk_mark_read':
                        bulkMarkAsRead($pdo, $data);
                        break;
                    case 'bulk_delete':
                        bulkDeleteMessages($pdo, $data);
                        break;
                    default:
                        sendMessage($pdo, $data);
                }
            } else {
                sendMessage($pdo, $data);
            }
            break;
            
        case 'PUT':
            // Update message
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['id'])) {
                if (isset($data['action'])) {
                    switch ($data['action']) {
                        case 'mark_read':
                            markAsRead($pdo, $_GET['id']);
                            break;
                        case 'mark_unread':
                            markAsUnread($pdo, $_GET['id']);
                            break;
                        default:
                            updateMessage($pdo, $_GET['id'], $data);
                    }
                } else {
                    updateMessage($pdo, $_GET['id'], $data);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Message ID is required']);
            }
            break;
            
        case 'DELETE':
            // Delete message
            if (isset($_GET['id'])) {
                deleteMessage($pdo, $_GET['id']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Message ID is required']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Messages API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to process message operation'
    ]);
}

function getMessages($pdo) {
    $limit = $_GET['limit'] ?? 50;
    $offset = $_GET['offset'] ?? 0;
    $status = $_GET['status'] ?? null;
    $type = $_GET['type'] ?? null;
    $search = $_GET['search'] ?? null;
    $userId = $_GET['user_id'] ?? null;
    
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if ($status) {
        $whereClause .= " AND m.is_read = ?";
        $params[] = $status === 'read' ? 1 : 0;
    }
    
    if ($type) {
        $whereClause .= " AND m.type = ?";
        $params[] = $type;
    }
    
    if ($search) {
        $whereClause .= " AND (m.subject LIKE ? OR m.message LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if ($userId) {
        $whereClause .= " AND (m.sender_id = ? OR m.receiver_id = ?)";
        $params[] = $userId;
        $params[] = $userId;
    }
    
    // Since we don't have a messages table in the schema, we'll simulate with service requests and notifications
    $sql = "SELECT 
                sr.id,
                CONCAT('Service Request: ', s.name) as subject,
                CONCAT('Service request from ', CONCAT(u.first_name, ' ', u.last_name)) as message,
                'service_request' as type,
                sr.user_id as sender_id,
                CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                u.email as sender_email,
                1 as receiver_id, -- Admin
                'Admin' as receiver_name,
                'admin@example.com' as receiver_email,
                CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END as is_read,
                sr.created_at,
                sr.updated_at
            FROM service_requests sr
            JOIN services s ON sr.service_id = s.id
            JOIN users u ON sr.user_id = u.id
            $whereClause
            ORDER BY sr.created_at DESC
            LIMIT ? OFFSET ?";
    
    $params[] = (int)$limit;
    $params[] = (int)$offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format messages
    $formattedMessages = array_map(function($message) {
        return [
            'id' => (int)$message['id'],
            'subject' => $message['subject'],
            'message' => $message['message'],
            'type' => $message['type'],
            'sender_id' => (int)$message['sender_id'],
            'sender_name' => $message['sender_name'],
            'sender_email' => $message['sender_email'],
            'receiver_id' => (int)$message['receiver_id'],
            'receiver_name' => $message['receiver_name'],
            'receiver_email' => $message['receiver_email'],
            'is_read' => (bool)$message['is_read'],
            'created_at' => $message['created_at'],
            'updated_at' => $message['updated_at']
        ];
    }, $messages);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedMessages
    ]);
}

function getMessage($pdo, $messageId) {
    // Get specific message (using service request as example)
    $sql = "SELECT 
                sr.id,
                CONCAT('Service Request: ', s.name) as subject,
                CONCAT('Service request from ', CONCAT(u.first_name, ' ', u.last_name), '. Details: ', sr.description) as message,
                'service_request' as type,
                sr.user_id as sender_id,
                CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                u.email as sender_email,
                1 as receiver_id,
                'Admin' as receiver_name,
                'admin@example.com' as receiver_email,
                CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END as is_read,
                sr.created_at,
                sr.updated_at
            FROM service_requests sr
            JOIN services s ON sr.service_id = s.id
            JOIN users u ON sr.user_id = u.id
            WHERE sr.id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$message) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Message not found']);
        return;
    }
    
    $formattedMessage = [
        'id' => (int)$message['id'],
        'subject' => $message['subject'],
        'message' => $message['message'],
        'type' => $message['type'],
        'sender_id' => (int)$message['sender_id'],
        'sender_name' => $message['sender_name'],
        'sender_email' => $message['sender_email'],
        'receiver_id' => (int)$message['receiver_id'],
        'receiver_name' => $message['receiver_name'],
        'receiver_email' => $message['receiver_email'],
        'is_read' => (bool)$message['is_read'],
        'created_at' => $message['created_at'],
        'updated_at' => $message['updated_at']
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $formattedMessage
    ]);
}

function getMessageStats($pdo) {
    // Get message statistics
    $stats = [
        'total_messages' => 0,
        'unread_messages' => 0,
        'read_messages' => 0,
        'today_messages' => 0,
        'week_messages' => 0
    ];
    
    // Count service requests as messages
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM service_requests");
    $stats['total_messages'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as unread FROM service_requests WHERE status = 'pending'");
    $stats['unread_messages'] = $stmt->fetch(PDO::FETCH_ASSOC)['unread'];
    
    $stats['read_messages'] = $stats['total_messages'] - $stats['unread_messages'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as today FROM service_requests WHERE DATE(created_at) = CURDATE()");
    $stats['today_messages'] = $stmt->fetch(PDO::FETCH_ASSOC)['today'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as week FROM service_requests WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $stats['week_messages'] = $stmt->fetch(PDO::FETCH_ASSOC)['week'];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
}

function sendMessage($pdo, $data) {
    // For demo purposes, we'll create a notification instead of a message
    $receiverId = $data['receiver_id'] ?? null;
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'message';
    
    if (!$receiverId || !$subject || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Receiver ID, subject, and message are required']);
        return;
    }
    
    // Insert as notification
    $sql = "INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
            VALUES (?, ?, ?, ?, 0, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$receiverId, $subject, $message, $type]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully',
        'data' => ['id' => $pdo->lastInsertId()]
    ]);
}

function broadcastMessage($pdo, $data) {
    $subject = $data['subject'] ?? '';
    $message = $data['message'] ?? '';
    $targetRole = $data['target_role'] ?? 'all';
    $type = $data['type'] ?? 'broadcast';
    
    if (!$subject || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Subject and message are required']);
        return;
    }
    
    // Get target users
    $whereClause = "WHERE status = 'active'";
    $params = [];
    
    if ($targetRole !== 'all') {
        $whereClause .= " AND role = ?";
        $params[] = $targetRole;
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users $whereClause");
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Send to all users
    $insertSql = "INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
                  VALUES (?, ?, ?, ?, 0, NOW())";
    $insertStmt = $pdo->prepare($insertSql);
    
    $sentCount = 0;
    foreach ($users as $user) {
        $insertStmt->execute([$user['id'], $subject, $message, $type]);
        $sentCount++;
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Broadcast message sent to $sentCount users",
        'data' => ['sent_count' => $sentCount]
    ]);
}

function markAsRead($pdo, $messageId) {
    // Mark service request as read (change status from pending)
    $sql = "UPDATE service_requests SET status = 'confirmed', updated_at = NOW() WHERE id = ? AND status = 'pending'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$messageId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message marked as read'
    ]);
}

function markAsUnread($pdo, $messageId) {
    // Mark service request as unread (change status back to pending)
    $sql = "UPDATE service_requests SET status = 'pending', updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$messageId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message marked as unread'
    ]);
}

function bulkMarkAsRead($pdo, $data) {
    $messageIds = $data['message_ids'] ?? [];
    
    if (empty($messageIds)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Message IDs are required']);
        return;
    }
    
    $placeholders = str_repeat('?,', count($messageIds) - 1) . '?';
    $sql = "UPDATE service_requests SET status = 'confirmed', updated_at = NOW() WHERE id IN ($placeholders) AND status = 'pending'";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($messageIds);
    
    echo json_encode([
        'success' => true,
        'message' => 'Messages marked as read',
        'data' => ['updated_count' => $stmt->rowCount()]
    ]);
}

function bulkDeleteMessages($pdo, $data) {
    $messageIds = $data['message_ids'] ?? [];
    
    if (empty($messageIds)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Message IDs are required']);
        return;
    }
    
    $placeholders = str_repeat('?,', count($messageIds) - 1) . '?';
    $sql = "UPDATE service_requests SET status = 'cancelled', updated_at = NOW() WHERE id IN ($placeholders)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($messageIds);
    
    echo json_encode([
        'success' => true,
        'message' => 'Messages deleted',
        'data' => ['deleted_count' => $stmt->rowCount()]
    ]);
}

function updateMessage($pdo, $messageId, $data) {
    // Update service request details
    $updateFields = [];
    $params = [];
    
    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $params[] = $data['description'];
    }
    
    if (isset($data['status'])) {
        $updateFields[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $updateFields[] = "updated_at = NOW()";
    $params[] = $messageId;
    
    $sql = "UPDATE service_requests SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message updated successfully'
    ]);
}

function deleteMessage($pdo, $messageId) {
    // Soft delete by changing status
    $sql = "UPDATE service_requests SET status = 'cancelled', updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$messageId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Message deleted successfully'
    ]);
}
?>
