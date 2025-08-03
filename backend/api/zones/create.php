<?php
require_once '../config/init.php';
require_once '../../classes/class_functions.php';

$admin = new Admin();

if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'hr']))
{
    echo json_encode([
            'success'=> false,
            'message'=> 'Unauthorized Access'
        ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$group_name  = trim($data['group_name'] ?? '');
$description = trim($data['description'] ?? '');
$employee_ids= $data['employee_ids'] ?? [];

if($group_name === '' || empty($employee_ids))
{
    echo json_encode([
            'success'=> false,
            'message'=> 'Groupr name and employee list are required'
        ]);
    exit;
}

$pdo = $admin->getPDO();

try
{
    $pdo ->beginTransaction();

    $group_id = $admin->createGroup($group_name, $description, $_SESSION['user']['id']);

    $admin ->addEmployeesToGroup($group_id, $employee_ids);
    $pdo ->commit();

    echo json_encode([
            'success'=> true,
            'message'=> 'Group created succesfully'
        ]);
}
catch(Exception $e)
{
    $pdo ->rollBack();
    echo json_encode([
            'success'=> false,
            'message' => 'Failed to create group', 'error' => $e->getMessage()
        ]);
}
