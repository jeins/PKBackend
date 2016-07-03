import PkPostgreProcessor from '../processors/PkPostgreProcessor';
import mainConf from '../constants/MainConfig';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

module.exports = class UserController extends PkPostgreProcessor{

    constructor(){
        super();
    }
    
    register(dataJson, callback){
        dataJson.password = this._getHash(dataJson.password);
        dataJson.hash = this._getHash(dataJson.email);
        dataJson.active = false;
        
        this.insertAction('users', dataJson, function(error, result){
            if(!error) return callback({data: {error: false}});
            else return callback(error);
        });
    }
    
    authenticate(dataJson, callback){
        dataJson.password = this._getHash(dataJson.password);
        var conditions = "email='" + dataJson.email + "' AND password='" + dataJson.password + "' LIMIT 1";
        this.selectAction('users', 'all', conditions, function(error, result){
            if(error) throw error;
            if(result.length == 0) return callback({error: true, msg: "User not found or Wrong Password!"});
            if(!result[0].active) return callback({error: true, msg: "Account is not active, check your E-Mail!"});

            var token = jwt.sign({email: result[0].email, password: result[0].password}, mainConf.token.secret, {
                expiresIn: 60*60*24*30
            });

            callback({success: true, token: token});
        })
    }

    setUserActive(hash, callback){

    }

    _getHash(text){
        return crypto
            .createHmac('sha256', mainConf.sha256.secret)
            .update(text)
            .digest('hex');
    }
};