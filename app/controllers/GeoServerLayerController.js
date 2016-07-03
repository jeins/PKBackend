import PostgisProcessor from '../processors/PostgisProcessor';

module.exports = class GeoServerLayerController{
	constructor(){
		this.postgisProcessor = new PostgisProcessor();
	}

	postLayer(reqBody, callback){
		reqBody.name = reqBody.name.replace(/\s+/g, '_');

		this.postgisProcessor.addLayerToPostgis(reqBody.name, reqBody.coordinates, function(result){
			callback(result);
		});
	}

	updateLayer(reqBody, callback){
		this.postgisProcessor.updateLayerToPostgis(reqBody.layers, reqBody.coordinates, function(result){
			callback(result);
		});
	}
};