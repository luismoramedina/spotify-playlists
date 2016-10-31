var express = require('express');
var bodyparser = require('body-parser');
var cookieparser = require('cookie-parser');
var http = require('http');
var client = require('./client.js');
var jade = require('jade');
var session = require('express-session')

var client_id = process.env.CLIENT_ID;
var redirect_uri = process.env.CALLBACK || "http%3A%2F%2Flocalhost:8080%2Fcallback";
var serverPort = process.env.PORT || 8080;
var secret = process.env.SECRET;

var app = express();
app.set('view engine', 'jade');
app.use(cookieparser());
app.use(session({secret: secret}));
app.use(bodyparser.urlencoded({
   extended: true, encoding: 'utf8'
}));


var server = app.listen(serverPort);

console.log("listen on " + serverPort);


app.get('/', function (req, res) {
   res.redirect("https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri=" + redirect_uri + "&scope=playlist-modify-private");
});

app.get('/textarea', function (req, res) {
   res.render('textarea');
});

app.post('/songs', function (req, res) {
   var results = [];
   var onComplete = function() {
/*      console.log(results);
      var nohit = ""
      for (var i = 0; i < results.length; i++) {
         var result = results[i]
         if (result.hit.length == 0) {
            nohit += result.search + "\n"
         }
      }
*/

      req.session.tracks = results;

      res.render('results', {
         title: 'Hey',
         results: results
//         nohit: nohit
      });
   };

   var songs = unescape(req.body.text).split("\n");

   for (var i = 0; i < songs.length; i++) {
      client.search(songs[i], req.session.auth_token, 
         function (result) {
            results.push(result);
            if (results.length == songs.length) {
               onComplete();
            }
      });
   }

});

app.get('/playlist', function (req, res) {
   var user = req.session.user_id;

   client.createPlaylist(user, req.query.playlist, req.session.auth_token, function (playlist_id) {

         var tracks = req.session.tracks;

         var hits = tracks.map(
            function (track) {
               return track.hit;
            }).filter(
            function (val) {
               return val.length > 0;
            }
         );

         client.add(user, hits, playlist_id, req.session.auth_token,
            function () {
               res.end("Ok");
            }, function (message) {
               //TODO send 500
               res.end("Error: " + message);
            }
         );
   });
});

app.get('/callback', function (req, res) {
   var code = req.query.code;

   var token = client.authorize(code, client_id , secret, redirect_uri, 
      function (token) {
         req.session.auth_token = token;

         client.me(token, function (userid) {
            req.session.user_id = userid;
            res.render("callback");
         });
   });
});