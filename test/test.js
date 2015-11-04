const dotenv = require('dotenv');
dotenv.load()

var api, assert, database;
assert = require("assert");
api = require("../util/api");
database = require('../util/database_interface');

describe('API', function() {
  before(function(done) {
    return database.connect(function(err, connection) {
      api.setConnection(connection);
      return done(err);
    });
  });
  describe('get all resorts', function() {
    return it("should find all the resorts", function(done) {
      return api.getAllResorts(function(data) {
        assert.equal(data.data.length, 508);
        return done();
      });
    });
  });
  describe('weather info', function() {
    it("should find weather info", function(done) {
      return api.getWeatherInfoFromId(508002, function(err, data) {
        assert.equal(data.productionCenter, "Taunton, MA");
        return done(err);
      });
    });
    return it("should not find weather info", function(done) {
      return api.getWeatherInfoFromId(2, function(err, data) {
        assert.equal(err.data, "no resorts found with an id of 2");
        return done();
      });
    });
  });
  describe('findNear()', function() {
    it("should find 7 resorts", function(done) {
      return api.findNear(-71.400, 41.8322, 2, 1, function(data) {
        assert.equal(data.data.length, 2);
        return done();
      });
    });
    it("should find 20 resorts", function(done) {
      return api.findNear(-71.400, 41.8322, 20, 5, function(data) {
        assert.equal(data.data.length, 20);
        return done();
      });
    });
    it("should find 2 resorts", function(done) {
      return api.findNear(-71.400, 41.8322, 2, 1, function(data) {
        assert.equal(data.data.length, 2);
        return done();
      });
    });
    return it("should find 2 resorts", function(done) {
      return api.findNear(-122.419415, 37.77493, 2, 1, function(data) {
        assert.equal(data.data.length, 2);
        return done();
      });
    });
  });
  describe('get info from ids', function() {
    return it("should add info for resorts", function(done) {
      return api.getWeatherAndResortInfoFromIds([
        {
          id: 801010
        }, {
          id: 508002
        }
      ], function(data) {
        return done();
      });
    });
  });
  return describe('Get Resort Info', function() {
    return it("should find one resort", function(done) {
      return api.getResortDataById("801010", function(err, data) {
        assert.equal(data.items.length, 1);
        return done(err);
      });
    });
  });
});
