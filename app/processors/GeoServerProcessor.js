import geoConf from '../constants/GeoserverConfig';
import xmlBuilder from '../common/XmlBuilder';
import http from 'http';
import util from 'util';

module.exports = class PostgisProcessor{
	
	constructor(){
		var auth = 'Basic ' + new Buffer(geoConf.rest.username + ':' + geoConf.rest.password).toString('base64');
		this.postRequest = {
			host: geoConf.rest.host,
			port: geoConf.rest.port,
			path: '',
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				'Content-Length': 0,
				'Authorization': auth
			}
		};
	}

	_createDataStore(workspaceName, dataStoreName){
		var uri = '/workspaces/%s/datastores.xml';
		var body = xmlBuilder.dataStore(workspaceName, dataStoreName);

		this.postRequest.path = util.format(uri, workspaceName);
		this.postRequest.headers['Content-Length'] = Buffer.byteLength(body);

		var req = http.request(postRequest, function(res){
			console.log( res.statusCode );
		   	var buffer = "";
		   	res.on( "data", function( data ) { buffer = buffer + data; } );
		   	res.on( "end", function( data ) { console.log( buffer ); } );
		});

		req.on('error', function(e) {
		    console.log('problem with request: ' + e.message);
		});
		
		req.write(body);
		req.end();
	}
}