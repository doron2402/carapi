var Hapi = require("hapi");
var APP = {};
APP.PORT = process.env.PORT || 5000;

var dbOpts = {
    "url": process.env['MONGOHQ_URL'] ? process.env['MONGOHQ_URL'] : "mongodb://localhost:27017/test",
    "options": {
        "db": {
            "native_parser": false
        }
    }
};
var server = new Hapi.Server(APP.PORT);

server.pack.require('hapi-mongodb', dbOpts, function(err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

server.route( [{
    "method"  : "GET",
    "path"    : "/data/get",
    "handler" : getData
},{
    "method"  : "POST",
    "path"    : "/data/post",
    "handler" : postData
},{
    "method"  : "GET",
    "path"    : "/test/get/{id}",
    "handler" : testRoute
},{
    "method"  : "GET",
    "path"    : "/cars/data/{id}",
    "handler" : getDataById
},{
   "method"  : "DELETE",
    "path"    : "/data/del/all",
    "handler" : deleteAll
},{
    "method"  : "DELETE",
    "path"    : "/cars/data/{id}",
    "handler" : deleteById
}]);

function deleteById (request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var carId = parseInt(request.params.id,10);
    var collection = db.collection('data');
    collection.remove({carId: carId}, {w:1}, function(err, result) {
        if (err) {
            return reply({data: err});
        }

        return reply({data: result});
    });
};

function getDataById (request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var carId = parseInt(request.params.id,10);
    var collection = db
      .collection('data')
      .find({carId: carId})
      .toArray(function(err, docs) {
        console.dir(docs);
        return reply({data: docs});
    });
};

function deleteAll (request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    db.collection("data").remove({},function(err,numberRemoved){

        console.log("inside remove call back" + numberRemoved);
        return reply({code: 'OK', data: numberRemoved});
    });
};

function usersHandler(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    db.collection('data').findOne({  "_id" : new ObjectID(request.params.id) }, function(err, result) {
        if (err) {
            return reply(Hapi.error.internal('Internal MongoDB error', err));
        }

        return reply(result);
    });
};

function postData (request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    console.error(request.payload);
    var collection = db.collection('data');
    collection.insert(request.payload, function(err, docs) {
        reply({docs: docs, code: "OK"});
    });

};

//Return all data in the colleciton
function getData (request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('data').find().toArray(function(err, results) {
        if (err)
            console.error(err);

        reply({docs: results, code:'OK'});
        // Let's close the db
        //db.close();
      });
};

function testRoute (request, reply) {
    return reply({data: "Testing..." + parseInt(request.params.id,10)}).type('application/json').code(200);
};

server.start(function() {
    console.log("Server started at " + server.info.uri);
});
