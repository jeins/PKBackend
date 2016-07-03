import dbConfig from '../constants/DatabaseConfig';
import pg from 'pg';
import _ from 'lodash';
import util from 'util';
import moment from 'moment';

module.exports = class PkPostgreProcessor{
    /**
     * the constructor
     * set connection to postgresql => database db_petakami
     */
    constructor(){
        this.db = new pg.Client(
            "pg://" + dbConfig.development.username +  ":" +
            dbConfig.development.password +  "@" + dbConfig.development.host +  ":" +
            dbConfig.development.port +  "/" + dbConfig.development.db_pk);
        this.db.client_encoding = 'UTF8';
        this.db.connect(function(error){
            if(error) console.log('srvDb client.connect ERROR: %s', JSON.stringify(error));
            else console.log('success connect to db_petakami');
        });
    }

    /**
     * select data from database
     * conditions must as a string; exp: "id=1 AND name='test'"
     * 
     * @param table
     * @param selection
     * @param conditions
     * @param callback
     */
    selectAction(table, selection, conditions, callback){
        var query = "SELECT %s FROM %s WHERE %s";
        
        if(selection == 'all') selection = '*';
        
        query = util.format(query, selection, table, conditions);
        this.db.query(query, function(error, result){
            if(error) callback(error, null);

            callback(null, result.rows)
        })
    }

    /**
     * insert data to database
     * dataJson is a json with key as a column and the value of json as the value of table column
     * 
     * @param table
     * @param dataJson
     * @param callback
     */
    insertAction(table, dataJson, callback){
        var query = "INSERT INTO %s (%s) VALUES (%s);";
        var self = this;
        var columns = "", values = "";
        
        this._injectDate(dataJson);

        _(dataJson).forEach(function(value, key){
            columns += key + ',';
            values += self._isValueString(value) + ',';
        });

        query = util.format(query, table, columns.slice(0,-1), values.slice(0,-1));

        this.db.query(query, function(error, result){
            if(error) callback(error, null);

            callback(null, result)
        });
    }

    updateAction(table, columns, values, conditions, callback){

    }

    deleteAction(table, conditions, callback){

    }

    _isValueString(value){
        if(isNaN(value)) return "'" + value + "'";
        return value;
    }

    _injectDate(dataJson){
        var today = moment().format('YYYY-MM-DD HH:mm:ss');
        
        if(dataJson.hasOwnProperty('created_at')){
            dataJson.updated_at = today;
        } else{
            dataJson.created_at = today;
            dataJson.updated_at = today;
        }
    }
};