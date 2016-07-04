import geoConf from '../constants/GeoserverConfig';
import xmlBuilder from '../common/XmlBuilder';
import http from 'http';
import util from 'util';
import _ from 'lodash';
import async from 'async';

module.exports = class PostgisProcessor{
	
	constructor(){
	}

	registerLayer(layerCollection, workspaceName, layerGroupName, callback){
		var self = this;
		var dataStoreName = layerGroupName;

		async.waterfall([
			function(callback){
				self.createDataStore(workspaceName, dataStoreName, callback);
			},
			function(callback){
				async.forEachOf(layerCollection, function(layerName, i, cb){
					self.createFeatureType(workspaceName, dataStoreName, layerName, cb);
				}, callback);
			},
			function(callback){
				self.createLayerGroup(workspaceName, layerGroupName, layerCollection, callback);
			}
		], function(error, result){
			if(error) callback(error);

			callback("OK");
		});
	}

	registerLayerFromShp(workspaceName, dataStoreName, shpFileName, callback){
		var uri = '/workspaces/%s/datastores/%s/file.shp';

		this._sendXmlRequest(util.format(uri, workspaceName, dataStoreName), shpFileName, callback);
	}

	getDrawTypeOfLayer(workspaceName, dataStoreName, layerName, callback){
		var uri = '/workspaces/%s/datastores/%s/featuretypes/%s.json';

	}

	getLayerCollection(workspacesName, dataStoreName){
		var uri = '/workspaces/%s/datastores/%s/featuretypes.json';
	}

	createDataStore(workspaceName, dataStoreName, callback){
		var uri = '/workspaces/%s/datastores.xml';
		var body = xmlBuilder.dataStore(workspaceName, dataStoreName);

		this._sendXmlRequest(util.format(uri, workspaceName), body, callback);
	}

	createFeatureType(workspaceName, dataStoreName, featureTypeName, callback){
		var uri = '/workspaces/%s/datastores/%s/featuretypes';
		var body = xmlBuilder.featureType(featureTypeName);

		this._sendXmlRequest(util.format(uri, workspaceName, dataStoreName), body, callback);
	}

	createLayerGroup(workspaceName, layerGroupName, layerCollection, callback){
		var uri = '/layergroups';
		var body = xmlBuilder.layerGroup(workspaceName, layerGroupName, layerCollection);

		this._sendXmlRequest(uri, body, callback);
	}

	_sendXmlRequest(uri, body, callback){
		var auth = 'Basic ' + new Buffer(geoConf.rest.username + ':' + geoConf.rest.password).toString('base64');

		var postRequest = {
			host: geoConf.rest.host,
			port: geoConf.rest.port,
			path: '/geoserver/rest' + uri,
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				'Authorization': auth
			}
		};

		var req = http.request(postRequest, function(res){
			res.setEncoding('utf8');console.log(res.statusCode);
	      	if (res.statusCode === 201){
	          	res.on('data', function (chunk) {});
				callback(null);
	      	}
	      	else{
	          	res.on('data', function (chunk) {
	             	callback(chunk);
	          	});
	      	}
		});		
		req.write(body);
		req.end();
	}
}