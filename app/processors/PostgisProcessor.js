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
		});
	}

	addLayerToPostgis(tableName, coordinates, callback){
		var self = this;

		async.forEachOf(coordinates, function(coordinate, geometryType, cb){
			var newTableName = tableName + '_' + geometryType;

			self._doInsertData(self.db, newTableName, geometryType, coordinate, cb);
		}, function(err){
			if(err) callback(err);
			callback("OK");
		});
	}

	updateLayerToPostgis(layerLists, coordinates, callback){
		var tableArr = layerLists.split(',');
		var self = this;
		var i = 0;

		async.forEachOf(coordinates, function(coordinate, geometryType, cb){

			async.waterfall([
				async.apply(self._doRemoveTableIsExist, self.db, tableArr[i], geometryType, coordinate),
				self._doInsertData
			], cb);

			i++;
		}, function(error){
			if(error) callback(error);
			callback("OK");
		});
	}

	_doRemoveTableIsExist(db, table, geometryType, coordinate, callback){
		db.query(queryBuilder.querySelectExists(table), function(err, res){
			if(err) callback(err);

			if(res.rows[0].exists){
				db.query(queryBuilder.queryDropTable(table), function(err2, res2){
					if(err2) callback(err2);

					callback(null, db, table, geometryType, coordinate);
				});
			} else callback(null, db, table, geometryType, coordinate);
		});
	}

	_doInsertData(db, tableName, geometryType, coordinate, callback){
		db.query(queryBuilder.queryCreateTable(tableName, geometryType), function(err, res){
			if(err) callback(err);

			db.query(queryBuilder.queryInsertData(tableName, geometryType, coordinate), function(err2, res2){
				if(err2) callback(err2);

				callback(null);
			});
		});
	}
}