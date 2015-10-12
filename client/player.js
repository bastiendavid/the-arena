'use strict';

function Player(name, game) {
    this.name = name;
    this.game = game;

    var model = this.pickPlayerModel();

    this.player = this.game.game.add.sprite(40, 40, model);
    this.game.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.initSlashAnim();
    this.initBloodAnim();

    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 1300;
    this.player.body.maxVelocity.y = 700;
    this.player.body.setSize(20, 32, 5, 16);

    this.initAnims(model);

    this.storedEvents = [];
    this.facing = 'left';
    this.idle = true;
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

Player.prototype.initSlashAnim = function () {
  this.slash = this.game.game.add.sprite(0, 0, 'slash');
  this.slash.visible = false;
  this.slash.animations.add('slash right', [0, 1, 2, 3, 4, 5], 30, false);
  this.slash.animations.add('slash left', [11, 10, 9, 8, 7, 6], 30, false);
  var self = this;
  var endAnim = function() {
    self.slash.visible = false;
  };
  this.slash.animations.getAnimation('slash right').onComplete.dispatch = endAnim;
  this.slash.animations.getAnimation('slash left').onComplete.dispatch = endAnim;
};

Player.prototype.initBloodAnim = function () {
  this.blood = this.game.game.add.sprite(0, 0, 'blood');
  this.blood.visible = false;
  this.blood.animations.add('blood', [0, 1, 2, 3, 4], 20, false);
  var self = this;
  this.blood.animations.getAnimation('blood').onComplete.dispatch = function() {
    self.blood.visible = false;
  };
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
    this.jumpTimer = this.game.game.time.now + 300;
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

    if (minDistance < 50 && this.isFacing(playerNameToAttack)) {
        this.game.players[playerNameToAttack].hasBeenHit();
    }

    // slash animation
    this.doSlashEffect();
};

Player.prototype.isFacing = function (otherPlayerName) {
  console.log('is facing: ');
  console.log('this.game.players[this.game.playerName].facing = ' + this.game.players[this.game.playerName].facing);
  console.log('')
  return this.game.players[this.game.playerName].facing == 'left' && this.game.players[this.game.playerName].player.position.x > this.game.players[otherPlayerName].player.position.x ||
         this.game.players[this.game.playerName].facing == 'right' && this.game.players[this.game.playerName].player.position.x < this.game.players[otherPlayerName].player.position.x;
};

Player.prototype.doSlashEffect = function () {
  this.slash.visible = true;
  var slashDelta = 30;
  var slashAnim = 'slash right';
  if (this.facing == 'left') {
    slashDelta = -30;
    var slashAnim = 'slash left';
  }
  this.slash.position.x = this.player.position.x + slashDelta;
  this.slash.position.y = this.player.position.y;
  this.slash.animations.play(slashAnim);
};

Player.prototype.hasBeenHit = function () {
    this.doBloodEffect();
    this.game.socket.emit('player die', this.name);
};

Player.prototype.doBloodEffect = function () {
  this.blood.visible = true;
  this.blood.position.x = this.player.position.x;
  this.blood.position.y = this.player.position.y;
  this.blood.bringToTop();
  this.blood.animations.play('blood');
};

/**
* Update the player object. Call at each frame.
*/
Player.prototype.update = function () {
    this.player.body.velocity.x = 0;

    var event;
    if (this.storedEvents.length > 0) {
        event = this.storedEvents.splice(0,1)[0];
    }
    this.playEvent(event);
};

/**
* Play an event, to update the player state.
*/
Player.prototype.playEvent = function (event) {
    if (event != undefined && event.event == 'left')
    {
        this.player.body.velocity.x = -300;

        if (this.facing != 'left' || this.idle)
        {
            this.player.animations.play('left');
            this.facing = 'left';
            this.idle = false;
        }
    }
    else if (event != undefined && event.event == 'right')
    {
        this.player.body.velocity.x = 300;

        if (this.facing != 'right' || this.idle)
        {
            this.player.animations.play('right');
            this.facing = 'right';
            this.idle = false;
        }
    }
    else
    {
        if (!this.idle)
        {
            if (this.facing == 'left')
            {
                this.player.animations.play('idle left');
            }
            else
            {
                this.player.animations.play('idle right');
            }

            this.idle = true;
        }
    }

    if (event != undefined && event.event == 'jump')
    {
        this.jump();
    }

    if (event != undefined && event.event == 'attack')
    {
        this.attack();
    }
};
