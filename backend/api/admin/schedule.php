<?php
require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    DatabaseConfig::createDatabase();
    
    // Get database connection
    $pdo = DatabaseConfig::getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            if (isset($_GET['stats'])) {
                // Get schedule statistics
                getScheduleStats($pdo);
            } elseif (isset($_GET['id'])) {
                // Get specific schedule
                getSchedule($pdo, $_GET['id']);
            } else {
                // Get all schedules with filters
                getSchedules($pdo);
            }
            break;
            
        case 'POST':
            // Create new schedule
            $data = json_decode(file_get_contents('php://input'), true);
            createSchedule($pdo, $data);
            break;
            
        case 'PUT':
            // Update schedule
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['id'])) {
                updateSchedule($pdo, $_GET['id'], $data);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Schedule ID is required']);
            }
            break;
            
        case 'DELETE':
            // Delete schedule
            if (isset($_GET['id'])) {
                deleteSchedule($pdo, $_GET['id']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Schedule ID is required']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Schedule API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to process schedule operation'
    ]);
}

function getSchedules($pdo) {
    $view = $_GET['view'] ?? 'month'; // day, week, month
    $date = $_GET['date'] ?? date('Y-m-d');
    $workerId = $_GET['worker_id'] ?? null;
    $status = $_GET['status'] ?? null;
    
    $whereClause = "WHERE 1=1";
    $params = [];
    
    // Date filtering based on view
    switch ($view) {
        case 'day':
            $whereClause .= " AND DATE(sr.scheduled_date) = ?";
            $params[] = $date;
            break;
        case 'week':
            $whereClause .= " AND YEARWEEK(sr.scheduled_date) = YEARWEEK(?)";
            $params[] = $date;
            break;
        case 'month':
            $whereClause .= " AND YEAR(sr.scheduled_date) = YEAR(?) AND MONTH(sr.scheduled_date) = MONTH(?)";
            $params[] = $date;
            $params[] = $date;
            break;
    }
    
    if ($workerId) {
        $whereClause .= " AND sr.worker_id = ?";
        $params[] = $workerId;
    }
    
    if ($status) {
        $whereClause .= " AND sr.status = ?";
        $params[] = $status;
    }
    
    // Get scheduled service requests
    $sql = "SELECT 
                sr.id,
                sr.scheduled_date,
                sr.scheduled_time,
                sr.status,
                sr.total_price,
                sr.address,
                sr.description,
                s.name as service_name,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.phone as customer_phone,
                u.email as customer_email,
                CONCAT(wu.first_name, ' ', wu.last_name) as worker_name,
                wu.phone as worker_phone,
                wu.email as worker_email,
                w.id as worker_id
            FROM service_requests sr
            JOIN services s ON sr.service_id = s.id
            JOIN users u ON sr.user_id = u.id
            LEFT JOIN workers w ON sr.worker_id = w.id
            LEFT JOIN users wu ON w.user_id = wu.id
            $whereClause
            AND sr.scheduled_date IS NOT NULL
            ORDER BY sr.scheduled_date, sr.scheduled_time";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format schedules for calendar
    $formattedSchedules = array_map(function($schedule) {
        $startDateTime = $schedule['scheduled_date'] . ' ' . ($schedule['scheduled_time'] ?? '09:00:00');
        $endDateTime = date('Y-m-d H:i:s', strtotime($startDateTime . ' +2 hours')); // Default 2 hour duration
        
        return [
            'id' => (int)$schedule['id'],
            'title' => $schedule['service_name'],
            'start' => $startDateTime,
            'end' => $endDateTime,
            'status' => $schedule['status'],
            'customer_name' => $schedule['customer_name'],
            'customer_phone' => $schedule['customer_phone'],
            'customer_email' => $schedule['customer_email'],
            'worker_name' => $schedule['worker_name'],
            'worker_phone' => $schedule['worker_phone'],
            'worker_email' => $schedule['worker_email'],
            'worker_id' => $schedule['worker_id'] ? (int)$schedule['worker_id'] : null,
            'address' => $schedule['address'],
            'description' => $schedule['description'],
            'price' => (float)$schedule['total_price'],
            'color' => getStatusColor($schedule['status'])
        ];
    }, $schedules);
    
    echo json_encode([
        'success' => true,
        'data' => $formattedSchedules
    ]);
}

