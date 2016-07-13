import geoConf from '../constants/GeoserverConfig';
import _ from 'lodash';

module.exports = class WorkspaceController{
	/**
	 * @api {get} /workspace/all Get the workspace list
	 * @apiHeader {String} authorization User Token.
	 * @apiHeader {Application/Json} content-type Allowed Media-Type.
	 * @apiVersion 0.1.0
	 * @apiName GetWorkspaceList
	 * @apiGroup Workspace
	 *
	 * @apiSuccess (Array) workspaces Workspace Collection
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
     *       ['IDBangunan', 'IDTransportasi', 'IDHipsografi', 'IDBatasDaerah', 'IDTutupanLahan', 'IDHydrografi', 'IDToponomi']
     *    }
	 */
	all(callback){
		var workspaces = [];

		_.forEach(geoConf.workspaces, function(value, key){
			workspaces.push(key);
		});

		callback(workspaces);
	}

	/**
	 * @api {get} /workspace/:workspace/draw DrawType of workspace
	 * @apiHeader {String} authorization User Token.
	 * @apiHeader {Application/Json} content-type Allowed Media-Type.
	 * @apiVersion 0.1.0
	 * @apiName GetDrawTypeOfWorkspace
	 * @apiGroup Workspace
	 *
	 * @apiParam {String} workspace Specific workspace of PetaKami (IDBangunan, IDTransportasi, IDHipsografi, IDBatasDaerah, IDTutupanLahan, IDHydrografi, IDToponomi)
     *
	 * @apiSuccess (Array) drawType Potential DrawType
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
     *       ['Point', 'LineString', 'Polygon']
     *    }
	 */
	getDrawType(workspaceName, callback){
		callback(geoConf.workspaces[workspaceName]);
	}
};