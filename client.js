var request = require('request');

exports.add = function(user, tracks, playlist_id, authorization, success, error) {
  var size = 100;
  var chunks = [];

  while (tracks.length > 0) {
    chunks.push(tracks.splice(0, size));
  }

  for (var i = 0; i < chunks.length; i++) {
    var results = 0;
    var hundredsongs = chunks[i];
    add100(user, hundredsongs, playlist_id, authorization,
      function () {
        results+=1;
        if (results === i) {
          success();
        }
      }, function () {
        error();
      });
  }
}

add100 = function(user, tracks, playlist_id, authorization, success, error) {

   console.log("adding songs: " + tracks);

   if (tracks.length > 100) {
      error("more than 100 tracks not allowed");
   }

   var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authorization
   };

   var form = {
      uris: tracks
   };

   request.post( {
       url: 'https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist_id + '/tracks',
       body: JSON.stringify(form),
       headers: headers} ,
       function (error, response, body) {
         console.log("error: " + error);
         console.log("body: " + body);
         console.log("response: " + response);
         success();
       }
   );
}


exports.search = function(search, authorization, success, error) {

   console.log("searching this search: " + search);

   var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authorization
   };

   var form = {
      q: search,
      type: 'track'
   };
   
   request.get( {
       url: 'https://api.spotify.com/v1/search',
       qs: form, headers: headers},
       function (error, response, body) {
         console.log("error: " + error);
         console.log("body: " + body);
         console.log("response: " + JSON.stringify(response));
         var jsonBody = JSON.parse(body);

         if (jsonBody.tracks.items.length > 0) {
           success({ 
              search: search,
              hit: jsonBody.tracks.items[0].uri,
              song: jsonBody.tracks.items[0].name,
              artist: jsonBody.tracks.items[0].artists[0].name,
              album: jsonBody.tracks.items[0].album.name
           });
         } else {
           success({ 
              search: search,
              hit: '',
              song: '*Not found, go back and try adjusting your search',
           });
         }
       }
   );

}

exports.createPlaylist = function(user, name, token, success) {

   console.log("createPlaylist, " + user + ", "  + name);

   var authorization = "Bearer " + token;
   var headers = {
      'Content-Type': 'application/json',
      'Authorization': authorization
   };

   var form = {
      name: name,
      public: false
   };
   
   request.post( {
       url: 'https://api.spotify.com/v1/users/' + user + '/playlists',
       body: JSON.stringify(form),
       headers: headers} ,
       function (error, response, body) {
         console.log("error: " + error);
         console.log("body: " + body);
         console.log("response: " + response);

         success(JSON.parse(body).id);
       }
   );

}

exports.authorize = function(code, clientid, secret, redirect_uri, success) {
   
   console.log("authorize");
   var token = new Buffer(clientid + ":" + secret).toString('base64');
   var authorization = "Basic " + token;

   var headers = {'Authorization': authorization};
   var form = {
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri
   };
   
   request.post( {
       url: 'https://accounts.spotify.com/api/token',
       form: form,
       headers: headers},
       function (error, response, body) {
         var jsonres = JSON.parse(body);
         console.log("authorize response: " + jsonres);
         success(jsonres.access_token);
       }
   );
}


exports.me = function(authorization, success, error) {

    var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authorization
   };

   var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authorization
   };

   request.get( {
       url: 'https://api.spotify.com/v1/me',
       headers: headers},
       function (error, response, body) {
         var jsonres = JSON.parse(body);
         console.log("authorize response: " + JSON.stringify(jsonres));
         success(jsonres.id);
       }
   );
}
