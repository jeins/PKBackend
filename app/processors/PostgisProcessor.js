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
		this.db.connect((error)=>{
			if(error) console.log('srvDb client.connect ERROR: %s', JSON.stringify(error));
			else console.log('success connect to db_geo');
		});
	}

	addLayerToPostgis(tableName, coordinates, callback){
		var self = this;
		var layerCollection = [];

		async.forEachOf(coordinates, (coordinate, geometryType, cb)=>{
			var newTableName = tableName + '_' + geometryType;
			layerCollection.push(newTableName);

			self._doInsertData(self.db, newTableName, geometryType, coordinate, cb);
		}, (err)=>{
			if(err) callback(err);

			callback(layerCollection);
		});
	}

	updateLayerToPostgis(layerLists, coordinates, callback){
		var tableArr = layerLists.split(',');
		var self = this;
		var i = 0;
		var layerCollection = [];

		async.forEachOf(coordinates, (coordinate, geometryType, cb)=>{
			async.waterfall([
				async.apply(self._doCleanTableIsExist, self.db, layerCollection, tableArr[i], geometryType, coordinate),
				self._doInsertData
			], cb);

			i++;
		}, (error)=>{
			if(error) callback(error, null);

			callback(null, layerCollection);
		});
	}

	_doCleanTableIsExist(db, layerCollection, table, geometryType, coordinate, callback){
		db.query(queryBuilder.querySelectExists(table), (err, res)=>{
			if(err) return callback(err);

			if(res.rows[0].exists){
				db.query(queryBuilder.queryDropTable(table), (err2, res2)=>{
					if(err2) return callback(err2);

					callback(null, db, table, geometryType, coordinate);
				});
			} else {
				layerCollection.push(table);
				callback(null, db, table, geometryType, coordinate);
			}
		});
	}

	_doInsertData(db, tableName, geometryType, coordinate, callback){
		db.query(queryBuilder.queryCreateTable(tableName, geometryType), (err, res)=>{
			if(err) return callback(err);

			db.query(queryBuilder.queryInsertData(tableName, geometryType, coordinate), (err2, res2)=>{
				if(err2) return callback(err2);

				callback(null);
			});
		});
	}
}