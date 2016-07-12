import GeoServerLayerRoute from './routes/GeoServerLayerRoute';
import UserRoute from './routes/UserRoute';
import WorkspaceRoute from './routes/WorkspaceRoute';
import LayerRoute from './routes/LayerRoute';
import Middleware from './common/Middleware';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

var app = express();
app.server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(Middleware.enableCors);
app.use(Middleware.jwt);

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/', GeoServerLayerRoute());
app.use('/', UserRoute());
app.use('/', WorkspaceRoute());
app.use('/', LayerRoute());

/** Catch all remaining requests 
app.all('*', function(req, res, next) {
    res.redirect('http://google.com');
});****/

app.server.listen('8888', 'localhost', ()=>{
    console.log( "Listening on , server_port " )
});

export default app;