function getSchedule($pdo, $scheduleId) {
    $sql = "SELECT 
                sr.id,
                sr.scheduled_date,
                sr.scheduled_time,
                sr.status,
                sr.total_price,
                sr.address,
                sr.description,
                sr.created_at,
                sr.updated_at,
                s.name as service_name,
                s.description as service_description,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.phone as customer_phone,
                u.email as customer_email,
                u.address as customer_address,
                CONCAT(wu.first_name, ' ', wu.last_name) as worker_name,
                wu.phone as worker_phone,
                wu.email as worker_email,
                w.id as worker_id,
                w.specialization
            FROM service_requests sr
            JOIN services s ON sr.service_id = s.id
            JOIN users u ON sr.user_id = u.id
            LEFT JOIN workers w ON sr.worker_id = w.id
            LEFT JOIN users wu ON w.user_id = wu.id
            WHERE sr.id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$scheduleId]);
    $schedule = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$schedule) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Schedule not found']);
        return;
    }
    
    $startDateTime = $schedule['scheduled_date'] . ' ' . ($schedule['scheduled_time'] ?? '09:00:00');
    $endDateTime = date('Y-m-d H:i:s', strtotime($startDateTime . ' +2 hours'));
    
    $formattedSchedule = [
        'id' => (int)$schedule['id'],
        'title' => $schedule['service_name'],
        'start' => $startDateTime,
        'end' => $endDateTime,
        'status' => $schedule['status'],
        'service_name' => $schedule['service_name'],
        'service_description' => $schedule['service_description'],
        'customer_name' => $schedule['customer_name'],
        'customer_phone' => $schedule['customer_phone'],
        'customer_email' => $schedule['customer_email'],
        'customer_address' => $schedule['customer_address'],
        'worker_name' => $schedule['worker_name'],
        'worker_phone' => $schedule['worker_phone'],
        'worker_email' => $schedule['worker_email'],
        'worker_id' => $schedule['worker_id'] ? (int)$schedule['worker_id'] : null,
        'worker_specialization' => $schedule['specialization'],
        'address' => $schedule['address'],
        'description' => $schedule['description'],
        'price' => (float)$schedule['total_price'],
        'color' => getStatusColor($schedule['status']),
        'created_at' => $schedule['created_at'],
        'updated_at' => $schedule['updated_at']
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $formattedSchedule
    ]);
}

