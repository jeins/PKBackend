import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';

var app = express();
app.server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, X-Session-Token, x-client-language");
    res.header("Access-Control-Allow-Methods", "GET, POST","PUT", "DELETE");
    next();
});



app.use('/', (req, res)=>{
var auth = 'Basic ' + new Buffer('admin' + ':' + 'geoserver').toString('base64');
    var post_options = {
      host: 'localhost',
      port: '1234',
      path: '/geoserver/rest/workspaces/tiger/datastores/nyc/featuretypes.json',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      }
   }
console.log(post_options)
   var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      //201 is good, anything else is RIP
      if (res.statusCode === 201){
          res.on('data', function (chunk) {
             console.log(chunk);
          });
        //since we're good, call back with no error
      }
      else{
          res.on('data', function (chunk) {
              //something went wrong so call back with error message
             console.log(chunk);
          });
      }
   });
   post_req.end();
});

/** Catch all remaining requests 
app.all('*', function(req, res, next) {
    res.redirect('http://google.com');
});****/

app.server.listen('8888', 'localhost', function () {
    console.log( "Listening on , server_port " )
});


export default app;