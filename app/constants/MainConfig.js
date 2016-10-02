module.exports = {
    server: {
        DEV: {
            db: 'development',
            host: 'localhost',
            port: '8888'
        }
    },
    sha256: {secret: 'P3T4kAM1!!!...' },
    token: {secret: 'test123needbechange'},
    application: {
        tmpFolder: './tmp_files/',
    },
    whiteListUri: [
        '/user/authenticate', '/user/register', '/user/active',
        '/workspace/all', '/layer/:workspace/:layers/bylayer/geojson'
    ]
};