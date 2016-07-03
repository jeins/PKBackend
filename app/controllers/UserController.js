import PkPostgreProcessor from '../processors/PkPostgreProcessor';
import mainConf from '../constants/MainConfig';
import crypto from 'crypto';

module.exports = class UserController extends PkPostgreProcessor{

    constructor(){
        super();
    }
    
    register(dataJson, callback){
        dataJson.password = this._getHash(dataJson.password);
        dataJson.hash = this._getHash(dataJson.email);
        dataJson.active = false;
        
        this.insertAction('users', dataJson, function(error, result){
            if(!error) callback({data: {error: false}});
            else callback(error.detail);
        });
    }

    _getHash(text){
        return crypto
            .createHmac('sha256', mainConf.sha256.secret)
            .update(text)
            .digest('hex');
    }
};