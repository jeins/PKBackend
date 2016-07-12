import geoConf from '../constants/GeoserverConfig';
import dbConf from '../constants/DatabaseConfig';
import _ from 'lodash';

module.exports = class XmlBuilder{

	static dataStore(workspaceName, dataStoreName){
		var restUrl = geoConf.rest.host + ':' + geoConf.rest.port + '/geoserver/rest';

		return '\
            <dataStore>\
              <name>'+ dataStoreName +'</name>\
              <type>'+ geoConf.datastore_type +'</type>\
              <enabled>true</enabled>\
              <workspace>\
                <name>'+ workspaceName +'</name>\
                <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate"\
                href="'+ restUrl + '/workspaces/'+ workspaceName + '.xml"\
                type="application/xml"/>\
              </workspace>\
              <connectionParameters>\
                <entry key="port">5432</entry>\
                <entry key="user">' + dbConf.development.username + '</entry>\
                <entry key="passwd">' + dbConf.development.password + '</entry>\
                <entry key="dbtype">postgis</entry>\
                <entry key="host">' + dbConf.development.host + '</entry>\
                <entry key="database">' + dbConf.development.db_geo + '</entry>\
                <entry key="schema">public</entry>\
              </connectionParameters>\
              <__default>false</__default>\
            </dataStore>\
        ';
	}

	static layerGroup(workspaceName, layerGroupName, layerCollection){
		var restUrl = geoConf.rest.host + ':' + geoConf.rest.port + '/geoConf/rest';

		var layerGroup = '<layerGroup>\
                        <name>' + layerGroupName + '</name>\
                        <workspace>\
                            <name>' + workspaceName + '</name>\
                            <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate"\
                            href="' + restUrl + '/workspaces/' + workspaceName + '.xml"\
                            type="application/xml"/>\
                        </workspace>\
		                <layers>';

        _(layerCollection).forEach((layer)=>{
            layerGroup += '<layer>' + layer + '</layer>';
        });

        layerGroup += '</layers></layerGroup>';

        return layerGroup;
	}

	static featureType(featureTypeName){
		return '<featureType><name>' + featureTypeName + '</name></featureType>';
	}
}