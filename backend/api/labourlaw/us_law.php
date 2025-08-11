<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// API endpoint (US Dept of Labor — Example: OSHA enforcement cases)
$endpoint = "https://data.dol.gov/get/OSHAEnforcement";

// আপনার DOL API Key (https://developer.dol.gov/)
$apiKey = "YOUR_DOL_API_KEY";

// যদি React থেকে কোনো query parameter পাঠানো হয়
$params = $_GET;

// মূল API URL তৈরী
$queryString = http_build_query($params);
$url = $endpoint . "?" . $queryString;

// cURL দিয়ে রিকোয়েস্ট করা
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "Authorization: Bearer {$apiKey}"
]);

$response = curl_exec($ch);

if(curl_errno($ch)){
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// API থেকে পাওয়া ডেটা React-এ পাঠানো
echo $response;
