var express = require('express');
var http = require('http');
var client = require('./client.js');

var app = express();

//TODO externalize
//"37e1b6ffbc714ad68797ea6fe35b43c5"
var client_id = process.env.CLIENT_ID;
var redirect_uri = process.env.CALLBACK || "http%3A%2F%2Flocalhost:8080%2Fcallback";
var serverPort = process.env.PORT || 8080;

var server = app.listen(serverPort);

console.log("listen on " + redirect_uri);


app.get('/', function (req, res) {
   console.time('traces response in ');
   res.redirect("https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri=" + redirect_uri + "&scope=playlist-modify-private");
   console.timeEnd('traces response in ');
});

app.get('/textarea', function (req, res) {
   console.time('traces response in ');
   res.end('<html><body><form action="/songs"><textarea type="text" name="text" id="text">data</textarea><input type="submit" value="Submit"/></form></body></html>');
   console.timeEnd('traces response in ');
});

app.get('/songs', function (req, res) {
   console.time('traces response in ');
   var results = [];
   var onComplete = function() {
      res.end(results);
   };
   res.end(req.query.text);
   var songs = req.query.text.split("\n");
   for (var i = 0; i < songs.length; i++) {
      client.search(songs[i], function (result) {
         results.push(result);
         if (results.length == songs.length) {
            onComplete();
         }
      });
   }
   console.timeEnd('traces response in ');
});

app.get('/callback', function (req, res) {
   console.time('traces response in ');
   var code = req.query.code;
   res.end("<html><body>" + code + "</body></html>");
   var token = client.authorize(code, redirect_uri, function (token) {
      client.createPlaylist(process.env.SPOTIFY_USER, "Name", token);
   });
   //TODO set cookie
   console.timeEnd('traces response in ');

   
});