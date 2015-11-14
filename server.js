const dotenv = require('dotenv');
dotenv.load();

const Glue = require('glue');
const colors = require('colors');
const Inert = require('inert');
const manifest = require('./manifest.js')

var options = {
    relativeTo: __dirname
};

Glue.compose(manifest, options, function (err, server) {
    if (err) throw err;

    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            directory: {
                path: './public',
                listing: false,
                index: true
            }
        }
    });


    server.start(function () {
        console.log('Started server on port:'.green, server.info.port);
    });
});
