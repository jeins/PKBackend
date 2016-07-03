import mainConf from '../constants/MainConfig';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

module.exports = {
    enableCors: function(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, X-Session-Token, x-client-language");
        res.header("Access-Control-Allow-Methods", "GET, POST","PUT", "DELETE");
        next();
    },
    
    jwt: function(req, res, next){
        var token = req.headers['authorization'];
        var whiteList = false;

        _(mainConf.whiteListUri).forEach(function(uri){
            if(req.url.includes(uri)) {
                whiteList = true;
                next();
            }
        });

        if(!whiteList){
            if(token && token.includes('Bearer ')){
                token = token.replace('Bearer ', '');
                jwt.verify(token, mainConf.token.secret, function(error, decoded){
                    if(error) return res.json({ error: true, message: 'Failed to authenticate token.' });

                    req.userData = decoded;
                    next();
                });
            } else return res.status(403).send({ error: true, message: 'No token provided.' });
        }
    }
};