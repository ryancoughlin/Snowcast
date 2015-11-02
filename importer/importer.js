var mongoose        = require('mongoose');
var fs              = require('fs');
var db              = mongoose.connection;
var rawData         = JSON.parse(fs.readFileSync('allResorts.js', 'utf8')).items

console.log(rawData);

var resortSchema    = new mongoose.Schema({
  id: Number,
  name: String,
  type: String,
  location: Array
});

var Resort            = mongoose.model("Resort", resortSchema);

mongoose.connect('mongodb://ryancoughlin:lacrosse@ds049354-a0.mongolab.com:49354,ds049354-a1.mongolab.com:49354/snowcast?replicaSet=rs-ds049354');

db.on('error', function(e) {
  console.log("error connecting" + JSON.stringify(e));
});

db.once('open', function() {
  console.log("connection open");
  mongoose.connection.collections['resorts'].drop( function(err) {
    if (!err) {
      console.log('collection dropped');
      saveResorts();
    } else {
      console.log("error")
      console.log(err);
    }
  });
});


function saveResorts() {
  for(var i = 0; i < rawData.length; ++i) {
    (function(i) {
      if (rawData[i].longitude && rawData[i].latitude) {
        (new Resort({
          id: rawData[i].id,
          name: rawData[i].resortName,
          type: rawData[i].resortType,
          location: [parseFloat(rawData[i].longitude),parseFloat(rawData[i].latitude)]
        })).save(function (err) {
          if(err) {
            console.log("ERROR" + JSON.stringify(err));
          } else {
            console.log([parseFloat(rawData[i].longitude), parseFloat(rawData[i].latitude)]);
            if (i == rawData.length -1) {
              process.exit(code=0);
            }
          }
        });
      }
    }(i))
  }
}
