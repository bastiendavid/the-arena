'use strict';

function Player(name, game) {
    this.name = name;
    this.game = game;

    this.player = this.game.game.add.sprite(32, 32, 'dude');
    this.game.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 1300;
    this.player.body.maxVelocity.y = 700;
    this.player.body.setSize(20, 32, 5, 16);

    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    this.storedEvents = [];
    this.facing = 'left';
    this.jumpTimer = 0;
    this.attackTimer = 0;
}

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
        // TODO: Manage Attack
        console.log('I am attacking player : ' + playerNameToAttack);
    }
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
            this.player.animations.stop();

            if (this.facing == 'left')
            {
                this.player.frame = 0;
            }
            else
            {
                this.player.frame = 5;
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
