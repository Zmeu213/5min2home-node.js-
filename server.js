//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var pg = require('pg');
var conString = "postgres://app_rw:samplepass@localhost/prod";

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("5min2home server listening at", addr.address + ":" + addr.port);
});

//QUERY FUNCTIONS

function custom_insert (f, src_lng, src_lat, dst_lng, dst_lat, user_id) {
    // Copy paramters into query string und create new pg.client.query

    var client = new pg.Client(conString);
    client.connect();
    console.log("INSERT with params was called with query");
    console.log("INSERT INTO orders VALUES (" + user_id + ", point(" + src_lng + ", " + src_lat + 
        "), point(" + dst_lng + ", " + dst_lat + ") );");
    var func_query = client.query("INSERT INTO orders VALUES ( " + user_id + ", point(" + src_lng + ", " + src_lat + 
        "), point(" + dst_lng + ", " + dst_lat + ") );", function(err, result) {
        console.log("Error: " + err);
        if(!err) 
            var status = {"satus": "succes"}
        else
            var status = {"satus": "fail"};
        f(status)
        client.end();
    });
};

function custom_select1(f){
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT * was called");
    var func_query = client.query("SELECT * FROM orders;", function(err, result) {
        console.log(result);
        f(result.rows)
        client.end();
    });
};

function custom_select_src(f, lng, lat, rad) {
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT with params was called with query");
    console.log("SELECT src FROM orders WHERE (src <@ circle (("+lng+", "+lat+"),"+rad+");");
    var func_query = client.query("SELECT src FROM orders WHERE src <@ circle '(("+
                                    lng+", "+lat+"),"+rad+")';", function(err, result) {
        console.log("Error: " + err);
        f(result.rows)
        client.end();
    });
}

function custom_select_dst(f, lng, lat, rad) {
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT with params was called with query");
    console.log("SELECT dst FROM orders WHERE (dst <@ circle (("+lng+", "+lat+"),"+rad+");");
    var func_query = client.query("SELECT dst FROM orders WHERE dst <@ circle '(("+
                                    lng+", "+lat+"),"+rad+")';", function(err, result) {
        console.log("Error: " + err);
        f(result.rows)
        client.end();
    });
}

function custom_select_id_from_src(f, lng, lat, rad) {
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT with params was called with query");
    console.log("SELECT user_id FROM orders WHERE (src <@ circle (("+lng+", "+lat+"),"+rad+");");
    var func_query = client.query("SELECT user_id FROM orders WHERE src <@ circle '(("+
                                    lng+", "+lat+"),"+rad+")';", function(err, result) {
        console.log("Error: " + err);
        f(result.rows)
        client.end();
    });
}

function custom_select_dst_from_id(f, id) {
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT with params was called with query");
    console.log("SELECT dst FROM orders WHERE user_id = "+ id+ ";");
    var func_query = client.query("SELECT dst FROM orders WHERE user_id = "+ id+ ";",
     function(err, result) {
        console.log("Error: " + err);
        f(result.rows)
        client.end();
    });
}

function custom_select_src_from_id(f, id) {
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT with params was called with query");
    console.log("SELECT src FROM orders WHERE user_id = "+ id+ ";");
    var func_query = client.query("SELECT src FROM orders WHERE user_id = "+ id+ ";",
     function(err, result) {
        console.log("Error: " + err);
        f(result.rows)
        client.end();
    });
}

//REST API 

var restify = require('restify');

function respond(req, res, next) {
    res.send({'hello ': req.params.name});
    next();
};

function respond_select(req, res, next) {
    custom_select1((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    })
};

function respond_select_params_src(req, res, next) {
    custom_select_src((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    }, req.params.lat, req.params.lng, req.params.rad);
    console.log(req.params.lng, req.params.lat, req.params.rad);
};

function respond_select_params_dst(req, res, next) {
    custom_select_dst((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    }, req.params.lat, req.params.lng, req.params.rad);
    console.log(req.params.lng, req.params.lat, req.params.rad);
};

function respond_select_params_id_from_src(req, res, next) {
    custom_select_id_from_src((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    }, req.params.lng, req.params.lat, req.params.rad);
    console.log(req.params.lng, req.params.lat, req.params.rad);
};

function respond_select_params_dst_from_id(req, res, next) {
    custom_select_dst_from_id((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    }, req.params.id);
};

function respond_select_params_src_from_id(req, res, next) {
    custom_select_src_from_id((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    }, req.params.id);
};

function respond_insert(req,res, next) {
    custom_insert((t) => {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(t);
        next();
    }, req.params.src_lng, req.params.src_lat, req.params.dst_lng, req.params.dst_lat, req.params.user_id);
};

var server_api = restify.createServer();
server_api.get('/hello/:name', respond);
server_api.head('/hello/:name', respond);

server_api.get('/api/select', respond_select);
server_api.get('/api/select/src/:lng/:lat/:rad', respond_select_params_src);
server_api.get('/api/select/dst/:lng/:lat/:rad', respond_select_params_dst);
server_api.get('/api/select/id/:lng/:lat/:rad' , respond_select_params_id_from_src );
server_api.get('/api/select/dst_from_id/:id'   , respond_select_params_dst_from_id );
server_api.get('/api/select/src_from_id/:id'   , respond_select_params_src_from_id );
server_api.get('/api/insert/:src_lng/:src_lat/:dst_lng/:dst_lat/:user_id', respond_insert);

server_api.listen(8081, function() {
  console.log('%s listening at %s', server_api.name, server_api.url);
});
