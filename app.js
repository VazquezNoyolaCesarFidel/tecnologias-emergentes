const express = require('express');
const lenguaje = require('@google-cloud/language');
var Twitter = require('twitter-node-client').Twitter;
const PORT = process.env.PORT || 5000;
process.env.GOOGLE_APPLICATION_CREDENTIALS = "key.json";
var path = require("path");
var app = express();
//Configuracion de express
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public')));
//Inicializacion de servicios de las APIS
const clienteNatural = new lenguaje.LanguageServiceClient();
var error = function (err, response, body) {
    	console.log('ERROR [%s]', err);
	};

var twitter = new Twitter({
  "consumerKey":'SJSxoeqBJ2xedpRLAmRwVwxjF',
  "consumerSecret":'tmlHWRGxGtIo4BelVjcdO1w6kiVeY6WuIQ5XCPfvw7Uw2u1UxD',
  "accessToken":'147606043-5y0Kx4QkybdMvIcGuAqWzr0nJMNTi0RS3C1KsDfr',
  "accessTokenSecret":'d7rj6aUjh0e2IQwnZlo4E8CqTiGhItRWoIDfswuiJlNRm'
});

//Rutas
app.get('/',function(req,res){
  res.render('index');
});
app.get('/procesamiento',function(req,res){
  const texto = req.query.texto;
  const document = {
    content: texto,
    type: 'PLAIN_TEXT',
  };
  clienteNatural
    .analyzeSentiment({document: document})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      console.log(`Texto: ${texto}`);
      console.log(`Puntaje: ${sentiment.score}`);
      console.log(`Magnitud: ${sentiment.magnitude}`);
      var analisis = { "texto": texto,
                      "puntaje": sentiment.score,
                      "magnitud": sentiment.magnitude
                     };
      res.json(analisis);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
});
app.get('/entidades',function(req,res){
  const texto = req.query.texto;

  const document = {
    content:texto,
    type: 'PLAIN_TEXT',
  };
  clienteNatural
    .analyzeEntities({document:document})
    .then(results=>{
      const entidades = results[0].entities;
      res.json(entidades);
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
});
app.get('/tweet',function(req,res){
  var query = req.query.query;
  var datos = twitter.getSearch({
    'q':query,
    'count':100
  },error,(data)=>{
    console.log(data);
    res.send(JSON.parse(data));
  });
});
//Servidor
app.listen(PORT,function(){
  console.log("Corriendo servidor en puerto" + PORT);
});
