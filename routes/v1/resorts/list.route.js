/* jshint node:true */

var Joi = require('joi'),
    path = require('path'),
    Boom = require('boom'),
    a = require('async'),
    objectExtend = require('object-extend');
;

var ListResorts = {
    method: 'GET',
    config: {
        description: 'List All Resorts',
        validate: {
            query: Joi.object().keys({
                lng: Joi.number().description('the id for the user'),
                lat: Joi.number().description('the id for the user'),
                limit: Joi.number().default(50).description('the id for the user'),
                distance: Joi.number().description('the id for the user')

            })
        }
    },
    handler: function(request, reply) {
        var weather = request.server.methods.weather;
        var resortAPI = request.server.methods.resort;
        var db = request.server.plugins['hapi-mongodb'].db;
        var collection  = db.collection("resorts");
        var query = {};

        if(request.query.distance) {
            query.location = {
                '$nearSphere': [request.query.lng, request.query.lat],
                '$maxDistance': request.query.distance > 50 ? 50 : request.query.distance
            }
        }

        a.waterfall([
            function loadResortsFromDB(done) {
                collection.find(query).limit(request.query.limit).toArray(function(err, docs) {
                    if(err) return done(Boom.badImplamentation());

                    done(null, docs);
                });
            },

            function addWeatherData(resorts, done) {
                a.forEachOf(resorts, function(resort, i, next) {
                    weather.forcast(resort.location[1], resort.location[0], function(err, weather) {
                        resorts[i].weather = weather;
                        return next(err);
                    });
                }, function(err) {
                    if( err ) return done(Boom.badImplementation());

                    done(null, resorts);
                });
            },

            function addResortDetails(resorts, done) {
                a.forEachOf(resorts, function(resort, i, next) {
                    resortAPI.details(resort.id, function(err, resortDetails) {
                        objectExtend(resorts[i], resortDetails.items[0]);
                        return next(err);
                    })
                }, function(err) {
                    if( err ) return done(Boom.badImplementation());

                    done(resorts);
                });
            }
        ], function(err, resorts) {

            return reply(err || resorts);
        });
    }
};

module.exports = ListResorts;
