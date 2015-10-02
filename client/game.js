<!-- phaser -->

function Game(socket) {
    this.socket = socket;
    this.facing = 'left';
    this.jumpTimer = 0;
    this.storedEvents = [];
}

Game.prototype.play = function(playerName) {
    var self = this;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: function() {
            self.preload();
        },
        create: function() {
            self.create();
        },
        update: function() {
            self.update();
        }
    });
    this.listenEvents();
};

Game.prototype.spectate = function () {
    var self = this;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: function() {
            self.preload();
        },
        create: function() {
            self.create();
        },
        update: function() {
            self.updateSpectate();
        }
    });
    this.listenEvents();
};

Game.prototype.listenEvents = function () {
    var self = this;
    this.socket.on('event', function (event) {
        self.storedEvents.push(event);
    });
};

Game.prototype.preload = function () {
    this.game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    this.game.load.image('background', 'assets/sky1.png');
};

Game.prototype.create = function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 300;

    var bg = this.game.add.tileSprite(0, 0, 800, 600, 'background');

    this.addPlayer();

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
};

Game.prototype.addPlayer = function () {
    this.player = this.game.add.sprite(32, 320, 'dude');
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.player.body.collideWorldBounds = true;
    this.player.body.gravity.y = 1300;
    this.player.body.maxVelocity.y = 700;
    this.player.body.setSize(20, 32, 5, 16);

    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
};

Game.prototype.update = function () {
    // game.physics.arcade.collide(player, layer);

    var postEvent;
    this.playNextEvent();

    if (this.cursors.left.isDown)
    {
        postEvent = "left";
    }

    if (this.cursors.right.isDown)
    {
        postEvent = "right";
    }

    if (this.jumpButton.isDown && this.player.body.onFloor() && this.game.time.now > this.jumpTimer)
    {
        postEvent = "jump";
    }

    // Send event to server
    if (postEvent != undefined) {
        this.socket.emit('event', postEvent);
    }
};

Game.prototype.updateSpectate = function (first_argument) {
    this.playNextEvent();
};

Game.prototype.playNextEvent = function () {
    this.player.body.velocity.x = 0;
    var event;
    if (this.storedEvents.length > 0) {
        event = this.storedEvents.splice(0,1);
    }

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
        this.player.body.velocity.y = -500;
        this.jumpTimer = this.game.time.now + 750;
    }
};
