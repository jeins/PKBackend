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
    gmail_account: {
        email: 'petakami@gmail.com',
        password: 'P3t4K4M1!'
    },
    emailActivationUri: 'http://localhost:9000/#/active/',
    whiteListUri: [
        '/user/authenticate', '/user/register', '/user/active',
        '/workspace/all', '/layer/:workspace/:layers/bylayer/geojson'
    ]
};