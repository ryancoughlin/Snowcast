var mongoose        = require('mongodb');
var colors          = require('colors');
var MongoClient     = require('mongodb').MongoClient;
var connection;

function connect(cb) {
  MongoClient.connect(process.env.DB, function(err, db) {
    if(!err) {
      connection = db;
      console.log("* DB: Connected".green);
      ensureIndex(cb);
    } else {
      console.log(err);
      console.log("* DB: Error opening DB Connection".red);
      cb(err);
    }
  });
}

function ensureIndex(cb) {
  connection.ensureIndex('resorts', {location: '2d'}, function(err, data) {
    if (err) {
      console.log("* DB: ERROR ".red + err);
      cb(err);
    } else {
      console.log("* DB: Geo Index Ensured".green);
      cb(err, connection);
    }
  });
}

exports.connect = connect
