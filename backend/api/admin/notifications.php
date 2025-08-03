<?php

require_once '../../config/database.php';
require_once '../../middleware/auth.php';
require_once '../../classes/Notification.php';

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$notification = new Notification();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['stats'])) {
                // Get notification statistics
                $result = $notification->getNotificationStats();
            } elseif (isset($_GET['id'])) {
                // Get specific notification
                $result = $notification->getNotificationById($_GET['id']);
            } else {
                // Get all notifications with filters
                $filters = [];
                if (isset($_GET['user_id'])) $filters['user_id'] = $_GET['user_id'];
                if (isset($_GET['type'])) $filters['type'] = $_GET['type'];
                if (isset($_GET['is_read'])) $filters['is_read'] = $_GET['is_read'] === '1';
                if (isset($_GET['priority'])) $filters['priority'] = $_GET['priority'];
                if (isset($_GET['date_from'])) $filters['date_from'] = $_GET['date_from'];
                if (isset($_GET['date_to'])) $filters['date_to'] = $_GET['date_to'];
                if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
                if (isset($_GET['limit'])) $filters['limit'] = $_GET['limit'];
                if (isset($_GET['offset'])) $filters['offset'] = $_GET['offset'];
                
                $result = $notification->getAllNotifications($filters);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['action'])) {
                switch ($data['action']) {
                    case 'bulk_create':
                        // Create multiple notifications
                        $result = $notification->createBulkNotifications($data['notifications']);
                        break;
                    case 'mark_all_read':
                        // Mark all notifications as read for a user
                        $userId = $data['user_id'] ?? null;
                        $result = $notification->markAllAsRead($userId);
                        break;
                    case 'send_system_notification':
                        // Send system-wide notification
                        $result = $notification->createSystemNotification(
                            $data['title'],
                            $data['message'],
                            $data['type'] ?? 'system',
                            $data['priority'] ?? 'medium'
                        );
                        break;
                    default:
                        $result = $notification->createNotification($data);
                }
            } else {
                // Create single notification
                $result = $notification->createNotification($data);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['id'])) {
                if (isset($data['action'])) {
                    switch ($data['action']) {
                        case 'mark_read':
                            $result = $notification->markAsRead($_GET['id']);
                            break;
                        case 'mark_unread':
                            $result = $notification->markAsUnread($_GET['id']);
                            break;
                        default:
                            $result = $notification->updateNotification($_GET['id'], $data);
                    }
                } else {
                    $result = $notification->updateNotification($_GET['id'], $data);
                }
            } elseif (isset($data['action']) && $data['action'] === 'bulk_update') {
                // Bulk update notifications
                $notificationIds = $data['notification_ids'] ?? [];
                $updateData = $data['update_data'] ?? [];
                
                $results = [];
                foreach ($notificationIds as $id) {
                    $results[] = $notification->updateNotification($id, $updateData);
                }
                
                $result = [
                    'success' => true,
                    'message' => 'Bulk update completed',
                    'results' => $results
                ];
            } else {
                $result = ['success' => false, 'message' => 'Notification ID is required'];
            }
            break;
            
        case 'DELETE':
            if (isset($_GET['id'])) {
                $result = $notification->deleteNotification($_GET['id']);
            } elseif (isset($_GET['bulk_delete'])) {
                // Bulk delete notifications
                $data = json_decode(file_get_contents('php://input'), true);
                $notificationIds = $data['notification_ids'] ?? [];
                
                $results = [];
                foreach ($notificationIds as $id) {
                    $results[] = $notification->deleteNotification($id);
                }
                
                $result = [
                    'success' => true,
                    'message' => 'Bulk delete completed',
                    'results' => $results
                ];
            } else {
                $result = ['success' => false, 'message' => 'Notification ID is required'];
            }
            break;
            
        default:
            $result = ['success' => false, 'message' => 'Method not allowed'];
            break;
    }
    
    if ($result['success']) {
        echo json_encode($result);
    } else {
        http_response_code(400);
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    error_log("Notifications API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to process notification operation'
    ]);
}
?>
