var database      = require('../util/database_interface');
var controllers   = require('../controllers/controllers');
var moment        = require('moment');
var util          = require('../util/util');
var api           = require('../util/api');
var coreUtil      = require('util');

database.connect(function(err, connection) {
  api.setConnection(connection)
});

exports.set = function(app) {
  app.get('/', function(req, res) {
    res.render('marketing', {
      session: req.session,
      rootClass: "marketing"
    })
  });

  app.route('/api/all_resorts').get(function(req, res) {
    api.getAllResorts(function(data) {
      res.jsonp(data);
    });
  });


  app.route("/api/near/:lng/:lat/:count").get(function(req, res) {
    api.findNear(req.params.lng, req.params.lat, req.params.count, null, function(data) {
      res.jsonp(data);
    });
  });

  app.route("/api/near/:lng/:lat/:count/:distance").get(function(req, res) {
    api.findNear(req.params.lng, req.params.lat, req.params.count, req.params.distance, function(data) {
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
