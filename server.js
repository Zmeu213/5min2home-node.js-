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
var conString = "postgres://app_rw:samplepass@localhost/testdb";

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

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("5min2home server listening at", addr.address + ":" + addr.port);
});


function custom_insert (f, src_lng, src_lat, dst_lng, dst_lat, user_id) {
    // Copy paramters into query string und create new pg.client.query

    var client = new pg.Client(conString);
    client.connect();
    console.log("INSERT with params was called with query");
    console.log("INSERT INTO test_from_to VALUES ( point(" + src_lng + ", " + src_lat + 
        "), point(" + dst_lng + ", " + dst_lat + "), " + user_id + ");");
    var func_query = client.query("INSERT INTO test_from_to VALUES ( point(" + src_lng + ", " + src_lat + 
        "), point(" + dst_lng + ", " + dst_lat + "), " + user_id + ");", function(err, result) {
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
    var func_query = client.query("SELECT * FROM test_from_to;", function(err, result) {
        console.log(result);
        f(result.rows)
        client.end();
    });
};

function custom_select2(f, lng, lat, rad) {
    var client = new pg.Client(conString);
    client.connect();
    console.log("SELECT with params was called with query");
    console.log("SELECT src_point FROM test_from_to WHERE (src_point <@ circle (("+lng+", "+lat+"),"+rad+");");
    var func_query = client.query("SELECT src_point FROM test_from_to WHERE src_point <@ circle '(("+
                                    lng+", "+lat+"),"+rad+")';", function(err, result) {
        console.log("Error: " + err);
        f(result.rows)
        client.end();
    });
}

function get_default_apartments(f) {
    console.log("Appartments called");
    
}

//REST API 

var restify = require('restify');

function respond(req, res, next) {
    res.send({'hello ': req.params.name});
    next();
};

function respond_select(req,res, next) {
    custom_select1((t) => {
        res.send(t);
        next();
    })
};

function respond_select_params(req,res, next) {
    custom_select2((t) => {
        res.send(t);
        next();
    }, req.params.lat, req.params.lng, req.params.rad);
    console.log(req.params.lng, req.params.lat, req.params.rad);
};

function respond_insert(req,res, next) {
    custom_insert((t) => {
        res.send(t);
        next();
    }, req.params.src_lng, req.params.src_lat, req.params.dst_lng, req.params.dst_lat, req.params.user_id);
};

var server_api = restify.createServer();
server_api.get('/hello/:name', respond);
server_api.head('/hello/:name', respond);

server_api.get('/api/select', respond_select);
server_api.get('/api/select/:lat/:lng/:rad', respond_select_params);
server_api.get('/api/insert/:src_lng/:src_lat/:dst_lng/:dst_lat/:user_id', respond_insert);

server_api.listen(8081, function() {
  console.log('%s listening at %s', server_api.name, server_api.url);
});