const database      = require('../util/database_interface');
const controllers   = require('../controllers/controllers');
const moment        = require('moment');
const util          = require('../util/util');
const api           = require('../util/api');
const coreUtil      = require('util');
const objectExtend  = require('object-extend');

database.connect(function(err, connection) {
  api.setConnection(connection)
});

exports.set = function(app) {
  app.route('/api/all_resorts').get(function(req, res) {
    api.getAllResorts(function(data) {
      res.jsonp(data);
    });
  });

  app.route("/api/near/").get(function(req, res) {
    const longitude = req.query.longitude
    const latitude = req.query.latitude
    const limit = req.query.limit
    const distance = req.query.distance

    api.findNear(longitude, latitude, +limit, distance, function(data) {
        data.data = data.data.map(function(resort) {
            objectExtend(resort, resort.resortInfo.items[0]);
            delete resort.resortInfo;
            return resort;
        })
      res.jsonp(data);
    });
  });

  app.route("/api/get-resort-info/:id").get(function(req, res) {
    api.getResortDataById(req.params.id, function(err, data) {
      res.jsonp(data);
    });
  });

  app.route("/api/weather-from-id/:id").get(function(req, res) {
    api.getWeatherInfoFromId(req.params.id, function(err, data) {
      if (err) {
        res.jsonp(err);
      } else {
        res.jsonp(data);
      }
    });
  });

  app.route("/api/get-weather-and-resort-info-from-ids/:ids").get(function(req, res) {
    resorts = req.params.ids.split(',').map(function(val){return {id:val}});
    api.getWeatherAndResortInfoFromIds(resorts, function(data) {
      res.jsonp(data);
    });
  });

  app.route("/api/health").get(function(req, res) {
    res.json({
      uptime: process.uptime(),
      memory: coreUtil.inspect(process.memoryUsage())
    });
  });
}
