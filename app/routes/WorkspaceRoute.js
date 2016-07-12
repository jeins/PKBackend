import {Router} from 'express';
import WorkspaceController from '../controllers/WorkspaceController';

export default ()=>{
    var route = Router();
    var ctrl = new WorkspaceController();

    route.get('/workspace/all', (req, res)=>{
        ctrl.all((result)=>{
            res.json(result);
        })
    });
    route.get('/workspace/:workspace/draw', (req, res)=>{
        ctrl.getDrawType(req.params.workspace, (result)=>{
            res.json(result);
        })
    });

    return route;
}