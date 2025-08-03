<?php
require_once '../config/init.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';
require_once '../../classes/Settings.php';

// Check if user is authenticated and is admin
if (!isAuthenticated() || !isAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$settings = new Settings();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['key'])) {
                // Get specific setting
                $result = $settings->getSetting($_GET['key']);
            } elseif (isset($_GET['group'])) {
                // Get settings by group
                $result = $settings->getSettingsByGroup($_GET['group']);
            } elseif (isset($_GET['backup'])) {
                // Get settings backup
                $result = $settings->backupSettings();
            } else {
                // Get all settings
                $result = $settings->getAllSettings();
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['action'])) {
                switch ($data['action']) {
                    case 'restore_backup':
                        $result = $settings->restoreSettings($data['backup_data']);
                        break;
                    case 'reset_to_defaults':
                        $group = $data['group'] ?? null;
                        $result = $settings->resetToDefaults($group);
                        break;
                    case 'bulk_update':
                        $result = $settings->updateMultipleSettings($data['settings']);
                        break;
                    default:
                        $result = $settings->createSetting($data);
                }
            } else {
                // Create single setting
                $result = $settings->createSetting($data);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($_GET['key'])) {
                $result = $settings->updateSetting($_GET['key'], $data['value'], $data['description'] ?? null);
            } elseif (isset($data['action']) && $data['action'] === 'bulk_update') {
                $result = $settings->updateMultipleSettings($data['settings']);
            } else {
                $result = ['success' => false, 'message' => 'Setting key is required'];
            }
            break;
            
        case 'DELETE':
            if (isset($_GET['key'])) {
                $result = $settings->deleteSetting($_GET['key']);
            } else {
                $result = ['success' => false, 'message' => 'Setting key is required'];
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
    error_log("Settings API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to process settings operation'
    ]);
}
?>
