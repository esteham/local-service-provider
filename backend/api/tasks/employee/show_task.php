<?php
require_once '../../config/init.php';
require_once '../../../classes/class_functions.php';

$admin = new Admin();
$pdo = $admin->getPDO();

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'employee') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized Access']);
    exit;
}

$employee_id = $_SESSION['user']['employee_id'];

try 
{
	$stmt = $pdo->prepare("SELECT
					t.id AS task_id,
					t.title,
					t.note,
					t.deadline,
					t.assigned_at,
					g.group_name,
                    COALESCE(tp.progress, 0) AS progress
				FROM tasks t
				JOIN task_assignments ta ON ta.task_id = t.id
				JOIN groups g ON t.group_id = g.id
				LEFT JOIN task_progress tp ON tp.task_id = t.id AND tp.employee_id = ?
                WHERE ta.employee_id = ?
				ORDER BY t.assigned_at DESC
			");
    $stmt->execute([$employee_id, $employee_id]);
	$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

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