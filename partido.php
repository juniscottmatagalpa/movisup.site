<?php

header('Content-Type: application/json');

$url='https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026--world-cup/matches.json';

$data=@file_get_contents($url);


if(!$data){

echo json_encode([

"titulo"=>"Mundial FIFA 2026 EN VIVO",

"descripcion"=>"Transmisión en vivo"

]);

exit;

}


$json=json_decode($data,true);

$ahora=time();

$titulo="Mundial FIFA 2026 EN VIVO";

$descripcion="Transmisión en vivo";



foreach($json['matches'] as $p){


$inicio=strtotime($p['date']);

$fin=$inicio+(2*60*60);



if($ahora >= $inicio && $ahora <= $fin){

$titulo=

$p['team1']['name'].
' vs '.
$p['team2']['name'].
' EN VIVO';



$descripcion=

$titulo.
' | Mundial FIFA 2026';


break;

}



}



echo json_encode([

"titulo"=>$titulo,

"descripcion"=>$descripcion

]);

?>
