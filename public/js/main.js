var mapa;
var videos = [];
function analizar(){
  var texto = document.getElementById('taMensaje').value;
  $.ajax({
    url:"https://tecnologias-emergentes.herokuapp.com/procesamiento",
    method:'GET',
    data:{"texto":texto}
  }).done(function(response){
    var tabla = document.getElementById('cuerpoTabla');
    var renglon = document.createElement("tr");
    var texto = document.createElement("td");
    texto.textContent = response.texto;
    var puntaje = document.createElement("td");
    puntaje.textContent = response.puntaje;
    var magnitud = document.createElement("td");
    magnitud.textContent = response.magnitud;
    renglon.appendChild(texto);
    renglon.appendChild(puntaje);
    renglon.appendChild(magnitud);
    cuerpoTabla.appendChild(renglon);
    videosApi();
    document.getElementById('taMensaje').value = "";
  });
};
function videosApi(nombre,token,numVideos){
  var texto = nombre;
  if(numVideos <= 0){
    crearPaginacion();
    console.log(videos);
    return;
  }
  const apiKey = 'AIzaSyDBJxhXJ6Zk32ADaVNPwd0lK6JRZUKOAkc';
  $.ajax({
    url:"https://www.googleapis.com/youtube/v3/search",
    method:'GET',
    data:{
      key:apiKey,
      q:texto,
      pageToken:token,
      part:'snippet',
      maxResults:(numVideos<50?numVideos:50)
    }}).done(function(response){
      console.log(response);
      var refFrame = document.getElementById("videos");
      const numResultados = response.pageInfo.resultsPerPage;
      console.log("Resultados =>" + numResultados);
      for(var i = 0; i < numResultados; i++){
        var video_id = response.items[i].id.videoId;
        videos.push(video_id);
        //crearVideo(video_id);
        videosLocalizacion(video_id);
      }
      if(numVideos>50){
        console.log(numVideos-50);
        videosApi(texto,response.nextPageToken,numVideos-50);
      }
      else{
        console.log(numVideos-numResultados);
        videosApi(texto,token,numVideos-numResultados);
      }
    });
}
function videosLocalizacion(video_id){
  const apiKey = 'AIzaSyDBJxhXJ6Zk32ADaVNPwd0lK6JRZUKOAkc';
  $.ajax({
    url:"https://www.googleapis.com/youtube/v3/videos",
    method:'GET',
    data:{
      key: apiKey,
      part:'snippet,recordingDetails,player',
      id:video_id
    }}).done(function(response){
      var video = response.items[0].player.embedHtml;
      if(response.items[0].recordingDetails){
        if(response.items[0].recordingDetails.location){
          if(response.items[0].recordingDetails.location.latitude){
            console.log(response.items[0].recordingDetails);
            var latitud = response.items[0].recordingDetails.location.latitude;
            var longitud = response.items[0].recordingDetails.location.longitude;
            colocarMarcador({lat: latitud,lng: longitud},video,
            "https://firebasestorage.googleapis.com/v0/b/libretadigital-c16d9.appspot.com/o/marcador.png?alt=media&token=fd5621fd-4cfb-48d2-a4db-49f762dfb6dd");
            console.log(latitud,longitud);
          }
        }
      }
    });
}
function deleteVideos(){
  $('#videos').empty();
  $('#paginacion').empty();
  videos = [];
  $('#cuerpoTabla').empty();
  initMap();

}
function limpiarVideos(){
  $('#videos').empty();
}
function crearVideo(video_id){
  var url = "https://www.youtube.com/embed/" + video_id;
  var frame = document.createElement('iframe');
  var videos = document.getElementById('videos');
  var div = document.createElement('div');
  div.setAttribute('class','col l2 m2');
  frame.setAttribute("width","180");
  frame.setAttribute("height","100");
  frame.setAttribute("src",url);
  frame.setAttribute("allowfullscreen","");
  div.appendChild(frame);
  videos.appendChild(div);

}
function entidades(){
  deleteVideos();
  var texto = document.getElementById('taMensaje').value;
  console.log(texto);
  var numVideos = document.getElementById('tanvideos').value;
  buscarTweets(texto);
  $.ajax({
    url:"https://tecnologias-emergentes.herokuapp.com/entidades",
    method:'GET',
    data:{"texto":texto}
  }).done(function(response){
    var tabla = document.getElementById('cuerpoTabla');
    console.log(response);
    for(var i = 0; i< response.length; i++){
      var renglon = document.createElement("tr");
      var texto = document.createElement("td");
      texto.textContent = response[i].name;
      var tipo = document.createElement("td");
      tipo.textContent = response[i].type;
      var url = document.createElement("td");
      if(response[i].metadata.wikipedia_url){
        var link = document.createElement("a");
        link.setAttribute("href",response[i].metadata.wikipedia_url);
        link.setAttribute("class","btn blue");
        link.textContent = "Más";
        url.appendChild(link);
      }
      renglon.appendChild(texto);
      renglon.appendChild(tipo);
      renglon.appendChild(url);
      cuerpoTabla.appendChild(renglon);

    }
    document.getElementById('taMensaje').value = "";
    document.getElementById('tanvideos').value = "";

  });
  videosApi(texto,"",numVideos);
}
function initMap(){
    mapa = new google.maps.Map(document.getElementById('mapa'),{
    center:{lat: 19.405,lng:-99.118},
    zoom: 3
  });
}
function colocarMarcador(coordenadas,frame,nombre){
  var marcador = new google.maps.Marker({
    position:coordenadas,
    map:mapa,
    icon: nombre
  });
  var infoWindow = new google.maps.InfoWindow({
    content:frame
  });
  marcador.addListener('click',function(){
    infoWindow.open(mapa,marcador);
  })
}
function crearPaginacion(){
  var paginas = document.getElementById('paginacion');
  var nPaginas;
  if((videos.length % 12) === 0){
    nPaginas = videos.length/12;
  }
  else{
    nPaginas = Math.trunc(videos.length / 12) + 1;
  }

  console.log(nPaginas);
  for(var i = 0; i < nPaginas; i++){
    var li = document.createElement("li");
    var a = document.createElement("button");
    a.textContent = i + 1;
    a.setAttribute("id", a.textContent);
    a.setAttribute("class","btn green");
    a.setAttribute("onclick","mostrarVideos(" + a.textContent + ")");
    li.appendChild(a);
    paginas.appendChild(li);
  }
  mostrarVideos(1);
}
function mostrarVideos(id){
  limpiarVideos();
  console.log("ID =>" +id);
  var limSuperior = (id * 12)>videos.length?videos.length:id*12;
  var limInferior = (id === 1)?0:((id-1)*12);
  console.log("superior =>" + limSuperior);
  console.log("inferior =>" + limInferior);
  for(var i = limInferior ; i < limSuperior;i++){
    crearVideo(videos[i]);
  }
}
function buscarTweets(query){
  $.ajax({
    url:'https://tecnologias-emergentes.herokuapp.com/tweet',
    method:'GET',
    data:{
      "query":query
    }
  }).done(function(response){
    for(var i = 0 ; i< 100; i++){
      if(response.statuses[i].geo){
        console.log("Tiene geo :)");
        var datos = {"titulo": response.statuses[i].user.name,
                     "parrafo": response.statuses[i].text,
                     "imagen": response.statuses[i].user.profile_image_url};
        var card = cardTweet(datos);
        var geo = {lat: response.statuses[i].geo.coordinates[0],
                   lng: response.statuses[i].geo.coordinates[1]};
        colocarMarcador(geo,card,
          "https://firebasestorage.googleapis.com/v0/b/libretadigital-c16d9.appspot.com/o/twitter.png?alt=media&token=c193a70b-770d-4b42-b830-98d79f4db798");

      }
      else{
        console.log("No tiene geo :(");
      }
    }
  });
}
function cardTweet(datos){
  var row = document.createElement("row");
  var divCard = document.createElement("div");
  divCard.setAttribute("class", "col s12 m12 l12");
  var card = document.createElement("div");
  card.setAttribute("class", "card blue");
  var cardContent = document.createElement("div");
  cardContent.setAttribute("class","card-content white-text");
  var titulo = document.createElement("span");
  var imagen = document.createElement("img");
  imagen.setAttribute("src",datos.imagen);
  cardContent.appendChild(imagen);
  titulo.setAttribute("class","card-title");
  titulo.innerHTML = datos.titulo;
  var parrafo = document.createElement("p");
  parrafo.innerHTML = datos.parrafo;
  cardContent.appendChild(titulo);
  cardContent.appendChild(parrafo);
  card.appendChild(cardContent);
  divCard.appendChild(card);
  row.appendChild(divCard);
  return row;

}
