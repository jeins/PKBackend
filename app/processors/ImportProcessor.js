import mainConf from '../constants/MainConfig';
import GeoServerProcessor from './GeoServerProcessor';
import multer from 'multer';
import fs from 'fs';
import _ from 'lodash';

module.exports = class ImportProcessor{

	constructor(){
		this.geoServerProcessor = new GeoServerProcessor();
	}

	uploadFileToTmpFolder(req, res, callback){
		var key = req.params.key;
		var type = req.params.type;
		var tmpFolderWithKey = mainConf.application.tmpFolder + key + '/';
		var storage = multer.diskStorage({
			destination: (req, file, cb) => {
            	cb(null, tmpFolderWithKey);
	        },
	        filename: (req, file, cb) => {
	            var datetimestamp = Date.now();
	            cb(null, type+'._.'+file.originalname);
	        }
		});
		var upload = multer({storage: storage}).single('file');
		console.log(upload);

		if(!fs.existsSync(tmpFolderWithKey)){
			fs.mkdirSync(tmpFolderWithKey);
		}

		this._removeFilesInTmpFolder(type, tmpFolderWithKey);

		upload(req, res, (err)=>{
			if(err) callback(err);
			else callback(null);
		});
	}

	importFileToGeoServer(){}

	_removeFilesInTmpFolder(type, tmpFolderName){
		var files = fs.readdirSync(tmpFolderName);

		if(files.length > 0){
			_(files).forEach(function(fileName){
				var localFileType = fileName.split('._.');
				if(localFileType[0] == type) fs.unlink(tmpFolderName + fileName);
			});
		}
	}
}