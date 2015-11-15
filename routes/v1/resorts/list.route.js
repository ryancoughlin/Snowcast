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

            function addResortDetails(resorts, done) {
                var resortIDs = Object.keys(resorts).map(function(i){
                    return resorts[i].id
                });

                resortAPI.details(resortIDs.join(','), function(err, detailsForResorts) {
                    if( err ) return done(Boom.badImplementation());

                    a.forEachOf(detailsForResorts.items, function(resortDetails, i, next) {

                        if(!resortDetails) {
                            console.log(`${resort.id} no longer exists`);
                            resorts[i] = {
                                id: resort.id
                            }
                            return next();
                        }

                        resorts[i] = {
                            id: resortDetails.id,
                            location: resorts[i].location,
                            name: resortDetails.name,
                            type: resortDetails.type,
                            reportDateTime: resortDetails.reportDateTime,
                            primarySurfaceCondition: resortDetails.primarySurfaceCondition,
                            phrase: "Powder day!",
                            avgBaseDepthMax: resortDetails.avgBaseDepthMax,
                            avgBaseDepthMin: resortDetails.avgBaseDepthMin,
                            snowLast48Hours: resortDetails.snowLast48Hours,
                            maxOpenDownHillTrails: resortDetails.maxOpenDownHillTrails,
                            maxOpenDownHillMiles: resortDetails.maxOpenDownHillMiles,
                            maxOpenDownHillAcres: resortDetails.maxOpenDownHillAcres,
                            maxOpenDownHillLifts: resortDetails.maxOpenDownHillLifts,
                            openDownHillTrails: resortDetails.openDownHillTrails,
                            openDownHillLifts: resortDetails.openDownHillLifts,
                            openDownHillMiles: resortDetails.openDownHillMiles,
                            openDownHillAcres: resortDetails.openDownHillAcres,
                            openDownHillPercent: resortDetails.openDownHillPercent,
                            seasonTotal: resortDetails.seasonTotal
                        }

                        return next(err);

                    }, function(err) {
                        if( err ) return done(Boom.badImplementation());

                        done(null, resorts);
                    });
                });
            },

            function addWeatherData(resorts, done) {
                a.forEachOf(resorts, function(resort, i, next) {
                    weather.current(resort.location[1], resort.location[0], function(err, weather) {
                        resorts[i].currentWeather = weather.currently;
                        delete resorts[i].location;
                        return next(err);
                    });
                }, function(err) {
                    if( err ) return done(Boom.badImplementation());

                    done(null, resorts);
                });
            },
        ], function(err, resorts) {

            return reply(err || resorts);
        });
    }
};

module.exports = ListResorts;
