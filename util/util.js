var _             = require('underscore');
var weatherTypes  = require('./weather_types').weatherTypes;


function getWeatherArt(data, _lookingFor) {
  var lookingFor = _lookingFor || data.items[0].weather.currentobservation.Weather;
  var currentKey = "day_sunny"

  _.each(weatherTypes, function(values, key) {
    if (_.filter(values, function(val) { return val == lookingFor}).length) {
      currentKey = key;
    }
  });

  return currentKey;
}

module.exports = {
  getWeatherArt: getWeatherArt,
};