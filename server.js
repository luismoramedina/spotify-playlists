var express = require('express');
var bodyparser = require('body-parser');
var cookieparser = require('cookie-parser');
var http = require('http');
var client = require('./client.js');
var jade = require('jade');

var app = express();
app.set('view engine', 'jade');
app.use(bodyparser.urlencoded({
    extended: true, encoding: 'utf8'
}));

app.use(cookieparser());


var client_id = process.env.CLIENT_ID;
var redirect_uri = process.env.CALLBACK || "http%3A%2F%2Flocalhost:8080%2Fcallback";
var serverPort = process.env.PORT || 8080;

var server = app.listen(serverPort);
var data = "Mogwai - Hardcore Will Never Die, But You Will - How To Be A Werewolf\nThe Divine Comedy - A Secret History: The Best Of The Divine Comedy - National Express";

console.log("listen on " + redirect_uri);


app.get('/', function (req, res) {
   console.time('traces response in ');
   res.redirect("https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri=" + redirect_uri + "&scope=playlist-modify-private");
   console.timeEnd('traces response in ');
});

app.get('/textarea', function (req, res) {
   console.time('traces response in ');
   res.end('<html><body><form method="post" action="/songs"><textarea type="text" name="text" id="text">' + data +'</textarea><input type="submit" accept-charset="utf-8" value="Submit"/></form></body></html>');
   console.timeEnd('traces response in ');
});

app.post('/songs', function (req, res) {
   console.time('traces response in ');
   var results = [];
   var onComplete = function() {
      console.log(results);
      var nohit = ""
      for (var i = 0; i < results.length; i++) {
         var result = results[i]
         if (result.hit.length == 0) {
            nohit += result.search + "\n"
         }
      }
      res.render('results', {
         title: 'Hey',
         results: results,
         nohit: nohit
      });
   };
   console.log(">" + req.body.text);
   var songs = unescape(req.body.text).split("\n");
   //TODO remove :", beetween () and []
   console.log("songs: " + songs.length);
   for (var i = 0; i < songs.length; i++) {
      console.log(">>>>>>>>>>" + songs[i]);
   }
   for (var i = 0; i < songs.length; i++) {
      client.search(songs[i], req.cookies.auth, 
         function (result) {
            results.push(result);
            if (results.length == songs.length) {
               onComplete();
            }
      });
   }

   console.timeEnd('traces response in ');
});

app.get('/playlist', function (req, res) {
   var user = process.env.SPOTIFY_USER;
   client.createPlaylist(user, req.query.playlist, req.cookies.auth, function (playlist_id) {
         client.add(user, "spotify:track:3LHda8vKJRDhOL6wNtp9XI,spotify:track:4MrwJDlbxpRCdbZWznfbyx", playlist_id, req.cookies.auth, function () {
            res.end("Ok");
      }, function (message) {
         res.end("Error: " + message);
      })
   });
});

app.get('/callback', function (req, res) {
   console.time('traces response in ');
   var code = req.query.code;
   var token = client.authorize(code, redirect_uri, function (token) {
      res.writeHead(200, {'Set-Cookie': 'auth=' + token});
      res.end("<html><body>" + code + "</body></html>");
      console.timeEnd('traces response in ');
   });
});