import GeoServerLayerRoute from './routes/GeoServerLayerRoute';
import UserRoute from './routes/UserRoute';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

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

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/', GeoServerLayerRoute());
app.use('/', UserRoute());

/** Catch all remaining requests 
app.all('*', function(req, res, next) {
    res.redirect('http://google.com');
});****/

app.server.listen('8888', 'localhost', function () {
    console.log( "Listening on , server_port " )
});


export default app;