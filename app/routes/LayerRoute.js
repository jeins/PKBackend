import {Router} from 'express';
import LayerController from '../controllers/LayerController';

export default ()=>{
    var route = Router();
    var ctrl = new LayerController();

    route.get('/ulayer/:limit/:currPage', (req, res)=>{});
    route.get('/ulayer/user', (req, res)=>{});
    route.get('/ulayer/workspace/:workspace', (req, res)=>{});

    route.post('/ulayer/add', (req, res)=>{
        ctrl.addLayer(req.userData, req.body, (result)=>{
            res.json(result);
        });
    });

    return route;
}