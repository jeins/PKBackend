import geoserver from '../constants/GeoserverConfig';
import util from 'util';
import _ from 'lodash';

module.exports = class QueryBuilder{

	static queryCreateTable(tableName, geometryType){
		var query = 'CREATE TABLE IF NOT EXISTS %s(id serial primary key, %s %s);'

		switch(geometryType.toLowerCase()){
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

	static queryInsertData(tableName, geometryType, coordinates){
		var query = 'INSERT INTO %s (%s) VALUES %s';
		var valueTemplate = "(ST_GeomFromText('"+ geometryType.toUpperCase() + "(%s)', 4326))";
		var values = "";

		_(coordinates).forEach(function(coordinate){
			var corValue = "";

			if(geometryType.toLowerCase() == geoserver.geometry_type.polygon) corValue = "(";

			_(coordinate).forEach(function(corA){
				if(Array.isArray(corA)){
					_(corA).forEach(function(corB){
						if(Array.isArray(corB)){
							_(corB).forEach(function(corC){
								corValue += corB[0] + ' ' + corB[1] + ',';
								return false;
							});
						} else{
							corValue += corA[0] + ' ' + corA[1] + ',';
							return false;
						} 
					});
				} else {
					corValue += coordinate[0] + ' ' + coordinate[1] + ',';
					return false;
				}
			});
			corValue = corValue.slice(0, -1);
			if(geometryType.toLowerCase() == geoserver.geometry_type.polygon) corValue += ')';
			values += util.format(valueTemplate, corValue) + ',';
		});

		return util.format(query, tableName, geometryType.toLowerCase(), values.slice(0,-1));
	}

	static queryDropTable(tableName){
		var query = 'TRUNCATE TABLE %s RESTART IDENTITY';
		
		return util.format(query, tableName);
	}

	static querySelectExists(tableName){
		var query = "SELECT EXISTS ( SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '%s' );";

		return util.format(query, tableName);
	}
};