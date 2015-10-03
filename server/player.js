'use strict';

function Player(name) {
    this.name = name;
}

Player.prototype.updatePosition = function (position) {
    this.position = position;
};

module.exports = Player;
