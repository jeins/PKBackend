import {Router} from 'express';
import LayerController from '../controllers/LayerController';

export default ()=>{
    var route = Router();
    var ctrl = new LayerController();

    route.get('/ulayer/all/:limit/:currPage', (req, res)=>{
        
    });
    route.get('/ulayer/user', (req, res)=>{
        ctrl.getLayerFilterByUser(req.userData, (result)=>{
            res.json(result);
        });
    });
    route.get('/ulayer/workspace/:workspace', (req, res)=>{
        ctrl.getLayerFilterByWorkspace(req.params.workspace, (result)=>{
            res.json(result);
        });
    });

    route.post('/ulayer/add', (req, res)=>{
        ctrl.addLayer(req.userData, req.body, (result)=>{
            res.json(result);
        });
    });

    return route;
}