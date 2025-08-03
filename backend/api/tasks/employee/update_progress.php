<?php
require_once '../../config/init.php';
require_once '../../../classes/class_functions.php';

$admin = new Admin();
$pdo = $admin->getPDO();

if(!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'employee')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized Access'
        ]);
	exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Invalid Request'
        ]);
	exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$employeeID = $_SESSION['user']['employee_id'];
$task_id    = $input['task_id'] ?? null;
$progress   = $input['progress_percent'] ?? null;
$note       = isset($input['note']) ? trim($input['note']) : null;


if(!$task_id || $progress === null || $progress < 0 || $progress > 100)
{
    echo json_encode([
            'success'=> false, 
            'message'=> 'Invalid INPUT data'
        ]);
    exit;
}

try
{
    $check  = $pdo->prepare("SELECT id FROM task_progress WHERE task_id = ? AND employee_id = ?");
    $check  ->execute([$task_id, $employeeID]);

    if($check->rowCount() > 0)
    {
        $update = $pdo->prepare("UPDATE 
                            task_progress SET progress = ?, 
                            note = ?, 
                            updated_at = NOW() 
                            WHERE task_id = ? 
                            AND employee_id = ?
                        ");
        $update->execute([$progress, $note, $task_id, $employeeID]);
    }

    else
    {
        $insert = $pdo->prepare("INSERT INTO 
                            task_progress (task_id, employee_id, progress, note, updated_at) 
                            VALUES (?, ?, ?, ?, NOW())
                        ");
        $insert->execute([$task_id, $employeeID, $progress, $note]);
    }

    $stmt = $pdo->prepare("SELECT t.title, u.email 
                        FROM tasks t 
                        JOIN groups g ON t.group_id = g.id
                        JOIN users u ON g.created_by = u.id
                        WHERE t.id = ?
                        LIMIT 1
                    ");
    $stmt->execute([$task_id]);
    $result = $stmt->fetch();

    $taskName    = $result['title'] ?? 'Unknown Task';
    $adminEmail  = $result['email'] ?? null;

    $stmt = $pdo->prepare("SELECT first_name, last_name FROM employees WHERE id = ?");
    $stmt->execute([$employeeID]);
    $emp = $stmt->fetch();

    if ($adminEmail) {
        $employeeName = $emp ? "{$emp['first_name']} {$emp['last_name']}" : "Employee";
        $subject = "Task Progress Updated";

        $message = <<<EOD
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        color: #2c3e50;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    .content {
                        background-color: #f9f9f9;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .highlight {
                        color: #e74c3c;
                        font-weight: 600;
                    }
                    .footer {
                        font-size: 14px;
                        color: #7f8c8d;
                        margin-top: 20px;
                        border-top: 1px solid #ecf0f1;
                        padding-top: 20px;
                    }
                    .button {
                        background-color: #3498db;
                        color: white;
                        padding: 10px 15px;
                        text-decoration: none;
                        border-radius: 4px;
                        display: inline-block;
                        margin-top: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="header">Task Progress Update</div>
                
                <div class="content">
                    <p>Hello Admin,</p>
                    
                    <p><strong>$employeeName</strong>  has updated the progress of :</p>
                    
                    <p><strong>Task:</strong> {$taskName}<strong>&nbsp; ID :</strong> {$task_id} <br><br>
                    <strong>New Progress :</strong> <span class="highlight"> {$progress}%</span></p>
                    <p><strong>Note :</strong> {$note}</p>
                </div>
                
                <div class="footer">
                    <p>Best regards,<br>
                    <strong>Task Management System</strong></p>
                    
                    <p style="font-size: 12px; margin-top: 15px;">
                        This is an automated notification. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
            EOD;

        $admin->sendMail($adminEmail, $message, $subject);
    }


    echo json_encode([
            'success' => true, 
            'message' => 'Progress updated'
        ]);

}
catch (Exception $e)
{
    echo json_encode([
            'success'=>false, 
            'message'=>'Update Failed',
            'error'=> $e->getMessage()
        ]);
}