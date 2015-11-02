var snocountry  = require('snocountry');
var weathers    = require('weathers');

var weatherCache  = {};
var locationCache = {};

/**
* fetches the weather info fomr the given lat long
**/
function addWeatherInfo(_data, err, cb) {
  if (err) {
    cb(err, _data);
  } else {
    var lat = _data["items"][0].latitude
    var lng = _data["items"][0].longitude
    if (weatherCache[lat+""+lng] == undefined) {
      weathers.getWeather(lat, lng, function(err, data) {
        if (!err) {
          _data["items"][0].weather = data;
          weatherCache[lat+""+lng] = data;
        }
        cb(err, _data);
      });
    } else {
      _data["items"][0].weather = weatherCache[lat+""+lng];
      cb(err, _data);
    }
  }
}

/**
* fetches the resort info from the id passed
**/
function getResortDataById(id, cb) {
  if (locationCache[id] == undefined) {
    snocountry.getResortsByIds(id, function(err, data) {
      if (!err) {
        locationCache[id] = data;
      }
      addWeatherInfo(data, err, cb)
    });
  } else {
    addWeatherInfo(locationCache[id], null, cb)
  }
}

module.exports = {
  getResortDataById: getResortDataById
}