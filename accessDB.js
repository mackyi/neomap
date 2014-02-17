// Module dependencies
var mongoose = require('mongoose');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');



var Location = require('./models/location')(db);

var MongoLocation = require('./models/mongo-location').Location;


// connect to database
module.exports = {

  addLocation: function(location, cb){
    console.log('add location')
    //MongoLocation.create(location, cb);
    Location.create(location, cb);
  },

  getAllLocations: function(cb){
    //MongoLocation.find({}, cb);
    Location.getAll(cb);
  },

  addRoute: function(route, cb){
    Location.createRoute(route, cb);
  },

  getAllRoutes: function(cb){
    //MongoLocation.find({}, cb);
    Location.getAllRoutes(cb);
  },

  findTraversal: function(data, cb){
    console.log('find traversal accessDB')
    Location.findTraversal(data.start, data.end, cb);
  },

  startup: function(dbToUse) {
    mongoose.connect(dbToUse);
    // Check connection to mongoDB
    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    }); 

  },
  // disconnect from database
  closeDB: function() {
    mongoose.disconnect();
  },
}