<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Or your frontend origin
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing act id"]);
    exit;
}

$id = intval($_GET['id']);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid act id"]);
    exit;
}

$url = "http://bdlaws.minlaw.gov.bd/act-$id.html";

function fetchHtml($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    $response = curl_exec($ch);
    if(curl_errno($ch)) {
        curl_close($ch);
        return false;
    }
    curl_close($ch);
    return $response;
}

$html = fetchHtml($url);
if (!$html) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch data"]);
    exit;
}

libxml_use_internal_errors(true);
$doc = new DOMDocument();
$doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
libxml_clear_errors();

$xpath = new DOMXPath($doc);

$titleNode = $xpath->query('//h1')->item(0);
$title = $titleNode ? trim($titleNode->textContent) : "";

$contentNode = $xpath->query('//div[contains(@class, "article_body")]')->item(0);
$content = $contentNode ? trim($contentNode->textContent) : "";

if (!$title && !$content) {
    http_response_code(404);
    echo json_encode(["error" => "Data not found or structure changed"]);
    exit;
}

echo json_encode([
    "title" => $title,
    "content" => $content
]);
