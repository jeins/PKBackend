module.exports = {
    rest: {
        host: 'localhost',
        port: 8080,
        username: 'admin',
        password: 'geoserver',
        datastore_type: 'PostGIS'
    },
    workspaces: {
        IDBangunan: ['Point', 'LineString', 'Polygon'],
        IDTransportasi: ['LineString'],
        IDHipsografi: ['Point', 'LineString'],
        IDBatasDaerah: ['LineString', 'Polygon'],
        IDTutupanLahan: ['LineString', 'Polygon'],
        IDHydrografi: ['Point', 'LineString', 'Polygon'],
        IDToponomi: ['Point']
    },
    geometry_type: {
        point: 'point',
        linestring: 'linestring',
        polygon: 'polygon'
    },
    geometry_4326: {
        point: 'geometry(Point,4326)',
        linestring: 'geometry(LineString,4326)',
        polygon: 'geometry(Polygon,4326)'
    }
};