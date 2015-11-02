assert          = require "assert"
api             = require "../util/api"
database        = require '../util/database_interface'


describe 'API', ->
  before (done) ->
    database.connect (err, connection) ->
      api.setConnection connection
      done err

  describe 'get all resorts', ->
    it "should find all the resorts", (done) ->
      api.getAllResorts (data) ->
        assert.equal data.data.length, 509
        done()

  describe 'weather info', ->
    it "should find weather info", (done) ->
      api.getWeatherInfoFromId 508002, (err, data) ->
        assert.equal data.productionCenter, "Taunton, MA"
        done(err)

    it "should not find weather info", (done) ->
      api.getWeatherInfoFromId 2, (err, data) ->
        assert.equal err.data, "no resorts found with an id of 2"
        done()

  describe 'findNear()', ->
    it "should find 7 resorts", (done) ->
      api.findNear -71.400, 41.8322, 2, 1, (data) ->
        assert.equal data.data.length, 2
        done()

    it "should find 20 resorts", (done) ->
      api.findNear -71.400, 41.8322, 20, 5, (data) ->
        assert.equal data.data.length, 20
        done()

    it "should find 2 resorts", (done) ->
      api.findNear -71.400, 41.8322, 2, 1, (data) ->
        assert.equal data.data.length, 2
        done()

    it "should find 2 resorts", (done) ->
      api.findNear -122.419415, 37.77493, 2, 1, (data) ->
        assert.equal data.data.length, 2
        done()

  describe 'get info from ids', ->
    it "should add info for resorts", (done) ->
      api.getWeatherAndResortInfoFromIds [{id: 801010}, {id: 508002}], (data) ->
        done()

  describe 'Get Resort Info', ->
    it "should find one resort", (done) ->
      api.getResortDataById "801010", (err, data) ->
        assert.equal data.items.length, 1
        done err