<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Managua'); // ajusta si quieres otra zona

$url = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026--world-cup/matches.json';

/**
 * Descargar JSON remoto con fallback
 */
function obtenerJson($url) {
    // Intento 1: file_get_contents
    $context = stream_context_create([
        'http' => [
            'timeout' => 15,
            'header'  => "User-Agent: Mozilla/5.0\r\n"
        ]
    ]);

    $data = @file_get_contents($url, false, $context);

    // Intento 2: cURL si file_get_contents falla
    if ($data === false && function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_USERAGENT => 'Mozilla/5.0'
        ]);
        $data = curl_exec($ch);
        curl_close($ch);
    }

    return $data;
}

$data = obtenerJson($url);

if (!$data) {
    echo json_encode([
        'partido' => 'Mundial FIFA 2026 EN VIVO',
        'descripcion' => 'No se pudo cargar la información de los partidos en este momento. Intenta recargar en unos minutos.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$json = json_decode($data, true);

if (!$json || !isset($json['matches']) || !is_array($json['matches'])) {
    echo json_encode([
        'partido' => 'Mundial FIFA 2026 EN VIVO',
        'descripcion' => 'No se encontró información válida de partidos en este momento.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$ahora = time();

$partido = 'Mundial FIFA 2026 EN VIVO';
$descripcion = 'Aquí podrás disfrutar de las transmisiones y seguir todos los partidos del Mundial FIFA 2026 en vivo y gratis.';

$partidoEnVivo = null;
$proximoPartido = null;
$proximoTimestamp = null;

/**
 * Intenta sacar el timestamp del partido
 * Soporta varios formatos posibles del JSON
 */
function obtenerTimestampPartido($p) {
    // Caso 1: date + time
    if (!empty($p['date']) && !empty($p['time'])) {
        $ts = strtotime($p['date'] . ' ' . $p['time']);
        if ($ts !== false) return $ts;
    }

    // Caso 2: date solamente
    if (!empty($p['date'])) {
        $ts = strtotime($p['date']);
        if ($ts !== false) return $ts;
    }

    return false;
}

foreach ($json['matches'] as $p) {

    $inicio = obtenerTimestampPartido($p);
    if ($inicio === false) {
        continue;
    }

    // duración estimada 2 horas
    $fin = $inicio + (2 * 60 * 60);

    $equipo1 = $p['team1']['name'] ?? ($p['team1'] ?? 'Equipo 1');
    $equipo2 = $p['team2']['name'] ?? ($p['team2'] ?? 'Equipo 2');

    // 1) Si el partido está en vivo
    if ($ahora >= $inicio && $ahora <= $fin) {
        $partidoEnVivo = [
            'equipo1' => $equipo1,
            'equipo2' => $equipo2,
            'inicio'  => $inicio
        ];
        break;
    }

    // 2) Guardar el próximo partido futuro más cercano
    if ($inicio > $ahora) {
        if ($proximoTimestamp === null || $inicio < $proximoTimestamp) {
            $proximoTimestamp = $inicio;
            $proximoPartido = [
                'equipo1' => $equipo1,
                'equipo2' => $equipo2,
                'inicio'  => $inicio
            ];
        }
    }
}

/**
 * Formatear fecha bonita
 */
function fechaBonita($timestamp) {
    return date('d/m/Y h:i A', $timestamp);
}

// Si hay partido en vivo
if ($partidoEnVivo) {
    $equipo1 = $partidoEnVivo['equipo1'];
    $equipo2 = $partidoEnVivo['equipo2'];

    $partido = $equipo1 . ' vs ' . $equipo2 . ' EN VIVO';
    $descripcion = 'Aquí podrás ver el partido de ' . $equipo1 . ' vs ' . $equipo2 . ' EN VIVO, correspondiente al Mundial FIFA 2026, completamente gratis.';
}
// Si no hay en vivo, mostrar próximo partido
elseif ($proximoPartido) {
    $equipo1 = $proximoPartido['equipo1'];
    $equipo2 = $proximoPartido['equipo2'];
    $fecha = fechaBonita($proximoPartido['inicio']);

    $partido = 'Próximo partido: ' . $equipo1 . ' vs ' . $equipo2;
    $descripcion = 'El próximo partido del Mundial FIFA 2026 será ' . $equipo1 . ' vs ' . $equipo2 . ' el ' . $fecha . '. Aquí podrás verlo en vivo y gratis.';
}

echo json_encode([
    'partido' => $partido,
    'descripcion' => $descripcion
], JSON_UNESCAPED_UNICODE);
?>
