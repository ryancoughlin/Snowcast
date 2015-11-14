const Forecast = require('forecast.io');

exports.register = function (server, options, done) {

    server.method('weather.forcast', function(lat, lng, next) {
        var forecast = new Forecast({
          APIKey: process.env.FORECAST_API_KEY,
          timeout: 2000
        });

        var excludeOptions = {
          exclude: "hourly, minutely, flags, alerts"
        };

        forecast.get(lat, lng, excludeOptions, function(err, res, data) {
          if (err) return next(err);

          next(null, data);
        });
    }, {
        cache: {
            generateTimeout: false,
            expiresAt: '12:00'
        }
    });
    return done();
};

exports.register.attributes = {
    name: 'weather-methods',
    version: '1.0.0'
};
