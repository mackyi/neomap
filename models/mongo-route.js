var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId

var collection = 'routes';

var routeSchema = new Schema({
	name: String,
	type: String,
	startLocation: ObjectId,
	endLocation: ObjectId,
	polyline: String
});

module.exports = {
	Route: mongoose.model(collection, routeSchema),
	RouteSchema: routeSchema
}