'use strict';

function Player(name, socket) {
    this.name = name;
    this.socket = socket;
    this.position = {x: 32, y: 32};
}

Player.prototype.updatePosition = function (position) {
    this.position = position;
};

Player.prototype.toJSON = function () {
    return {name : this.name,
           position : this.position};
};

module.exports = Player;
