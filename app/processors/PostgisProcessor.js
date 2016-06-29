import queryBuilder from '../common/QueryBuilder';
import dbConfig from '../constants/DatabaseConfig';
import pg from 'pg';
import _ from 'lodash';
import async from 'async';

module.exports = class PostgisProcessor{

	constructor(){
		this.db = new pg.Client(
			"pg://" + dbConfig.development.username +  ":" + 
			dbConfig.development.password +  "@" + dbConfig.development.host +  ":" + 
			dbConfig.development.port +  "/" + dbConfig.development.db_geo);
		this.db.client_encoding = 'UTF8';
		this.db.connect(function(error){
			if(error) console.log('srvDb client.connect ERROR: %s', JSON.stringify(error));
			else console.log('success connect to db_geo');
		})
	}

	addLayerToPostgis(tableName, coordinates, callback){
		var self = this;

		async.forEachOf(coordinates, function(coordinate, geometryType, cb){
			var newTableName = tableName + '_' + geometryType;

			// CREATE TABLE
			self.db.query(queryBuilder.queryCreateTable(newTableName, geometryType), function(err, res){
				if(err) cb(err);

				// INSERT DATA TO TABLE
				self.db.query(queryBuilder.queryInsertData(newTableName, geometryType, coordinate), function(err2, res2){
					if(err2) cb(err2);

					cb(null);
				});
			});
		}, function(err){
			if(err) callback(err);
			callback("OK");
		});
	}
}