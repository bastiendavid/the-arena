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

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onClientConnect(socket) {
    console.log('a user connected');

    socket.on('message', function (message) {
        io.emit('message', message);
    });

    socket.on('register', function (playerName) {
        console.log('New player registered: ' + playerName);
        socket.emit('registered', playerName);
        io.emit('message', playerName + ' entered the room');
    });

    socket.on('join game', function (playerName) {
        players.push(new Player(playerName, socket));
        io.emit('player list', playersToJSON());
    });

    socket.on('disconnect', function () {
        players.forEach(function (player) {
            if (player.socket == socket) {
                console.log('Player disconnected: ' + player.name);
                io.emit('message', player.name + ' left the room');
                players.splice(players.indexOf(player), 1);
                io.emit('player list', playersToJSON());
                return;
            }
        });
    });


    // Game communication
    socket.on('request player list', function(){
        var playersJSON = playersToJSON();
        socket.emit('player list', playersJSON);
    });

    socket.on('player position', function (playerName, position) {
        players.forEach(function (player) {
            if (player.name == playerName) {
                player.updatePosition(position);
                return;
            }
        });
    });

    socket.on('player die', function(playerName){
        players.forEach(function (player) {
            if (player.name == playerName) {
                var newPosition = { x: getRandomInt(32, 750), y : 0};
                console.log( 'player ' + playerName + ' die - new position ' + newPosition.x + ' - ' + newPosition.y);
                player.updatePosition(newPosition);
                return;
            }
        });
        io.emit('player list', playersToJSON());
    });


    // request players positions every 5 secs
    setInterval(function () {
        socket.emit('request player position');
    }, 5000);

    // send events to players
    socket.on('event', function (event) {
        players.forEach(function (player) {
            if (player.name == event.playerName) {
                player.updatePosition(event.position);
                return;
            }
        });
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
