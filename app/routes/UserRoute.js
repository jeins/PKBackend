import {Router} from 'express';
import UserController from '../controllers/UserController';

export default function(){
    var route = Router();
    var ctrl = new UserController();

    route.get('/user/me', (req, res)=>{
        ctrl.me(req.userData, function(result){
            res.send(result);
        })
    });
    route.get('/user/active/:hash', (req, res)=>{
        ctrl.setUserActive(req.params.hash, function(result){
            res.send(result);
        })
    });

    route.post('/user/authenticate', (req, res)=>{
        ctrl.authenticate(req.body, function(result){
            res.send(result);  
        })
    });
    route.post('/user/register', (req, res)=>{
        ctrl.register(req.body, function(result){
            res.send(result);
        })
    });

    return route;
}