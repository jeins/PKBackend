import PostgisProcessor from '../processors/PostgisProcessor';
import GeoServerProcessor from '../processors/GeoServerProcessor';
import async from 'async';

module.exports = class GeoServerLayerController{
	constructor(){
		this.postgisProcessor = new PostgisProcessor();
		this.geoServerProcessor = new GeoServerProcessor();
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
				self.geoServerProcessor.registerLayer(layerCollection, reqBody.workspace, reqBody.name, function(result){
					callback(null, "OK");
				})
			}
			/*,
			function(callback){
				self.geoServerProcessor.getDrawTypeOfLayer()
			} */
		], function(error, result){
			if(error) callback(error);

			callback(result);
		});
	}

	updateLayer(reqBody, callback){
		this.postgisProcessor.updateLayerToPostgis(reqBody.layers, reqBody.coordinates, function(result){
			callback(result);
		});
	}
};