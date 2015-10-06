'use strict'

var express = require('express');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);
var Player = require('./player');

// Serve static content
server.use(express.static(__dirname + '/../client'));
server.use("/jquery", express.static(__dirname + '/../node_modules/jquery/dist'));
server.use("/phaser", express.static(__dirname + '/../node_modules/phaser/dist'));

var players = [];

// sockets
function playersToJSON() {
    var playersJSON = [];
    players.forEach(function (player) {
        playersJSON.push(player.toJSON());
    });
    return playersJSON;
}

function onClientConnect(socket) {
    console.log('a user connected');
    socket.on('user', function (username) {
        io.emit('message', username + ' entered the room');
    })

    socket.on('message', function (message) {
        io.emit('message', message);
    });

    socket.on('register', function (playerName) {
        players.push(new Player(playerName, socket));
        console.log('New player registered: ' + playerName);
        socket.emit('registered', playerName);
        io.emit('player list', playersToJSON());
    });

    socket.on('disconnect', function () {
        players.forEach(function (player) {
            if (player.socket == socket) {
                console.log('Player disconnected: ' + player.name);
                return;
            }
        });
    });

    socket.on('request player list', function(){
        var playersJSON = playersToJSON();
        console.log('request player list: ' + JSON.stringify(playersJSON));
        socket.emit('player list', playersJSON);
    });

    // Game communication
    socket.on('player position', function (playerName, position) {
        players.forEach(function (player) {
            if (player.name == playerName) {
                player.updatePosition(position);
                return;
            }
        });
    });

    // request players positions every 5 secs
    setInterval(function () {
        socket.emit('request player position');
    }, 5000);

    // send events to players
    socket.on('event', function (event) {
        io.emit('event', event);
    });
}

io.on('connection', function(socket){
    onClientConnect(socket);
});

// start server
var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('Server started on port ' + port);
});
