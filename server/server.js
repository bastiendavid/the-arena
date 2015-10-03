'use strict'

var express = require('express');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);

// Serve static content
server.use(express.static(__dirname + '/../client'));
server.use("/jquery", express.static(__dirname + '/../node_modules/jquery/dist'));
server.use("/phaser", express.static(__dirname + '/../node_modules/phaser/dist'));

var players = [];

// sockets
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('user', function(username) {
        io.emit('message', username + ' entered the room');
    })

    socket.on('message', function(message) {
        io.emit('message', message);
    });

    socket.on('register', function(playerName) {
        players.push(playerName);
        console.log('New player registered: ' + playerName);
        socket.emit('registered', playerName);
    });

    socket.on('event', function(event) {
        io.emit('event', event);
    });
});

// start server
var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('Server started on port ' + port);
});
