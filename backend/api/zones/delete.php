<?php
require_once '../config/init.php';

require_once '../../classes/class_functions.php';
$admin = new Admin();

if(!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin')
{
	echo json_encode(['success' => false, 'message' => 'Unauthorized']);
	exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST')
{
	echo json_encode(['success' => false, 'message' => 'Invalid Request']);
	exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$group_id = $data['group_id'] ?? 0;

if(!$group_id)
{
	echo json_encode(['success' => false, 'message' => 'Group ID required']);
	exit;
}

try 
{
	$pdo = $admin->getPdo();

	//Remove group members first
	$pdo->prepare("DELETE FROM group_members WHERE group_id = ?")->execute([$group_id]);

	//Then remove group

	$pdo->prepare("DELETE FROM groups WHERE id = ?")->execute([$group_id]);

	echo json_encode(['success' => true, 'message' => 'Group deleted successfully']);
} 
catch (Exception $e) 
{
	echo json_encode(['success' => false, 'message' => 'Failed to delete group', 'error' => $e->getMessage()]);
}


?>