import mainConf from '../constants/MainConfig';
import GeoServerProcessor from './GeoServerProcessor';
import multer from 'multer';
import fs from 'fs';
import _ from 'lodash';
import async from 'async';

module.exports = class ImportProcessor{

	constructor(){
		this.geoServerProcessor = new GeoServerProcessor();
	}

	uploadFileToTmpFolder(req, res, callback){
		var key = req.params.key;
		var type = req.params.type;
		var tmpFolderWithKey = mainConf.application.tmpFolder + key + '/';
		var storage = multer.diskStorage({
			destination: (req, file, cb) => {cb(null, tmpFolderWithKey);},
	        filename: (req, file, cb) => {cb(null, type+'._.'+file.originalname);}
		});
		var upload = multer({storage: storage}).single('file');

		if(!fs.existsSync(tmpFolderWithKey)){
			fs.mkdirSync(tmpFolderWithKey);
		}

		this._removeFilesInTmpFolder(type, tmpFolderWithKey);

		upload(req, res, (err)=>{
			if(err) callback(err);
			else callback(null);
		});
	}

	importFileToGeoServer(workspaceName, dataStoreName, key, callback){
		var self = this;
		var tmpFolderWithKey = mainConf.application.tmpFolder + key + '/';
		var files = fs.readdirSync(tmpFolderWithKey);
		dataStoreName = dataStoreName.replace(/\s+/g, '_');

		_(files).forEach((fileName, i)=>{
			var type = self._splitFilenameFromDrawType(fileName);
			var setNewFileName = type + '_' + dataStoreName + '.' + self._getFileExtension(fileName);

			fs.renameSync(tmpFolderWithKey+fileName, tmpFolderWithKey+setNewFileName);

			async.waterfall([
				(callback)=>{
					self.geoServerProcessor.createDataStore(workspaceName, dataStoreName, ()=>{callback(null);});
				},
				(callback)=>{
					var lastFile = false;

					if(i == files.length-1) lastFile = true;

					switch(self._getFileExtension(fileName)){
						case 'zip':
                            self.geoServerProcessor.registerLayerFromShp(workspaceName, dataStoreName, tmpFolderWithKey+setNewFileName);
                            callback(lastFile);
							break;
						case 'json':
							break;
						case 'csv':
							break;
					}
				}
			], (lastFile)=>{
				if(lastFile) {
					async.waterfall([
						(callback)=>{
							self.geoServerProcessor.getLayerCollection(workspaceName, dataStoreName, (result)=>{callback(null, result);});
						},
						(layerCollection, callback)=>{
							self.geoServerProcessor.createLayerGroup(workspaceName, dataStoreName, layerCollection, callback);
						}
					], (error, result)=>{
                        if(error) callback(error);

                        callback("OK");
					})
				}
			});
		});
	}

	_removeFilesInTmpFolder(type, tmpFolderName){
		var self = this;
		var files = fs.readdirSync(tmpFolderName);

		if(files.length > 0){
			_(files).forEach((fileName)=>{
				if(type == self._splitFilenameFromDrawType(fileName)) fs.unlink(tmpFolderName + fileName);
			});
		}
	}

	_getFileExtension(fileName){
		var split = fileName.split('.');
		return split[split.length-1];
	}

	_splitFilenameFromDrawType(fileName){
		var split = fileName.split('._.');
		return split[0];
	}
}