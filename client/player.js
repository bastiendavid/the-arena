'use strict';

function Player(name, game) {
    this.name = name;
    this.game = game;

    this.player = this.game.add.sprite(32, 320, 'dude');
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 1300;
    this.player.body.maxVelocity.y = 700;
    this.player.body.setSize(20, 32, 5, 16);

    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    this.facing = 'left';
    this.jumpTimer = 0;
}

Player.prototype.getPosition = function () {
    return this.player.position;
};

Player.prototype.canJump = function () {
    return this.player.body.onFloor() && this.game.time.now > this.jumpTimer;
};

Player.prototype.jump = function () {
    this.player.body.velocity.y = -500;
    this.jumpTimer = this.game.time.now + 750;
};

/**
* Update the player object. Call at each frame.
*/
Player.prototype.update = function (event) {
    this.player.body.velocity.x = 0;

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
};
