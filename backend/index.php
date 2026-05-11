<?php
/**
 * API Backend - Endpoints principales
 */

require_once 'config.php';

$accion = isset($_GET['accion']) ? $_GET['accion'] : '';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($accion) {
    case 'productos':
        obtenerProductos();
        break;
    case 'gastos':
        obtenerGastos();
        break;
    case 'registrar':
        if ($metodo === 'POST') {
            registrarGasto();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
        }
        break;
    case 'saldo':
        obtenerSaldo();
        break;
    case 'tamalbits':
        obtenerTamalbits();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
}

/**
 * Obtener lista de productos
 */
function obtenerProductos() {
    global $conn;
    
    $resultado = $conn->query("SELECT idProducto, nombre, precio, categoria, descripcion, emoji FROM productos ORDER BY nombre");
    $productos = [];
    
    while ($fila = $resultado->fetch_assoc()) {
        $productos[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'productos' => $productos
    ]);
}

/**
 * Obtener gastos (con filtro opcional por usuario)
 */
function obtenerGastos() {
    global $conn;
    
    $usuario = isset($_GET['usuario']) ? $_GET['usuario'] : null;
    
    $sql = "SELECT g.idGasto, g.usuario, g.monto, p.nombre as producto, p.categoria, g.descripcion, g.fechaRegistro 
            FROM gastos g 
            LEFT JOIN productos p ON g.idProducto = p.idProducto 
            WHERE 1=1";
    
    if ($usuario) {
        $usuario_escape = $conn->real_escape_string($usuario);
        $sql .= " AND g.usuario = '$usuario_escape'";
    }
    
    $sql .= " ORDER BY g.fechaRegistro DESC";
    
    $resultado = $conn->query($sql);
    $gastos = [];
    
    while ($fila = $resultado->fetch_assoc()) {
        $gastos[] = $fila;
    }
    
    echo json_encode([
        'success' => true,
        'gastos' => $gastos
    ]);
}

/**
 * Registrar nuevo gasto
 */
function registrarGasto() {
    global $conn;
    
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $usuario = $datos['usuario'] ?? '';
    $idProducto = $datos['idProducto'] ?? 0;
    $monto = isset($datos['monto']) ? floatval($datos['monto']) : 0;
    $descripcion = $datos['descripcion'] ?? ($datos['nota'] ?? '');
    
    // Validar
    if (!$usuario || !$idProducto || $monto <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        return;
    }
    
    // Obtener saldo de API (se asume que $usuario contiene el personId usado por el servicio bancario)
    $saldoAPI = obtenerSaldoDesdeAPI($usuario);
    if ($saldoAPI === false) {
        http_response_code(500);
        echo json_encode(['error' => 'No se puede conectar a la API bancaria']);
        return;
    }
    
    // Verificar saldo total
    $totalGastos = obtenerTotalGastos();
    if (($totalGastos + $monto) > $saldoAPI) {
        http_response_code(400);
        echo json_encode(['error' => 'Saldo insuficiente']);
        return;
    }
    
    // Restar de API (usar nota como reason si está disponible)
    $reason = $descripcion ?: 'Gasto desde app';
    if (!restarSaldoAPI($usuario, $monto, $reason)) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al procesar pago en API']);
        return;
    }
    
    // Insertar gasto
    $usuario_esc = $conn->real_escape_string($usuario);
        $descripcion_esc = $conn->real_escape_string($descripcion);
    
        $sql = "INSERT INTO gastos (usuario, idProducto, monto, descripcion) 
            VALUES ('$usuario_esc', $idProducto, $monto, '$descripcion_esc')";
    
    if ($conn->query($sql)) {
        // Actualizar Tamalbits si es "Orejas de Pollo"
        $categoriaResult = $conn->query("SELECT categoria FROM productos WHERE idProducto = $idProducto");
        $categoria = $categoriaResult->fetch_assoc()['categoria'];
        
        if (strtolower($categoria) === 'orejas de pollo') {
            actualizarTamalbits($usuario_esc, $monto);
        }
        
        echo json_encode(['success' => true, 'mensaje' => 'Gasto registrado']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar']);
    }
}

/**
 * Obtener saldo de la API
 */
function obtenerSaldo() {
    $personId = isset($_GET['personId']) ? $_GET['personId'] : '';
    if (!$personId) {
        http_response_code(400);
        echo json_encode(['error' => 'personId requerido']);
        return;
    }

    $saldo = obtenerSaldoDesdeAPI($personId);

    if ($saldo === false) {
        http_response_code(500);
        echo json_encode(['error' => 'No se puede conectar a API']);
        return;
    }

    echo json_encode(['balance' => floatval($saldo)]);
}

/**
 * Obtener saldo desde API (función interna)
 */
function obtenerSaldoDesdeAPI($personId) {
    $url = API_BANK_ACCOUNT . '/' . urlencode($personId);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);

    $respuesta = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return false;
    }

    $datos = json_decode($respuesta, true);
    return $datos['balance'] ?? false;
}

/**
 * Restar saldo en API
 */
function restarSaldoAPI($personId, $monto, $reason = '') {
    $url = API_BANK_ACCOUNT . '/' . urlencode($personId) . '/deduct';
    $payload = ['amount' => floatval($monto)];
    if ($reason !== '') $payload['reason'] = $reason;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);

    $respuesta = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode === 200;
}

/**
 * Obtener total de gastos registrados
 */
function obtenerTotalGastos() {
    global $conn;
    
    $resultado = $conn->query("SELECT COALESCE(SUM(monto), 0) as total FROM gastos");
    $fila = $resultado->fetch_assoc();
    
    return floatval($fila['total']);
}

/**
 * Obtener Tamalbits de usuario
 */
function obtenerTamalbits() {
    global $conn;
    
    $usuario = isset($_GET['usuario']) ? $_GET['usuario'] : '';
    
    if (!$usuario) {
        http_response_code(400);
        echo json_encode(['error' => 'Usuario requerido']);
        return;
    }
    
    $usuario_esc = $conn->real_escape_string($usuario);
    
    $sql = "SELECT COALESCE(SUM(g.monto), 0) as totalGastado
            FROM gastos g
            LEFT JOIN productos p ON g.idProducto = p.idProducto
            WHERE g.usuario = '$usuario_esc' 
            AND LOWER(p.categoria) = 'orejas de pollo'";
    
    $resultado = $conn->query($sql);
    $fila = $resultado->fetch_assoc();
    
    $totalGastado = floatval($fila['totalGastado']);
    $tamalbits = floor($totalGastado / 10);
    
    echo json_encode([
        'success' => true,
        'usuario' => $usuario,
        'tamalbits' => $tamalbits,
        'totalGastado' => $totalGastado
    ]);
}

/**
 * Actualizar Tamalbits
 */
function actualizarTamalbits($usuario, $monto) {
    global $conn;
    
    $tamalbitsNuevos = floor($monto / 10);
    
    // Verificar si el usuario ya existe
    $resultado = $conn->query("SELECT * FROM tamalbits_usuarios WHERE usuario = '$usuario'");
    
    if ($resultado->num_rows > 0) {
        $conn->query("UPDATE tamalbits_usuarios SET tamalbits = tamalbits + $tamalbitsNuevos WHERE usuario = '$usuario'");
    } else {
        $conn->query("INSERT INTO tamalbits_usuarios (usuario, tamalbits) VALUES ('$usuario', $tamalbitsNuevos)");
    }
}
?>
