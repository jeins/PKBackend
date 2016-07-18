import PostgisProcessor from '../processors/PostgisProcessor';
import GeoServerProcessor from '../processors/GeoServerProcessor';
import ImportProcessor from '../processors/ImportProcessor';
import async from 'async';

module.exports = class GeoServerLayerController{
	constructor(){
		this.postgisProcessor = new PostgisProcessor();
		this.geoServerProcessor = new GeoServerProcessor();
		this.uploadProcessor = new ImportProcessor();
	}

	getLayerCollectionByWorkspace(workspaceName, callback){
		this.geoServerProcessor.getLayerCollectionFromWorkspace(workspaceName, (result)=>{
			callback(result);
		});
	}

	getLayerCollection(workspaceName, layerGroupName, callback){
		this.geoServerProcessor.getLayerCollectionWithDrawType(workspaceName, layerGroupName, (result)=>{
			callback(result);
		});
	}

	getFeatureCollectionOfLayerGroup(workspaceName, layerGroupName, callback){
		this.geoServerProcessor.getFeatureCollection(workspaceName, layerGroupName, false, (result)=>{
			callback(result);
		});
	}

	getFeatureCollectionFilterByLayer(workspaceName, layerName, callback){
		this.geoServerProcessor.getFeatureCollection(workspaceName, layerName, true, (result)=>{
			callback(result);
		});
	}

	getBbox(workspaceName, layerGroupName, callback){
		this.geoServerProcessor.getCanvasCoordinateForLayerGroup(workspaceName, layerGroupName, (result)=>{
			callback(result);
		});
	}

	getDrawType(workspaceName, dataStoreName, layerName, callback){
		this.geoServerProcessor.getDrawType(workspaceName, dataStoreName, layerName, (result)=>{
			callback(result);
		});
	}

	uploadFileToTmpFolder(req, res, callback){
		this.uploadProcessor.uploadFileToTmpFolder(req, res, (err)=>{
			if(err) return callback({error: true});
			callback({error: false});
		});
	}

	uploadFileFromTmpToGeoServer(workspaceName, dataStoreName, key, callback){
		var self = this;
		async.waterfall([
			(callback)=>{
				self.uploadProcessor.importFileToGeoServer(workspaceName, dataStoreName, key, callback);
			},
			(callback)=>{
				self.geoServerProcessor.getLayerCollectionWithDrawType(workspaceName, dataStoreName, (result)=>{
					callback(result);
				})
			}
		], function(result){
			callback(result);
		});
	}

	postLayer(reqBody, callback){
		var self = this;
		reqBody.name = reqBody.name.replace(/\s+/g, '_');

		async.waterfall([
			(callback)=>{
				self.postgisProcessor.addLayerToPostgis(reqBody.name, reqBody.coordinates, (layerCollection)=>{
					callback(null, layerCollection);
				})
			}, 
			(layerCollection, callback)=>{
				self.geoServerProcessor.registerLayer(layerCollection, reqBody.workspace, reqBody.name, false, (result)=>{
					callback(null);
				})
			},
			(callback)=>{
				self.geoServerProcessor.getLayerCollectionWithDrawType(reqBody.workspace, reqBody.name, (result)=>{
					callback(null, result);
				})
			}
		], (error, result)=>{
			if(error) callback(error);

			callback(result);
		});
	}

	updateLayer(reqBody, callback){
		var self = this;
		reqBody.name = reqBody.name.replace(/\s+/g, '_');

		async.waterfall([
			(callback)=>{
				self.postgisProcessor.updateLayerToPostgis(reqBody.layers, reqBody.coordinates, (error, layerCollection)=>{
					if(error) return callback(error, null);

					callback(null, layerCollection);
				});
			},
			(layerCollection, callback)=>{
				if(layerCollection.length > 0){
					self.geoServerProcessor.registerLayer(layerCollection, reqBody.workspace, reqBody.name, true, (result)=>{
						callback(null);
					})
				} else callback(null);
			},
			(callback)=>{
				self.geoServerProcessor.getLayerCollectionWithDrawType(reqBody.workspace, reqBody.name, (result)=>{
					callback(null, result);
				})
			}
		], (error, result)=>{
			if(error) callback(error);

			callback(result);
		});
	}
};