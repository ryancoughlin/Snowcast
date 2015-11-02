var _               = require('underscore');
var snocountry      = require('snocountry');
var Forecast        = require('forecast.io');
var weatherCache    = {};
var locationCache   = {};
var cachedLocation  = {};
var dbConnection;
var options = {
  APIKey: process.env.FORECAST_API_KEY,
  timeout: 1000
};

function setConnection(connection) {
  dbConnection = connection;
}

function getAllResorts(cb) {
  var collection  = dbConnection.collection("resorts");
  console.log("all resorts")
  collection.find().toArray(function(err, docs) {
    cb({
        status: "ok",
        data: docs
      });
  });
}

function findNear(lng, lat, limit, distance, cb) {
  var collection  = dbConnection.collection("resorts");
  var distance    = distance || 1; //in degrees
  var limit       = limit || 50;
  var key         = lng+"-"+lat+"-"+distance+"-"+limit
  if (cachedLocation[key] != undefined) {
    addWeatherInfoToCollection(cachedLocation[key], function(data) {
      addResortDataToCollection(data, cb);
    });
  } else {

    var query = {
      location: {
        $nearSphere: [parseFloat(lng), parseFloat(lat)],
        $maxDistance: 50
      }
    }

    collection.find(query).limit(+limit).toArray(function(err, docs) {
      if(err) {
        cb({
          status: "error",
          data: err
        })
      } else {
        cachedLocation[key] = docs;
        addWeatherInfoToCollection(docs, function(data) {
          addResortDataToCollection(data, cb);
        });
      }
    });
  }
}

function getWeatherAndResortInfoFromIds(resorts, cb) {
  addWeatherInfoToCollection(resorts, function(data) {
    addResortDataToCollection(data, cb);
  });
}

function addWeatherInfoToCollection(docs, cb) {
  var steps = docs.length;
  _.each(docs, function(val) {
    getWeatherInfoFromId(val.id, function(err, data) {
      val.weather = data;
      !(--steps) && cb(docs);
    });
  });
}

function addResortDataToCollection(docs, cb) {
  var steps = docs.length;
  _.each(docs, function(val) {
    getResortDataById(val.id, function(err, data) {
      if (err) {
        console.log("* error fetching resort info");
        console.log(data);
      } else {
        val.resortInfo = data;
      }
      if (!--steps) {
        cb({
            status: "ok",
            data: docs
        });
      }
    });
  });
}

function getWeatherInfo(longitude, latitude, cb) {
  var cached = isCached(weatherCache, latitude+""+longitude)

  if (cached) {
    cb(null, cached);
  } else {
    var forecast = new Forecast(options);
    var excludeOptions = {
      exclude: "hourly, minutely, flags, alerts"
    };

    forecast.get(latitude, longitude, excludeOptions, function(err, res, data) {
      if (err) throw err;
      data.cacheTime = (new Date).getTime()
      weatherCache[latitude+""+longitude]  = data;

      cb(err, data);
    });
  }
}

function getWeatherInfoFromId(id, cb) {
  id = parseInt(id, 10);
  var collection  = dbConnection.collection("resorts");
  collection.findOne({id: id}, function(err, docs) {
    if(err) {
      console.log("* error fetching resort weather info".red);
      console.log(err);
      cb(err, docs);
    } else {
      if (docs) {
        console.log(docs)
        getWeatherInfo(docs.location[0], docs.location[1], cb)
      } else {
        cb({
          status: "error",
          data: "no resorts found with an id of "+id
        });
      }
    }
  });
}

function getResortDataById(id, cb) {
  id = +id;
  var cached = isCached(locationCache, id);
  if (cached) {
    cb(null, cached);
  } else {
    snocountry.getResortsByIds(id, function(err, data) {
      if (!err) {
        data.cacheTime = (new Date).getTime()
        locationCache[id] = data;
      }
      cb(err, data);
    });
  }
}

function isCached(store, key) {
  if (store[key] && ((new Date).getTime() - store[key].cacheTime) < 1000 * 60) {
    return store[key];
  }
  return false;
}

exports.getWeatherAndResortInfoFromIds = getWeatherAndResortInfoFromIds;
exports.getAllResorts = getAllResorts
exports.getWeatherInfoFromId = getWeatherInfoFromId;
exports.addWeatherInfoToCollection = addWeatherInfoToCollection;
exports.setConnection = setConnection;
exports.findNear = findNear;
exports.getWeatherInfo = getWeatherInfo;
exports.getResortDataById = getResortDataById;
