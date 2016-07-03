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
    whiteListUri: [
        '/user/authenticate', '/user/register', '/user/active'
    ]
};