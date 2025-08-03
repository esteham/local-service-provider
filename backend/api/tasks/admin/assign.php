<?php
require_once '../../config/init.php';

require_once '../../../classes/class_functions.php';
$admin = new Admin();

$pdo = $admin->getPDO();

if(!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin')
{
	echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized'
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

$group_id    = $_POST['group_id'] ?? null;
$employee_ids= $_POST['employee_ids'] ?? null;
$task_title  = $_POST['task_title'] ?? null;
$task_note   = $_POST['task_note'] ?? null;
$deadline    = $_POST['deadline'] ?? null;

if(!$group_id || empty($employee_ids) || !$task_title || !$deadline)
{
    echo json_encode([
            'success'=> false,
            'message'=> 'All fields are required'
        ]);
    exit;
}

//File upload
$uploadDir = '../../assets/uploads/tasks/';
if(!is_dir($uploadDir)){
    mkdir($uploadDir, 0777, true);
}

$uploaded_files = [];

if(!empty($_FILES['task_files']))
{
    foreach ($_FILES['task_files']['tmp_name'] as $key => $tmp_name)
    {
        if($_FILES['task_files']['error'][$key]=== 0)
        {
            $filename = time() .'_' . basename($_FILES['task_files']['name'][$key]);

            $filepath = $uploadDir . $filename;
            move_uploaded_file($tmp_name, $filepath);
            $uploaded_files[] = $filepath;
        }

    }

}

try
{
    $pdo->beginTransaction();

    $taskInsert = $pdo->prepare("INSERT INTO tasks(group_id, title, note, deadline, assigned_by) VALUES (?, ?, ?, ?, ?)");
    $taskInsert->execute([
                $group_id,
                $task_title,
                $task_note,
                $deadline,
                $_SESSION['user']['id']
            ]);
    $task_id = $pdo->lastInsertId();

    $fileStmt= $pdo->prepare("INSERT INTO task_files(task_id, file_path) VALUES (?, ?)");
    foreach ($uploaded_files as $file)
    {
        $fileStmt->execute([$task_id, basename($file)]);
    }
    foreach ($employee_ids as $emp_id)
    {
        $assignStmt = $pdo->prepare("INSERT INTO task_assignments (task_id, employee_id) VALUES (?, ?)");
        $assignStmt ->execute([$task_id, $emp_id]);

        //Fetch Employee Info
        $emp_stmt = $pdo->prepare("SELECT email, first_name FROM employees WHERE id = ?");
        $emp_stmt ->execute([$emp_id]);
        $emp = $emp_stmt->fetch();

        $email = $emp['email'];
		$name = $emp['first_name'];

		$subject = "New Task Assigned: $task_title";

		$body = '
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Task Assignment</title>
                <style>
                    body {
                        font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f7f9fc;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    }
                    .email-header {
                        background: #4f46e5;
                        color: white;
                        padding: 24px;
                        text-align: center;
                    }
                    .email-header h1 {
                        margin: 0;
                        font-size: 22px;
                        font-weight: 600;
                    }
                    .email-body {
                        padding: 24px;
                    }
                    .task-card {
                        background: #f8fafc;
                        border-left: 4px solid #4f46e5;
                        border-radius: 4px;
                        padding: 16px;
                        margin: 20px 0;
                    }
                    .task-detail {
                        margin-bottom: 12px;
                    }
                    .task-label {
                        font-weight: 600;
                        color: #4f46e5;
                        display: inline-block;
                        min-width: 80px;
                    }
                    .deadline-highlight {
                        color: #dc2626;
                        font-weight: 600;
                    }
                    .email-footer {
                        padding: 16px 24px;
                        text-align: center;
                        font-size: 14px;
                        color: #64748b;
                        border-top: 1px solid #e2e8f0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #4f46e5;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        margin: 16px 0;
                    }
                    @media only screen and (max-width: 600px) {
                        .email-container {
                            margin: 0;
                            border-radius: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1>New Task Assigned</h1>
                    </div>
                    
                    <div class="email-body">
                        <p>Dear '.$name.',</p>
                        <p>You have been assigned a new task that requires your attention:</p>
                        
                        <div class="task-card">
                            <div class="task-detail">
                                <span class="task-label">Task:</span>
                                <span>'.$task_title.'</span>
                            </div>
                            <div class="task-detail">
                                <span class="task-label">Details:</span>
                                <span>'.$task_note.'</span>
                            </div>
                            <div class="task-detail">
                                <span class="task-label">Deadline:</span>
                                <span class="deadline-highlight">'.$deadline.'</span>
                            </div>
                        </div>
                        
                        <p>Please review the task details and attached files (if any) for complete information.</p>
                        
                        <center>
                            <a href="https://xetroot.com/" class="button">View Task in Portal</a>
                        </center>
                        
                        <p>If you have any questions, please don\'t hesitate to reach out to your manager.</p>
                        <p>Best regards,</p>
                        <p>The Xetlab Team</p>
                    </div>
                    
                    <div class="email-footer">
                        <p>© '.date('Y').' Xetlab. All rights reserved.</p>
                        <p><small>This is an automated notification - please do not reply directly to this email.</small></p>
                    </div>
                </div>
            </body>
            </html>';

        $admin->sendMail($email, $body, $subject, $uploaded_files);

    }

    $pdo->commit();

    echo json_encode([
            'success' => true, 
            'message' => 'Task assigned and notified to employee'
        ]);

} 
catch (Exception $e) 
{
	$pdo->rollBack();
	echo json_encode([
            'success' => false, 
            'message' => 'Failed to assign task', 'error' => $e->getMessage()
        ]);

}
