import PkPostgreProcessor from '../processors/PkPostgreProcessor';

module.exports = class LayerController extends PkPostgreProcessor{

    constructor(){
        super();
    }

    addLayer(userData, dataJson, callback){
    	var data = {
    		user_id: userData.id,
    		name: dataJson.name,
    		workspace: dataJson.workspace,
    		description: dataJson.description
    	};

        this.insertAction('layers', data, (error, result)=>{
            if(!error) return callback({data: data});
            else return callback(error);
        });
    }

    
}