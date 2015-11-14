/* jshint node:true */

var Joi = require('joi'),
    path = require('path'),
    Boom = require('boom');

var GetForcast = {
    method: 'GET',
    config: {
        description: 'Get Weather Forcast',
        validate: {
            query: Joi.object().keys({
                lng: Joi.number().description('the id for the user'),
                lat: Joi.number().description('the id for the user')
            })
        }
    },
    handler: function(request, reply) {
        var weather = request.server.methods.weather;

        weather.forcast(request.query.lat, request.query.lng, reply);
    }
};

module.exports = GetForcast;
