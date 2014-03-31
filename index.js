var Hapi = require("hapi");
var APP = {};
APP.PORT = process.env.PORT || 5000;


var dbOpts = {
    "url": "mongodb://localhost:27017/test",
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
    "path"    : "/data/{id}",
    "handler" : getData
},{
    "method"  : "POST",
    "path"    : "/data/{id}",
    "handler" : postData
},{
    "method"  : "GET",
    "path"    : "/test/{id}",
    "handler" : testRoute
}]);

function usersHandler(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    db.collection('users').findOne({  "_id" : new ObjectID(request.params.id) }, function(err, result) {
        if (err) return reply(Hapi.error.internal('Internal MongoDB error', err));
        reply(result);
    });
};

function postData (request, reply) {

}

//Return all data in the colleciton
function getData (request, reply) {

};

function testRoute (request, reply) {
    return reply({data: "Testing..." + parseInt(request.params.id,10)}).type('application/json').code(200);
};

server.start(function() {
    console.log("Server started at " + server.info.uri);
});
