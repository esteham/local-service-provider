<?php
require_once '../config/init.php';

require_once '../../classes/class_functions.php';
$admin = new Admin();

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

$data = json_decode(file_get_contents("php://input"), true);

$group_id    = $data['group_id'] ?? 0;
$group_name  = trim($data['group_name'] ?? '');
$description = trim($data['description'] ?? '');
$employee_ids= $data['employee_ids'] ?? [];

if(!$group_id || $group_name === '' || empty($employee_ids))
{
	echo json_encode([
            'success' => false, 
            'message' => 'Group ID, name and employees required'
        ]);
	exit;
}

try 
{
	$pdo = $admin->getPDO();
	$pdo->beginTransaction();

	$stmt = $pdo->prepare("UPDATE groups SET group_name = ?, description = ? WHERE id = ?");
	$stmt->execute([$group_name, $description, $group_id]);

	//Delete Previous Group Members
	$pdo->prepare("DELETE FROM group_members WHERE group_id = ?")->execute([$group_id]);

	//Reinsert Members
	$insert = $pdo->prepare("INSERT INTO group_members (group_id, employee_id) VALUES (?,?)");

	foreach ($employee_ids as $emp_id) 
	{
		$insert->execute([$group_id, $emp_id]);	
	}

	$pdo->commit();

	echo json_encode([
            'success' => true, 
            'message' => 'Group Updated Successfully'
        ]);

	} 
catch (Exception $e) 
{
	$pdo->rollBack();
	echo json_encode([
            'success' => false, 
            'message' => 'Failed to Update Group', 
            'error' => $e->getMessage()
        ]);
}
