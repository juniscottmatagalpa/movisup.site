<?php
header("Content-Type: application/json");

$input = file_get_contents("php://input");

$ch = curl_init("https://soravdl.com/download");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Accept: application/json"
]);

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo json_encode([
        "success" => false,
        "error" => "Proxy error: $err"
    ]);
} else {
    echo $response;
}
