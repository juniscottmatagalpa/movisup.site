<?php

header('Content-Type: application/json; charset=utf-8');


$url = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026--world-cup/matches.json';


$data = @file_get_contents($url);


if(!$data){

echo json_encode([

'partido' => 'Mundial FIFA 2026 EN VIVO',

'descripcion' =>
'Aquí podrás disfrutar de las transmisiones y seguir todos los partidos de la Copa Mundial FIFA 2026 en vivo y gratis.'

]);

exit;

}


$json = json_decode($data, true);



$ahora = time();


$partido = 'Mundial FIFA 2026 EN VIVO';


$descripcion =
'Aquí podrás disfrutar de las transmisiones y seguir todos los partidos de la Copa Mundial FIFA 2026 en vivo y gratis.';



if(isset($json['matches'])){


foreach($json['matches'] as $p){


if(!isset($p['date']))
continue;



$inicio = strtotime($p['date']);



/*
Duración estimada:

120 minutos

*/


$fin = $inicio + (2 * 60 * 60);



if($ahora >= $inicio && $ahora <= $fin){


$equipo1 = $p['team1']['name'] ?? '';

$equipo2 = $p['team2']['name'] ?? '';



$partido =

$equipo1 .
' vs ' .
$equipo2 .
' EN VIVO';



$descripcion =

'Aquí podrás ver el partido de '.

$equipo1.

' vs '.

$equipo2.

' EN VIVO correspondiente al Mundial FIFA 2026 completamente en vivo y gratis.';



break;

}



}


}




echo json_encode([

'partido'=>$partido,

'descripcion'=>$descripcion


],JSON_UNESCAPED_UNICODE);



?>
