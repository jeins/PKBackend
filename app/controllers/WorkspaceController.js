import geoConf from '../constants/GeoserverConfig';
import _ from 'lodash';

module.exports = class WorkspaceController{
	all(callback){
		var workspaces = [];

		_.forEach(geoConf.workspaces, function(value, key){
			workspaces.push(key);
		})

		callback(workspaces);
	}

	getDrawType(workspaceName, callback){
		callback(geoConf.workspaces[workspaceName]);
	}
}