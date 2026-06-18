
async function obtenerPartido(){


try{


const respuesta = await fetch(

'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

);



const datos = await respuesta.json();





let titulo='Mundial FIFA 2026 EN VIVO';



let descripcion=


'Aquí podrás disfrutar de todos los partidos del Mundial FIFA 2026 en vivo.';





if(datos.events){



for(let partido of datos.events){



if(partido.status.type.state=='in'){





const local=partido.competitions[0].competitors[0].team.displayName;



const visita=partido.competitions[0].competitors[1].team.displayName;




const minuto=partido.status.type.detail;





titulo=


`${local} vs ${visita} EN VIVO (${minuto})`;






descripcion=



`Aquí podrás ver el partido de ${local} vs ${visita} EN VIVO correspondiente al Mundial FIFA 2026. Actualmente se disputa el minuto ${minuto}.`;






break;



}




}




}



document.getElementById('partidoActual').innerHTML=titulo;



document.getElementById('descripcionPartido').innerHTML=descripcion;




}



catch(error){


console.log(error);


}



}



obtenerPartido();



setInterval(


obtenerPartido,

60000

);
