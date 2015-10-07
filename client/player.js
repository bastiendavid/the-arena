'use strict';

function Player(name, game) {
    this.name = name;
    this.game = game;

    var model = this.pickPlayerModel();

    this.player = this.game.game.add.sprite(40, 40, model);
    this.game.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 1300;
    this.player.body.maxVelocity.y = 700;
    this.player.body.setSize(20, 32, 5, 16);

    this.initAnims(model);

    this.storedEvents = [];
    this.facing = 'left';
    this.jumpTimer = 0;
    this.attackTimer = 0;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Player.prototype.pickPlayerModel = function () {
    if (getRandomInt(0, 100)%2 == 0) {
        return 'lara';
    } else {
        return 'indiana';
    }
};

Player.prototype.initAnims = function (model) {
    if (model === 'indiana') {
        this.player.animations.add('left', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 30, true);
        this.player.animations.add('right', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 30, true);
        this.player.animations.add('idle left', [1], 10, true);
        this.player.animations.add('idle right', [0], 10, true);
        return;
    }

    if (model === 'lara') {
        this.player.animations.add('left', [10, 11, 12, 13, 14, 15, 16, 17], 30, true);
        this.player.animations.add('right', [2, 3, 4, 5, 6, 7, 8, 9], 30, true);
        this.player.animations.add('idle left', [1], 10, true);
        this.player.animations.add('idle right', [0], 10, true);
        return;
    }
};

Player.prototype.getPosition = function () {
    return this.player.position;
};

Player.prototype.updatePosition = function(position) {
    this.player.position.x = position.x;
    this.player.position.y = position.y;
}

Player.prototype.addEvent = function (event) {
    this.storedEvents.push(event);
};

Player.prototype.canJump = function () {
    return this.player.body.onFloor() && this.game.game.time.now > this.jumpTimer;
};

Player.prototype.jump = function () {
    this.player.body.velocity.y = -500;
    this.jumpTimer = this.game.game.time.now + 750;
};

Player.prototype.canAttack = function () {
    return this.game.game.time.now > this.attackTimer;
};

Player.prototype.attack = function () {
    var minDistance = 600;
    var currentDistance;
    var playerNameToAttack;
    this.attackTimer = this.game.game.time.now + 1500;

    for (var otherPlayerName in this.game.players) {
        if (otherPlayerName !== this.game.playerName) {
            currentDistance = this.game.game.physics.arcade.distanceBetween(this.game.players[this.game.playerName].player, this.game.players[otherPlayerName].player)
            if (currentDistance < minDistance) {
                minDistance = currentDistance;
                playerNameToAttack = otherPlayerName;
            }
        }
    }

    if (minDistance < 50) {
        this.game.players[otherPlayerName].hasBeenHitted();
    }
};

Player.prototype.hasBeenHitted = function () {
    this.game.socket.emit('player die', this.name);
};

/**
* Update the player object. Call at each frame.
*/
Player.prototype.update = function () {
    this.player.body.velocity.x = 0;

    var event;
    if (this.storedEvents.length > 0) {
        event = this.storedEvents.splice(0,1);
    }
    this.playEvent(event);
};

/**
* Play an event, to update the player state.
*/
Player.prototype.playEvent = function (event) {
    if (event == "left")
    {
        this.player.body.velocity.x = -300;

        if (this.facing != 'left')
        {
            this.player.animations.play('left');
            this.facing = 'left';
        }
    }
    else if (event == "right")
    {
        this.player.body.velocity.x = 300;

        if (this.facing != 'right')
        {
            this.player.animations.play('right');
            this.facing = 'right';
        }
    }
    else
    {
        if (this.facing != 'idle')
        {
            if (this.facing == 'left')
            {
                this.player.animations.play('idle left');
            }
            else
            {
                this.player.animations.play('idle right');
            }

            this.facing = 'idle';
        }
    }

    if (event == "jump")
    {
        this.jump();
    }

    if (event == "attack")
    {
        this.attack();
    }
};
