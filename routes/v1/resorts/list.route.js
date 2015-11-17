/* jshint node:true */

var Joi = require('joi'),
    path = require('path'),
    Boom = require('boom'),
    a = require('async'),
    phrases = require('../../../phrases.json');

var ListResorts = {
    method: 'GET',
    config: {
        description: 'List All Resorts',
        validate: {
            query: Joi.object().keys({
                lng: Joi.number().description('the current lng of the user'),
                lat: Joi.number().description('he current lat of the user'),
                limit: Joi.number().default(50).description('max number of results'),
                distance: Joi.number().description('distance from the user to look in meeters')
            })
        }
    },
    handler: function(request, reply) {
        var weather = request.server.methods.weather;
        var resortAPI = request.server.methods.resort;
        var db = request.server.plugins['hapi-mongodb'].db;
        var collection  = db.collection("resorts");
        var query = {
            type: "NA_Alpine"
        };

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
                            seasonTotal: resortDetails.seasonTotal,
                            status: resortDetails.resortStatus
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

            function phraseGenerator(resorts, done) {
                a.forEachOf(resorts, function(resort, i, next) {
                    //resorts[i].
                    var weatherScore = 0;
                    var NewSnow = 0;
                    var weatherType = resort.currentWeather.summary;
                    var temp = resort.currentWeather.apparentTemperature;
                    var wind = resort.currentWeather.windSpeed;
                    var depth = resort.avgBaseDepthMin;

                    if(depth < 2) {
                        weatherScore -= 100;
                    }

                    switch(true) {
                        case (wind < 20):
                            //Alot
                            weatherScore += 1
                        break;
                        case (wind < 10):
                            // Little
                            weatherScore += 2
                        break;
                        case (wind < 5):
                            // Little
                            weatherScore += 3
                        break;
                    }

                    switch(true) {
                        case (temp < 32 && temp > 15):
                            //Alot
                            weatherScore += 3
                        break;
                        case (temp > 35):
                            // Little
                            weatherScore -= 4
                        break;
                        case (temp < 15):
                            // Little
                            weatherScore -= 4
                        break;
                    }

                    switch(true) {
                        case (NewSnow > 10):
                            //Alot
                            weatherScore += 3
                        break;
                        case (NewSnow > 5):
                            // Little
                            weatherScore += 2
                        break;
                        default:
                            // none
                            weatherScore += 1
                        break;
                    }

                    switch(weatherType) {
                        case 'clear-day':
                        case 'clear-night':
                        case 'snow':
                            // Good
                            weatherScore += 3
                        break;
                        case "sleet":
                        case "wind":
                        case "fog":
                        case "rain":
                            // Bad
                            weatherScore += 2
                        break;
                        default:
                            // Decent
                            weatherScore += 1
                        break;
                    }

                    if(weatherScore < 0) {
                        weatherScore = 0;
                    }

                    if(weatherScore > 9) {
                        weatherScore = 9;
                    }

                    if(phrases[weatherScore]) {
                        resorts[i].phrase = phrases[weatherScore][Math.floor(Math.random() * phrases[weatherScore].length)];
                    } else {
                        console.log(`You need a phrase for when scores are $weatherScore`);
                    }

                    return next();

                }, function(err) {
                    if( err ) return done(Boom.badImplementation());

                    done(null, resorts);
                });
            }
        ], function(err, resorts) {

            return reply(err || resorts);
        });
    }
};

module.exports = ListResorts;
