import {Router} from 'express';
import GeoServerLayerController from '../controllers/GeoServerLayerController';

export default function(){
	var route = Router();
	var ctrl = new GeoServerLayerController();

	route.get('/layer/:workspace', (req, res)=>{});
	route.get('/layer/:workspace/:layerGroupName', (req, res)=>{});
	route.get('/layer/:workspace/:layerGroupName/geojson', (req, res)=>{});
	route.get('/layer/:workspace/:layerGroupName/bbox', (req, res)=>{
		ctrl.getBbox(req.params.workspace, req.params.layerGroupName, function(result){
			res.send(result);
		});
	});
	route.get('/layer/:workspace/:layerGroupName/:layer/drawtype', (req, res)=>{
		ctrl.getDrawType(req.params.workspace, req.params.layerGroupName, req.params.layer, function(result){
			res.send(result);
		});
	});
	route.get('/layer/:workspace/:layers/bylayer/drawtype', (req, res)=>{});

	route.post('/layer/add', (req, res)=>{
		ctrl.postLayer(req.body, function(result){
			res.send(result);
		});
	});
	route.post('/layer/geoserver', (req, res)=>{});
	route.post('/layer/upload_files/:type/:key', (req, res)=>{});
	route.post('/layer/upload_layers/:workspace/:dataStore/:key', (req, res)=>{});

	route.put('/layer/edit', (req, res)=>{
		ctrl.updateLayer(req.body, function(result){
			res.send(result);
		});
	});

	return route;
}