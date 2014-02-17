var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId

var collection = 'locations';

var locationSchema = new Schema({
	name: String,
	type: String,
	latitude: Number,
	longitude: Number
});

module.exports = {
	Location: mongoose.model(collection, locationSchema),
	LocationSchema: locationSchema
}