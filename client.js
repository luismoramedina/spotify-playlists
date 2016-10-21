var request = require('request');

exports.search = function(song, authorization, success) {

   console.log("searching this song: " + song);

   var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authorization
   };

   var form = {
      q: song,
      type: 'track'
   };
   
   request.get( {
       url: 'https://api.spotify.com/v1/search',
       qs: form, headers: headers},
       function (error, response, body) {         
//         if (!error && response.statusCode == 200) {
         console.log("error: " + error);
         console.log("body: " + body);
         console.log("response: " + JSON.stringify(response));
         var jsonBody = JSON.parse(body);

         if (jsonBody.tracks.items.length > 0) {
           success({ 
                      search: song,
                      hit: jsonBody.tracks.items[0].uri
                   });
         } else {
           success({ 
                      search: song,
                      hit: ''
                   });
         }
       }
   );

}

exports.createPlaylist = function(user, name, token) {

   console.log("createPlaylist, " + name + ", " + token);

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
//         if (!error && response.statusCode == 200) {
         console.log("error: " + error);
         console.log("body: " + body);
         console.log("response: " + response);
       }
   );

}

exports.authorize = function(code, redirect_uri, success) {
   console.log("authorize");
   
   //TODO encode
   var authorization = "Basic " + process.env.AUTHORIZATION

   var headers = {'Authorization': authorization};
   var form = {
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri
   };
   
   request.post( {
       url: 'https://accounts.spotify.com/api/token',
       form: form,
       headers: headers} ,
       function (error, response, body) {
//         if (!error && response.statusCode == 200) {
         var jsonres = JSON.parse(body);
         console.log("authorize response: " + jsonres);
         success(jsonres.access_token);
       }
   );
}