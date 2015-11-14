const snocountry = require('snocountry');

exports.register = function (server, options, next) {
    server.method('resort.details', function(id, next) {
        snocountry.getResortsByIds(id, function(err, data) {
            next(err, data);
        });
    }, {
        cache: {
            generateTimeout: false,
            expiresAt: '12:00'
        }
    });
    return next();
};

exports.register.attributes = {
    name: 'resort-methods',
    version: '1.0.0'
};
