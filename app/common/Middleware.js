import mainConf from '../constants/MainConfig';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

module.exports = {
    enableCors: (req, res, next)=>{
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Authorization");

        if ( req.method === 'OPTIONS' ) {
            console.log('OPTIONS SUCCESS');
            res.end();
        } else next();
    },
    
    jwt: (req, res, next)=>{
        var token = req.headers['authorization'];
        var whiteList = false;

        _(mainConf.whiteListUri).forEach((uri)=>{

            if(req.url.includes(uri)) {
                whiteList = true;
                next();
            } else{
                var splitWhiteListUri = uri.split('/');
                var splitRequestUri = req.url.split('/');

                if(splitRequestUri.length == splitWhiteListUri.length){
                    var whiteListUri = "";
                    var requestUri = "";

                    _(splitWhiteListUri).forEach((swlUri, i)=>{
                        if(!swlUri.includes(':')){
                            whiteListUri += swlUri;
                            requestUri += splitRequestUri[i];
                        }
                    });

                    if(whiteListUri === requestUri){
                        whiteList = true;
                        next();
                    }
                }
            }
        });

        if(!whiteList){
            if(token && token.includes('Bearer ')){
                token = token.replace('Bearer ', '');
                jwt.verify(token, mainConf.token.secret, (error, decoded)=>{
                    if(error) return res.json({ error: true, message: 'Failed to authenticate token.' });

                    req.userData = decoded;
                    next();
                });
            } else return res.status(403).send({ error: true, message: 'No token provided.' });
        }
    },
};