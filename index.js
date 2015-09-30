'use strict'

var express = require('express');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);

// Serve static content
server.use(express.static(__dirname + '/frontend'));
server.use("/jquery", express.static(__dirname + '/node_modules/jquery/dist'));


// sockets
io.on('connection', function(socket){
    console.log('a user connected');  
    socket.on('user', function(username) {
        io.emit('message', username + ' entered the room');
    })
    
    socket.on('message', function(message) {
        io.emit('message', message);
    });
});

// start server
var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('Server started on port ' + port);
});