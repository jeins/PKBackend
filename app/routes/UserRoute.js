import {Router} from 'express';
import UserController from '../controllers/UserController';

export default ()=>{
    var route = Router();
    var ctrl = new UserController();

    // ===============================================
    // ================ GET Request ==================
    // ===============================================
    route.get('/user/me', (req, res)=>{
        ctrl.me(req.userData, (result)=>{
            res.send(result);
        })
    });
    route.get('/user/active/:hash', (req, res)=>{
        ctrl.setUserActive(req.params.hash, (result)=>{
            res.send(result);
        })
    });

    // ===============================================
    // ================ POST Request =================
    // ===============================================
    route.post('/user/authenticate', (req, res)=>{
        ctrl.authenticate(req.body, (result)=>{
            res.send(result);  
        })
    });
    route.post('/user/register', (req, res)=>{
        ctrl.register(req.body, (result)=>{
            res.send(result);
        })
    });

    return route;
}