import mainConf from '../constants/MainConfig';
import GeoServerProcessor from './GeoServerProcessor';
import PostgisProcessor from '../processors/PostgisProcessor';
import multer from 'multer';
import fs from 'fs';
import _ from 'lodash';
import async from 'async';

module.exports = class ImportProcessor{

	constructor(){
        this.postgisProcessor = new PostgisProcessor();
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
							let coordinateFromGeoJson = self._getCoordinateFromGeoJson(JSON.parse(fs.readFileSync(tmpFolderWithKey+setNewFileName)));

                            async.waterfall([
                                (callback)=>{
                                    self.postgisProcessor.addLayerToPostgis(dataStoreName, coordinateFromGeoJson, (layerCollection)=>{
                                        callback(null, layerCollection);
                                    })
                                },
                                (layerCollection, callback)=>{
                                    self.geoServerProcessor.registerLayerFromCsv(layerCollection, workspaceName, dataStoreName, (result)=>{
                                        callback(null, result);
                                    })
                                }
                            ], (error, result)=>{
                                callback(lastFile);
                            });
							break;
						case 'csv':
							let coordinateFromCsv = self._getCoordinateFromCsv(fs.readFileSync(tmpFolderWithKey+setNewFileName, 'utf8'));

                            async.waterfall([
                                (callback)=>{
                                    self.postgisProcessor.addLayerToPostgis(dataStoreName, coordinateFromCsv, (layerCollection)=>{
                                        callback(null, layerCollection);
                                    })
                                },
                                (layerCollection, callback)=>{
                                    self.geoServerProcessor.registerLayerFromCsv(layerCollection, workspaceName, dataStoreName, (result)=>{
                                        callback(null, result);
                                    })
                                }
                            ], (error, result)=>{
                                callback(lastFile);
                            });
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

	_getCoordinateFromGeoJson(geoJson){
		let features = geoJson.features;
		let resultJson = [];
		let obj = {};
		let coordinateType = '';

		_.forEach(features, (feature)=>{
			if(feature.geometry){
				coordinateType = feature.geometry.type.toLowerCase();

				resultJson.push(feature.geometry.coordinates);
			}
		});

        if(!_.isEmpty(resultJson)){
            obj[coordinateType] = resultJson;
		}

        return obj;
	}

	_getCoordinateFromCsv(csv){
		let resultJson = [];
		let obj = {};
		let lines = csv.replace(/\r/g, '').split("\n");
		let coordinateType = this._getCoordinateType(lines[1]);

		for(let i=1; i<lines.length; i++){
			let currentLines = (coordinateType === 'polygon') ? lines[i].split('((') : lines[i].split('(');
			let coordinate = this._getCoordinate(currentLines, coordinateType);

			if(!_.isEmpty(coordinate)){
                if(coordinateType === 'polygon'){
                    resultJson.push([coordinate]);
				} else{
                    resultJson.push(coordinate);
				}
			}
		}

		obj[coordinateType] = resultJson;

		return obj;
	}

	_getCoordinate(currentLines, coordinateType){
		let coordinate = [];
		let self = this;
		_.forEach(currentLines, (line)=>{
			let closeBracket = (coordinateType === 'polygon') ? '))' : ')';
			if(line.includes(closeBracket)){
				let rawCoordinate = line.replace(closeBracket, '').replace('"', '');

				if(coordinateType === 'point'){
					coordinate = self._getXAndY(rawCoordinate);
				}

				if(coordinateType === 'linestring' || coordinateType === 'polygon'){
					let pointCoordinates = rawCoordinate.split(', ');

					_.forEach(pointCoordinates, (pointCoordinate)=>{
						let tmpXYCoordinate = self._getXAndY(pointCoordinate);

						if(!_.isEmpty(tmpXYCoordinate)){
							coordinate.push(tmpXYCoordinate);
						}
					});
				}
			}
		});

		return coordinate;
	}

	_getXAndY(rawCoordinate){
        let guessCoordinate = rawCoordinate.split(' ');
        let xy = [];

        if(guessCoordinate.length === 2 && !isNaN(Number(guessCoordinate[0])) && !isNaN(Number(guessCoordinate[1]))){
            xy.push(Number(guessCoordinate[0]));
            xy.push(Number(guessCoordinate[1]));
        }
        return xy;
	}

	_getCoordinateType(coordinate){
		let coordinateTypes = ['point', 'linestring', 'polygon'];
		let type = '';

		_.forEach(coordinateTypes, (coordinateType)=>{
			if(coordinate.toLowerCase().includes(coordinateType)){
				type = coordinateType;
			}
		});

		return type;
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