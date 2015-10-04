'use strict';

function Player(name, socket) {
    this.name = name;
    this.socket = socket;
}

Player.prototype.updatePosition = function (position) {
    this.position = position;
};

module.exports = Player;
