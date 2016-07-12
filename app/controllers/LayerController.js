import PkPostgreProcessor from '../processors/PkPostgreProcessor';

module.exports = class LayerController extends PkPostgreProcessor{

    constructor(){
        super();

        this.layerTable = 'layers';
    }

    getAll(orderBy, limit, currentPage, callback){
		if(limit == 0) limit = 1000;

		var condition = 'ORDER BY '+ orderBy + ' LIMIT ' + limit + ' OFFSET ' + currentPage;

		this.selectAction(this.layerTable, 'all', condition, (error, result)=>{
            if(!error) return callback(result);
            else return callback(error);
    	});
    }

    addLayer(userData, dataJson, callback){
    	var data = {
    		user_id: userData.id,
    		name: dataJson.name,
    		workspace: dataJson.workspace,
    		description: dataJson.description
    	};

        this.insertAction(this.layerTable, data, (error, result)=>{
            if(!error) return callback({data: data});
            else return callback(error);
        });
    }

    getLayerFilterByUser(userData, callback){
    	var condition = 'WHERE user_id=' + userData.id;
    	
    	this.selectAction(this.layerTable, 'all', condition, (error, result)=>{
            if(!error) return callback(result);
            else return callback(error);
    	});
    }

    getLayerFilterByWorkspace(workspaceName, callback){
    	var condition = "WHERE workspace='" + workspaceName + "'";

    	this.selectAction(this.layerTable, 'all', condition, (error, result)=>{
            if(!error) return callback(result);
            else return callback(error);
    	});
    }
}