function getScheduleStats($pdo) {
    $today = date('Y-m-d');
    $thisWeek = date('Y-m-d', strtotime('monday this week'));
    $thisMonth = date('Y-m-01');
    
    // Today's schedules
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM service_requests 
                          WHERE DATE(scheduled_date) = ? AND scheduled_date IS NOT NULL");
    $stmt->execute([$today]);
    $todayCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // This week's schedules
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM service_requests 
                          WHERE scheduled_date >= ? AND scheduled_date < DATE_ADD(?, INTERVAL 7 DAY) 
                          AND scheduled_date IS NOT NULL");
    $stmt->execute([$thisWeek, $thisWeek]);
    $weekCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // This month's schedules
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM service_requests 
                          WHERE scheduled_date >= ? AND scheduled_date < DATE_ADD(?, INTERVAL 1 MONTH) 
                          AND scheduled_date IS NOT NULL");
    $stmt->execute([$thisMonth, $thisMonth]);
    $monthCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Status breakdown
    $stmt = $pdo->query("SELECT 
                            status,
                            COUNT(*) as count
                        FROM service_requests 
                        WHERE scheduled_date IS NOT NULL
                        GROUP BY status");
    $statusBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Worker schedule load
    $stmt = $pdo->query("SELECT 
                            w.id as worker_id,
                            CONCAT(u.first_name, ' ', u.last_name) as worker_name,
                            COUNT(sr.id) as scheduled_count,
                            COUNT(CASE WHEN DATE(sr.scheduled_date) = CURDATE() THEN 1 END) as today_count
                        FROM workers w
                        JOIN users u ON w.user_id = u.id
                        LEFT JOIN service_requests sr ON w.id = sr.worker_id 
                            AND sr.scheduled_date IS NOT NULL 
                            AND sr.scheduled_date >= CURDATE()
                        WHERE w.status = 'active'
                        GROUP BY w.id, u.first_name, u.last_name
                        ORDER BY scheduled_count DESC
                        LIMIT 10");
    $workerLoad = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stats = [
        'today_count' => (int)$todayCount,
        'week_count' => (int)$weekCount,
        'month_count' => (int)$monthCount,
        'status_breakdown' => $statusBreakdown,
        'worker_load' => $workerLoad
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
}

function createSchedule($pdo, $data) {
    // This would typically create a new service request with scheduling
    $serviceId = $data['service_id'] ?? null;
    $userId = $data['user_id'] ?? null;
    $workerId = $data['worker_id'] ?? null;
    $scheduledDate = $data['scheduled_date'] ?? null;
    $scheduledTime = $data['scheduled_time'] ?? '09:00:00';
    $address = $data['address'] ?? '';
    $description = $data['description'] ?? '';
    
    if (!$serviceId || !$userId || !$scheduledDate) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Service ID, User ID, and scheduled date are required']);
        return;
    }
    
    // Get service price for calculation
    $stmt = $pdo->prepare("SELECT base_price FROM services WHERE id = ?");
    $stmt->execute([$serviceId]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$service) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid service ID']);
        return;
    }
    
    $sql = "INSERT INTO service_requests (
                user_id, service_id, worker_id, address, description, 
                scheduled_date, scheduled_time, total_price, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $userId,
        $serviceId,
        $workerId,
        $address,
        $description,
        $scheduledDate,
        $scheduledTime,
        $service['base_price']
    ]);
    
    $scheduleId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Schedule created successfully',
        'data' => ['id' => $scheduleId]
    ]);
}

function updateSchedule($pdo, $scheduleId, $data) {
    $updateFields = [];
    $params = [];
    
    if (isset($data['scheduled_date'])) {
        $updateFields[] = "scheduled_date = ?";
        $params[] = $data['scheduled_date'];
    }
    
    if (isset($data['scheduled_time'])) {
        $updateFields[] = "scheduled_time = ?";
        $params[] = $data['scheduled_time'];
    }
    
    if (isset($data['worker_id'])) {
        $updateFields[] = "worker_id = ?";
        $params[] = $data['worker_id'];
    }
    
    if (isset($data['status'])) {
        $updateFields[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (isset($data['address'])) {
        $updateFields[] = "address = ?";
        $params[] = $data['address'];
    }
    
    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $params[] = $data['description'];
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        return;
    }
    
    $updateFields[] = "updated_at = NOW()";
    $params[] = $scheduleId;
    
    $sql = "UPDATE service_requests SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode([
        'success' => true,
        'message' => 'Schedule updated successfully'
    ]);
}

function deleteSchedule($pdo, $scheduleId) {
    // Soft delete by changing status to cancelled
    $sql = "UPDATE service_requests SET status = 'cancelled', updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$scheduleId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Schedule deleted successfully'
    ]);
}

function getStatusColor($status) {
    $colors = [
        'pending' => '#fbbf24',      // yellow
        'confirmed' => '#3b82f6',    // blue
        'scheduled' => '#10b981',    // green
        'in_progress' => '#f59e0b',  // orange
        'completed' => '#059669',    // emerald
        'cancelled' => '#ef4444'     // red
    ];
    
    return $colors[$status] ?? '#6b7280'; // gray as default
}
?>
