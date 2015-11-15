/* jshint node:true */

var Joi = require('joi'),
    path = require('path'),
    Boom = require('boom');

var GetForcast = {
    method: 'GET',
    config: {
        description: 'Get Weather Forcast',
        validate: {
            query: {
                resort: Joi.number().required().description('the id for the resort')
            }
        }
    },
    handler: function(request, reply) {
        var weather = request.server.methods.weather;
        var db = request.server.plugins['hapi-mongodb'].db;
        var collection  = db.collection("resorts");
        var query = {};

        collection.findOne({id: request.query.resort}, function(err, resort) {
            if(err) return done(Boom.badImplamentation());
            console.log(resort)

            weather.forcast(resort.location[1], resort.location[0], reply);
        });
    }
};

module.exports = GetForcast;
