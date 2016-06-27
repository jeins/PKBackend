import geoserver from '../constants/GeoserverConfig';
import util from 'util';
import _ from 'lodash';

module.exports = class QueryBuilder{

	static queryCreateTable(tableName, geometryType){
		var query = 'CREATE TABLE IF NOT EXISTS %s(id serial primary key, %s %s);'

		switch(geometryType.toLowerCase){
			case geoserver.geometry_type.point: 
				query = util.format(query, tableName, geoserver.geometry_type.point, geoserver.geometry_4326.point);
				break;
			case geoserver.geometry_type.linestring: 
				query = util.format(query, tableName, geoserver.geometry_type.linestring, geoserver.geometry_4326.linestring);
				break;
			case geoserver.geometry_type.polygon: 
				query = util.format(query, tableName, geoserver.geometry_type.polygon, geoserver.geometry_4326.polygon);
				break;
		}

		return query;
	}

	static queryInsertData(tableName, geometryType, coordinate){
		var query = 'INSERT INTO %s (%s) VALUES %s';
		var valueTemplate = "ST_GeomFromText('%s(%s)', 4326)";
		var values = '';

		for(var i=0; i<coordinate.length; i++){
			values += util.format(valueTemplate, geometryType.toUpperCase(), coordinate[i][0] + ' ' + coordinate[i][1]);
		}

		return util.format(query, tableName, geometryType.toLowerCase(), values);
	}

	static queryDropTable(tableName){
		var query = 'TRUNCATE TABLE %s';
		
		return util.format(query, tableName);
	}

	static querySelectExists(tableName){
		var query = "SELECT EXISTS ( SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '%s' );";

		return util.format(query, tableName);
	}

}