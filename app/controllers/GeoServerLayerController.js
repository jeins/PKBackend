import PostgisProcessor from '../processors/PostgisProcessor';
import async from 'async';

module.exports = class GeoServerLayerController{
	constructor(){
		this.postgisProcessor = new PostgisProcessor();
	}

	postLayer(reqBody, callback){
		reqBody.name = reqBody.name.replace(' ', '_');

		this.postgisProcessor.addLayerToPostgis(reqBody.name, reqBody.coordinates, function(result){
			callback(result);
		});
	}
}