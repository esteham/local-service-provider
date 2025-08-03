<?php
require_once '../../config/init.php';
require_once '../../../classes/class_functions.php';

$admin = new Admin();
$pdo = $admin->getPDO();

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'agent'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized Access']);
    exit;
}


try 
{
	$stmt = $pdo->query("

				SELECT
					t.id AS task_id,
					t.title,
					t.note,
					t.deadline,
					t.assigned_at,
					g.group_name,
					e.first_name AS employee_name,
					e.email AS employee_email
				FROM task_assignments ta
				JOIN tasks t ON ta.task_id = t.id
				JOIN employees e ON ta.employee_id = e.id
				JOIN groups g ON t.group_id = g.id
				ORDER BY t.assigned_at DESC
			");
	$tasks = $stmt->fetchAll();

	foreach ($tasks as &$task) 
	{
		$fileStmt = $pdo->prepare("SELECT file_path FROM task_files WHERE task_id = ?");

		$fileStmt->execute([$task['task_id']]);
		$task['files'] = $fileStmt->fetchAll(PDO::FETCH_COLUMN);
	}

	echo json_encode([
            'success' => true, 
            'data' =>$tasks
        ]);
} 
catch (Exception $e) 
{
	echo json_encode([
            'success' => false, 
            'message' =>'Failed to get tasks', 'error'=>$e->getMessage()
        ]);
}