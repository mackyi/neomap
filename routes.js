var db = require('./accessDB'),
  restler = require('restler');


module.exports = function(app){
	app.get('/', function(req, res) {
		//res.redirect('/index.html');
		//res.render('index');
		res.sendfile('./client/public/index.html');
		//res.render('home');
	})

	app.post('/api/newLocation', function(req, res){
		db.addLocation(req.body, function(err, node){
			res.send(node);
		});
	})

	app.get('/api/getAllLocations', function(req, res){
		db.getAllLocations(function(err, nodes){
			res.send(nodes);
		})
	})

	app.post('/api/newRoute', function(req, res){
		db.addRoute(req.body, function(err, node){
			res.send(node);
		});
	})

	app.get('/api/getAllRoutes', function(req, res){
		db.getAllRoutes(function(err, nodes){
			if(err) console.log(err)
			res.send(nodes);
		})
	})

	app.post('/api/navigate', function(req,res){
		db.findTraversal(req.body, function(err, nodes){
			console.log(nodes);
			if(err) console.log(err)
			res.send(nodes);
		})
	})

}
