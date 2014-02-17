var neo4j = require('neo4j'),
    async = require('async');
// constants:

var INDEX_NAME = 'nodes';
var INDEX_KEY = 'type';
var INDEX_VAL = 'user';

var ID_INDEX_NAME = 'uuid'
var ID_INDEX_KEY = 'id'

var FOLLOWS_REL = 'follows';

var uuid = require('node-uuid')



// private constructor:

module.exports = function(db){
    var Location = function Location(_node){
        this._node = _node;
    }
    Object.defineProperty(Location.prototype, 'id', {
        get: function () { return this._node.id; }
    });

    Object.defineProperty(Location.prototype, 'exists', {
        get: function () { return this._node.exists; }
    });

    Object.defineProperty(Location.prototype, 'name', {
        get: function () {
            return this._node.data['name'];
        },
        set: function (name) {
            this._node.data['name'] = name;
        }
    });

    // // private instance methods:

    // User.prototype._getFollowingRel = function (other, callback) {
    //     var query = [
    //         'START user=node({userId}), other=node({otherId})',
    //         'OPTIONAL MATCH (user) -[rel:FOLLOWS_REL]-> (other)',
    //         'RETURN rel'
    //     ].join('\n')
    //         .replace('FOLLOWS_REL', FOLLOWS_REL);

    //     var params = {
    //         userId: this.id,
    //         otherId: other.id,
    //     };

    //     db.query(query, params, function (err, results) {
    //         if (err) return callback(err);
    //         var rel = results[0] && results[0]['rel'];
    //         callback(null, rel);
    //     });
    // };

    // public instance methods:

    Location.prototype.save = function (callback) {
        this._node.save(function (err) {
            callback(err);
        });
    };

    Location.prototype.del = function (callback) {
        this._node.del(function (err) {
            callback(err);
        }, true);   // true = yes, force it (delete all relationships)
    };

    // Location.prototype.follow = function (other, callback) {
    //     this._node.createRelationshipTo(other._node, 'follows', {}, function (err, rel) {
    //         callback(err);
    //     });
    // };

    // Locaiton.prototype.unfollow = function (other, callback) {
    //     this._getFollowingRel(other, function (err, rel) {
    //         if (err) return callback(err);
    //         if (!rel) return callback(null);
    //         rel.del(function (err) {
    //             callback(err);
    //         });
    //     });
    // };

    Location.getAllRoutes = function(callback){
        var query = [
            'START r=rel(*)',
            'RETURN r'
        ].join('\n')

        db.query(query, {}, function(err, results){
            if(err) return callback(err);
            console.log('found rels');
            console.log(results);
            callback(err, results);
        })
    };

    Location.findTraversal = function(startId, endId, cb){
        console.log(startId)
        console.log(endId)

        var query = ["START  startNode=node:uuid(id=\""+startId+"\"),",
                        "endNode=node:uuid(id=\""+endId+"\")",
                        "MATCH p=(startNode)-[:connected*1..4]->(endNode)",
                        "RETURN p AS shortestPath,",
                        "reduce(distance=0, r in relationships(p) | distance+r.distance) AS totalDistance",
                        "ORDER BY totalDistance ASC",
                        "LIMIT 3"].join('\n')

        db.query(query, {}, function(err, results){
            if(err) return cb(err);
            console.log('found traversal')
            console.log(results);
            cb(err, results);
        })
        // async.parallel({
        //     start: function(next){
        //         getByUuid(route.startId, next)
        //     },
        //     end: function(next){
        //         getByUuid(route.endId, next)
        //     }
        // }, function(err, results){
        //     console.log(results.start);
        // })
    }
    // // calls callback w/ (err, following, others) where following is an array of
    // // users this user follows, and others is all other users minus him/herself.
    // User.prototype.getFollowingAndOthers = function (callback) {
    //     // query all users and whether we follow each one or not:
    //     var query = [
    //         'START user=node({userId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
    //         'OPTIONAL MATCH (user) -[rel:FOLLOWS_REL]-> (other)',
    //         'RETURN other, COUNT(rel)'  // COUNT(rel) is a hack for 1 or 0
    //     ].join('\n')
    //         .replace('INDEX_NAME', INDEX_NAME)
    //         .replace('INDEX_KEY', INDEX_KEY)
    //         .replace('INDEX_VAL', INDEX_VAL)
    //         .replace('FOLLOWS_REL', FOLLOWS_REL);

    //     var params = {
    //         userId: this.id,
    //     };

    //     var user = this;
    //     db.query(query, params, function (err, results) {
    //         if (err) return callback(err);

    //         var following = [];
    //         var others = [];

    //         for (var i = 0; i < results.length; i++) {
    //             var other = new User(results[i]['other']);
    //             var follows = results[i]['COUNT(rel)'];

    //             if (user.id === other.id) {
    //                 continue;
    //             } else if (follows) {
    //                 following.push(other);
    //             } else {
    //                 others.push(other);
    //             }
    //         }

    //         callback(null, following, others);
    //     });
    // };

    // static methods:

    Location.get = function (id, callback) {
        db.getNodeById(id, function (err, node) {
            if (err) return callback(err);
            callback(null, new Location(node));
        });
    };

    Location.getByUuid = function(id, cb){
        db.getIndexedNode(ID_INDEX_NAME, ID_INDEX_KEY, id, cb);
    }

    Location.createRoute = function(route, cb){
        getByUuid = this.getByUuid;
        console.log(route)
        console.log('creating route');
        console.log(route.startId)
        console.log('polypoints');
        console.log(route.polypoints)
        console.log(JSON.stringify(route.polypoints));
        async.parallel({
            start: function(next){
                getByUuid(route.startId, next)
            },
            end: function(next){
                getByUuid(route.endId, next)
            }
        }, function(err, results){
            console.log(results.start);

            relProps = {
                name: route.name, 
                type: route.type, 
                distance: parseFloat(route.distance), 
                polyPoints: JSON.stringify(route.polyPoints)
            }

            results.start.createRelationshipTo(results.end, 'connected', relProps, function(err, rel){
                results.end.createRelationshipTo(results.start, 'connected', relProps, function(err, back_rel){
                    console.log('rel ' + JSON.stringify(rel));
                    console.log('back rel' + JSON.stringify(back_rel));
                    cb(err, [rel, back_rel]);
                })
            })
        })
        // this.getByUuid(route.startId, function(err, start){
        //     this.getByUuid(route.endId, function(err, end){

        //     })
        // })
    }
    Location.getAll = function (callback) {
        db.getIndexedNodes(INDEX_NAME, INDEX_KEY, INDEX_VAL, function (err, nodes) {
            if (err) {
                // HACK our node index doesn't exist by default on fresh dbs, so
                // check to see if that's the reason for this error.
                // it'd be better to have an explicit way to create this index
                // before running the app, e.g. an "initialize db" script.
                //
                // HACK it's also brittle to be relying on the error's message
                // property. it'd be better if node-neo4j added more semantic
                // properties to errors, e.g. neo4jException or statusCode.
                // https://github.com/thingdom/node-neo4j/issues/73
                //
                if (err.message.match(/Neo4j NotFoundException/i)) {
                    return callback(null, []);
                } else {
                    return callback(err);
                }
            }
            var locations = nodes.map(function (node) {
                return new Location(node);
            });
            callback(null, locations);
        });
    };


    // creates the user and persists (saves) it to the db, incl. indexing it:
    Location.create = function (data, callback) {
        console.log('create');
        data.id = uuid.v1();
        var node = db.createNode(data);
        var loc = new Location(node);
        node.save(function (err) {
            if (err) return callback(err);
            node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function (err) {
                if (err) return callback(err);
                console.log(node);
                console.log(loc);
                console.log(node._data.data.id);
                node.index(ID_INDEX_NAME, ID_INDEX_KEY, node._data.data.id, function(err){
                    if(err) callback(err);
                    console.log("successfully indexed uuid")
                    callback(null, loc);
                })
            });

        });
    };

    return Location;
}
// public instance properties:

