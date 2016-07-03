import {Router} from 'express';
import UserController from '../controllers/UserController';

export default function(){
    var route = Router();
    var ctrl = new UserController();

    route.get('/user/me', (req, res)=>{});
    route.get('/user/active/:hash', (req, res)=>{});

    route.post('/user/authenticate', (req, res)=>{
    });
    route.post('/user/register', (req, res)=>{
        ctrl.register(req.body, function(result){
            res.send(result);
        })
    });

    return route;
}