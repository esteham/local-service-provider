<?php
require_once '../config/init.php';

// Add CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$_SESSION = [];

if(ini_get("session.use_cookies"))
{
	$params = session_get_cookie_params();

	setcookie(session_name(),'', time() - 42000,
		 $params["path"], $params["domain"],
		 $params["secure"], $params["httponly"]	
		);				
}

session_destroy();

//Response
echo json_encode([
		'success' => true,
		'message' => 'Logout successfull'	
]);
