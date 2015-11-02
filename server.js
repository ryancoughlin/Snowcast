var port          = process.env.PORT || 9999;
var express       = require("express");
var app           = express();
var http          = require("http");
var webServer     = http.createServer(app);
var colors        = require("colors");
var clientId      = process.env.SINGLY_CLIENT_ID;
var clientSecret  = process.env.SINGLY_CLIENT_SECRET;
var hostBaseUrl   = (process.env.HOST || 'http://localhost:' + port + "/loc/916002"); //singly being dumb
var apiBaseUrl    = process.env.SINGLY_API_HOST || 'https://api.singly.com';
var expressSingly = require('express-singly')(app, clientId, clientSecret, hostBaseUrl, hostBaseUrl + '/callback');

app.configure(function() {
  app.use(express.static(__dirname+"/public"));
  app.use(express.bodyParser());
  app.use(express.cookieParser(process.env.COOKIE_SECRET || "zip zap foo"));
  app.use(express.session({'cookie':{'maxAge':604800000}, 'secret': process.env.COOKIE_SECRET || "zip zap foo"}));
  app.set("view engine", "jade");
  app.set('views', __dirname + '/views');
  expressSingly.configuration();
});



require("./router/routes").set(app);

expressSingly.routes();

webServer.listen(port);
console.log("Started server on port:".green, port);