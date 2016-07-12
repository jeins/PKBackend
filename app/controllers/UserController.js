import PkPostgreProcessor from '../processors/PkPostgreProcessor';
import mainConf from '../constants/MainConfig';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

module.exports = class UserController extends PkPostgreProcessor{

    constructor(){
        super();
    }

    /**
     * @api {get} /user/me Request User information
     * @apiHeader {String} authorization User Token.
     * @apiHeader {Application/Json} content-type Allowed Media-Type.
     * @apiVersion 0.1.0
     * @apiName GetUser
     * @apiGroup User
     *
     * @apiSuccess {Int} id The User Id.
     * @apiSuccess {String} full_name Fullname of the User.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "id": 1,
     *       "full_name": "Hello World"
     *    }
     */
    me(userData, callback){
        callback(userData);
    }
    
    register(dataJson, callback){
        dataJson.password = this._getHash(dataJson.password);
        dataJson.hash = this._getHash(dataJson.email);
        dataJson.active = false;
        
        this.insertAction('users', dataJson, (error, result)=>{
            if(!error) return callback({data: {error: false}});
            else return callback(error);
        });
    }
    
    authenticate(dataJson, callback){
        dataJson.password = this._getHash(dataJson.password);
        var conditions = "WHERE email='" + dataJson.email + "' AND password='" + dataJson.password + "' LIMIT 1";
        this.selectAction('users', 'all', conditions, (error, result)=>{
            if(error) throw error;
            if(result.length == 0) return callback({error: true, msg: "User not found or Wrong Password!"});
            if(!result[0].active) return callback({error: true, msg: "Account is not active, check your E-Mail!"});

            var token = jwt.sign({id: result[0].id, email: result[0].email, full_name: result[0].full_name}, mainConf.token.secret, {
                expiresIn: 60*60*24*30
            });

            callback({success: true, token: token});
        })
    }

    setUserActive(hash, callback){
        var condition = "WHERE hash='" + hash + "' LIMIT 1";
        var self = this;
        this.selectAction('users', 'all', condition, (error, result)=>{
            if(error) throw error;
            if(result.length == 0) return callback({error: true, msg: "Could not found not active user."});

            result[0].active = true;
            result[0].hash = '';
            
            condition = "id=" + result[0].id;
            var dataJson = {hash: result[0].hash, active: result[0].active, created_at: result[0].created_at};
            self.updateAction('users', dataJson, condition, (error, result)=>{
                if(!error) return callback({data: {error: false}});
                else return callback(error);
            });
        });
    }

    _getHash(text){
        return crypto
            .createHmac('sha256', mainConf.sha256.secret)
            .update(text)
            .digest('hex');
    }
};