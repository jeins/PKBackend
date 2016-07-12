import PostgisProcessor from '../processors/PostgisProcessor';
import GeoServerProcessor from '../processors/GeoServerProcessor';
import async from 'async';

module.exports = class GeoServerLayerController{
	constructor(){
		this.postgisProcessor = new PostgisProcessor();
		this.geoServerProcessor = new GeoServerProcessor();
	}

	getFeatureCollectionOfLayerGroup(workspaceName, layerGroupName, callback){
		this.geoServerProcessor.getFeatureCollection(workspaceName, layerGroupName, false, function(result){
			callback(result);
		});
	}

	getFeatureCollectionFilterByLayer(workspaceName, layerName, callback){
		this.geoServerProcessor.getFeatureCollection(workspaceName, layerName, true, function(result){
			callback(result);
		});
	}

	getBbox(workspaceName, layerGroupName, callback){
		this.geoServerProcessor.getCanvasCoordinateForLayerGroup(workspaceName, layerGroupName, function(result){
			callback(result);
		});
	}

	getDrawType(workspaceName, dataStoreName, layerName, callback){
		this.geoServerProcessor.getDrawType(workspaceName, dataStoreName, layerName, function(result){
			callback(result);
		});
	}

	postLayer(reqBody, callback){
		var self = this;
		reqBody.name = reqBody.name.replace(/\s+/g, '_');

		async.waterfall([
			function(callback){
				self.postgisProcessor.addLayerToPostgis(reqBody.name, reqBody.coordinates, function(layerCollection){
					callback(null, layerCollection);
				})
			}, 
			function(layerCollection, callback){
				self.geoServerProcessor.registerLayer(layerCollection, reqBody.workspace, reqBody.name, false, function(result){
					callback(null);
				})
			},
			function(callback){
				self.geoServerProcessor.getLayerCollectionWithDrawType(reqBody.workspace, reqBody.name, function(result){
					callback(null, result);
				})
			}
		], function(error, result){
			if(error) callback(error);

			callback(result);
		});
	}

	updateLayer(reqBody, callback){
		var self = this;
		reqBody.name = reqBody.name.replace(/\s+/g, '_');

		async.waterfall([
			function(callback){
				self.postgisProcessor.updateLayerToPostgis(reqBody.layers, reqBody.coordinates, function(error, layerCollection){
					if(error) return callback(error, null);

					callback(null, layerCollection);
				});
			},
			function(layerCollection, callback){
				if(layerCollection.length > 0){
					self.geoServerProcessor.registerLayer(layerCollection, reqBody.workspace, reqBody.name, true, function(result){
						callback(null);
					})
				} else callback(null);
			},
			function(callback){
				self.geoServerProcessor.getLayerCollectionWithDrawType(reqBody.workspace, reqBody.name, function(result){
					callback(null, result);
				})
			}
		], function(error, result){
			if(error) callback(error);

			callback(result);
		});
	}
};