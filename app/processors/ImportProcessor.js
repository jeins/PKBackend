import mainConf from '../constants/MainConfig';
import GeoServerProcessor from './GeoServerProcessor';
import multer from 'multer';
import fs from 'fs';

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
	        filename: (req, file, cb) => {console.log(file.fieldname)
	            var datetimestamp = Date.now();
	            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
	        }
		});
		var upload = multer({storage: storage}).single('file');
		console.log(upload);

		if(!fs.existsSync(tmpFolderWithKey)){
			fs.mkdirSync(tmpFolderWithKey);
		}

		upload(req, res, (err)=>{
			if(err) callback(err);
			else callback(null);
		});
	}

	importFileToGeoServer(){}

/*
	_removeFilesInTmpFolder(tmpFolderName){
		try{
			var files = fs.readdirSync(tmpFolderName);
		} catch(e) return;

		if(files.length > 0){

		}
	}*/
}