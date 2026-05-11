<?php
/**
 * Configuración de la Base de Datos y API
 */

// Base de Datos
define('DB_HOST', 'localhost');
define('DB_USER', 'parcial');
define('DB_PASSWORD', '');
define('DB_NAME', 'parcialCorte3');

// Crear conexión
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

// Verificar conexión
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Conexión fallida: ' . $conn->connect_error]));
}

$conn->set_charset("utf8");

// API REST Bancaria
define('API_BANK_BASE', 'http://localhost:8083/api');
// Account endpoints: GET {API_BANK_ACCOUNT}/{personId} and POST {API_BANK_ACCOUNT}/{personId}/deduct
define('API_BANK_ACCOUNT', API_BANK_BASE . '/account');

// Headers JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>
