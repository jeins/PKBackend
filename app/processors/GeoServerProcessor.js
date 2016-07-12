import geoConf from '../constants/GeoserverConfig';
import xmlBuilder from '../common/XmlBuilder';
import http from 'http';
import request from 'request';
import util from 'util';
import _ from 'lodash';
import async from 'async';

module.exports = class PostgisProcessor{
	
	constructor(){
		var auth = 'Basic ' + new Buffer(geoConf.rest.username + ':' + geoConf.rest.password).toString('base64');
		this.postRequest = {
			host: geoConf.rest.host,
			port: geoConf.rest.port,
			path: '',
			method: '',
			headers: {
				'Content-Type': '',
				'Authorization': auth
			}
		};
	}

	registerLayer(layerCollection, workspaceName, layerGroupName, isDataStoreExist, callback){
		var self = this;
		var dataStoreName = layerGroupName;

		async.waterfall([
			(callback)=>{
				if(!isDataStoreExist) self.createDataStore(workspaceName, dataStoreName, callback);
				else callback();
			},
			(callback)=>{
				async.forEachOf(layerCollection, (layerName, i, cb)=>{
					self.createFeatureType(workspaceName, dataStoreName, layerName, cb);
				}, callback);
			},
			(callback)=>{
				self.createLayerGroup(workspaceName, layerGroupName, layerCollection, callback);
			}
		], (error, result)=>{
			if(error) callback(error);

			callback("OK");
		});
	}

	registerLayerFromShp(workspaceName, dataStoreName, shpFileName, callback){
		var uri = '/rest/workspaces/%s/datastores/%s/file.shp';

		this._sendXmlRequest(util.format(uri, workspaceName, dataStoreName), shpFileName, callback);
	}

	getLayerCollectionFromWorkspace(workspaceName, callback){
		var uri = '/rest/workspaces/%s/layergroups.json';
		var layerCollection = {};
		var self = this;

		async.waterfall([
			(callback)=>{
				self._sendJsonRequest(util.format(uri, workspaceName), (result)=>{
					callback(null, result.layerGroups.layerGroup);
				});
			},
			(layerGroupNames, callback)=>{
				async.map(layerGroupNames, (layerGroup, cb)=>{
					self.getLayerCollectionWithDrawType(workspaceName, layerGroup.name, (res)=>{
						layerCollection[layerGroup.name] = res;
						cb(null);
					})
				}, callback);
			}
		], (error)=>{
			callback(layerCollection);
		});
	}

	getLayerCollectionWithDrawType(workspaceName, dataStoreName, callback){
		var self = this;
		var layerWithDrawType = [];

		async.waterfall([
			(callback)=>{
				self.getLayerCollection(workspaceName, dataStoreName, (layerCollection)=>{
					callback(null, layerCollection);
				});
			},
			(layerCollection, callback)=>{
				async.map(layerCollection, (layerName, cb)=>{
					self.getDrawType(workspaceName, dataStoreName, layerName, (result)=>{
						layerWithDrawType.push({layer: result.layer, drawType: result.drawType});

						cb(null);
					});
				}, callback);
			}
		], (error)=>{
			callback(layerWithDrawType);
		});
	}

	getDrawType(workspaceName, dataStoreName, layerName, callback){
		var uri = '/rest/workspaces/%s/datastores/%s/featuretypes/%s.json';

		this._sendJsonRequest(util.format(uri, workspaceName, dataStoreName, layerName), (result)=>{
			var attribute = result.featureType.attributes.attribute;
			var drawType = "";

			if(Array.isArray(attribute)) attribute = attribute[0];

			if(attribute.binding.toLowerCase().includes(geoConf.geometry_type.point)) drawType = geoConf.geometry_type.point;
			if(attribute.binding.toLowerCase().includes(geoConf.geometry_type.linestring)) drawType = geoConf.geometry_type.linestring;
			if(attribute.binding.toLowerCase().includes(geoConf.geometry_type.polygon)) drawType = geoConf.geometry_type.polygon;

			callback({layer: layerName, drawType: drawType});
		});
	}

	getCanvasCoordinateForLayerGroup(workspaceName, layerGroupName, callback){
		var uri = '/wms/reflect?format=application/openlayers&layers=%s:%s';

		this._sendRequestGetHtmlBody(util.format(uri, workspaceName, layerGroupName), (result)=>{
			var findThis = 'OpenLayers.Bounds(';
			var startPos = result.indexOf(findThis) + findThis.length;
			var endPos = result.indexOf(');', startPos);
			var getCoordinate = result.substring(startPos,endPos).replace(/\n|\s/g, '').split(',');

			callback({data: getCoordinate});
		});
	}

	getLayerCollection(workspaceName, dataStoreName, callback){
		var uri = '/rest/workspaces/%s/datastores/%s/featuretypes.json';
		var layerCollection = [];

		this._sendJsonRequest(util.format(uri, workspaceName, dataStoreName), (result)=>{
			_(result.featureTypes.featureType).forEach((layer)=>{
				layerCollection.push(layer.name);
			});

			callback(layerCollection);
		});
	}

	getFeatureCollection(workspaceName, layerOrLayerGroupName, isFilterByLayer, callback){
		var uri = '/%s/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=%s:%s&maxFeatures=50&outputFormat=application%2Fjson';
		var featureTypes = [];
		var self = this;

		async.waterfall([
			(callback)=>{
				if(!isFilterByLayer) {
					self.getLayerCollection(workspaceName, layerOrLayerGroupName, (result)=>{
						callback(null, result);
					})
				} else callback(null, layerOrLayerGroupName.split(','));
			}, (layers, callback)=>{
				async.map(layers, (layer, cb)=>{
					self._sendJsonRequest(util.format(uri, workspaceName, workspaceName, layer), (result)=>{
						if(featureTypes.length == 0) featureTypes = result;
						else{
							featureTypes.features = featureTypes.features.concat(result.features);
						} 
						cb(null);
					});
				}, callback)
			}
		], (error)=>{
			callback(featureTypes);
		});
	}

	createDataStore(workspaceName, dataStoreName, callback){
		var uri = '/rest/workspaces/%s/datastores.xml';
		var body = xmlBuilder.dataStore(workspaceName, dataStoreName);

		this._sendXmlRequest(util.format(uri, workspaceName), body, callback);
	}

	createFeatureType(workspaceName, dataStoreName, featureTypeName, callback){
		var uri = '/rest/workspaces/%s/datastores/%s/featuretypes';
		var body = xmlBuilder.featureType(featureTypeName);

		this._sendXmlRequest(util.format(uri, workspaceName, dataStoreName), body, callback);
	}

	createLayerGroup(workspaceName, layerGroupName, layerCollection, callback){
		var uri = '/rest/layergroups';
		var body = xmlBuilder.layerGroup(workspaceName, layerGroupName, layerCollection);

		this._sendXmlRequest(uri, body, callback);
	}

	_sendXmlRequest(uri, body, callback){
		this.postRequest.path += uri;
		this.postRequest.method = 'POST';
		this.postRequest.headers['Content-Type'] = 'text/xml';

		var req = http.request(this.postRequest, (res)=>{
			res.setEncoding('utf8');
	      	if (res.statusCode === 201){
	          	res.on('data', (chunk) => {});
				callback(null);
	      	}
	      	else{
	          	res.on('data', (chunk) => {
	             	callback(chunk);
	          	});
	      	}
		});		
		req.write(body);
		req.end();
	}

	_sendJsonRequest(uri, callback){
		this.postRequest.path = geoConf.rest.path + uri;
		this.postRequest.method = 'GET';
		this.postRequest.headers['Content-Type'] = 'application/json';

		var body = '';
		var req = http.request(this.postRequest, (res)=>{
			res.setEncoding('utf8');
	      	if (res.statusCode === 200){
	          	res.on('data', (chunk) => {
	          		body += chunk;
	          	});
	      	}

	      	res.on('end', () => {
             	callback(JSON.parse(body));
		  	});
		});
		req.on('error', (e)=>{console.log(`problem with request: ${e.message}`);});
		req.end();
	}

	_sendRequestGetHtmlBody(uri, callback){
		this.postRequest.path = geoConf.rest.path + uri;
		this.postRequest.method = 'GET';

		var body = '';
		var req = http.get(this.postRequest, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
          		body += chunk;
          	});

	      	res.on('end', () => {
             	callback(body);
		  	});
		});
		req.on('error', (e)=>{console.log(`problem with request: ${e.message}`);});
		req.end();
	}
}