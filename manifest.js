var manifest = {
    server: {
        cache: 'catbox-memory'
    },
    connections: [
        {
            port: process.env.PORT || 8000,
            labels: ['api']
        }
    ],
    plugins: [
        {'inert': null},
        {'hapi-route-manager': {
            directory: './routes'
        }},
        {'./plugins/weather.js': null},
        {'./plugins/resort.js': null},
        {'hapi-mongodb': {
            "url": process.env.MONGO_URL || "mongodb://localhost:27017/test",
            "settings": {
                "db": {
                    "native_parser": true
                }
            }
        }}

    ]
};
module.exports = manifest;
