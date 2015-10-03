<!-- phaser -->

function Game(socket) {
    this.socket = socket;
    this.storedEvents = [];
    this.currentPlayer = undefined;
}

Game.prototype.play = function(playerName) {
    var self = this;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: function() {
            self.preload();
        },
        create: function() {
            self.create(playerName);
        },
        update: function() {
            self.update();
        }
    });
    this.listenEvents();

    // send position when requested
    this.socket.on('request player position', function() {
        self.sendPlayerPosition();
    });
};

Game.prototype.sendPlayerPosition = function () {
    if (this.currentPlayer == undefined) {
        return;
    }
    this.socket.emit('player position', this.currentPlayer.name, this.currentPlayer.getPosition());
};

Game.prototype.spectate = function () {
    var self = this;
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: function() {
            self.preload();
        },
        create: function() {
            self.create("??");
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

Game.prototype.create = function (playerName) {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 300;

    var bg = this.game.add.tileSprite(0, 0, 800, 600, 'background');

    this.addPlayer(playerName);

    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
    this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.D);

};

Game.prototype.addPlayer = function (playerName) {
    this.currentPlayer = new Player(playerName, this.game);
};

Game.prototype.update = function () {
    // game.physics.arcade.collide(player, layer);

    var postEvent;
    this.playNextEvent();

    if (this.leftButton.isDown)
    {
        postEvent = "left";
    }

    if (this.rightButton.isDown)
    {
        postEvent = "right";
    }

    if (this.jumpButton.isDown && this.currentPlayer.canJump())
    {
        postEvent = "jump";
    }

    // Send event to server
    if (postEvent != undefined) {
        this.socket.emit('event', postEvent);
    }
};

Game.prototype.updateSpectate = function () {
    this.playNextEvent();
};

Game.prototype.playNextEvent = function () {
    var event;
    if (this.storedEvents.length > 0) {
        event = this.storedEvents.splice(0,1);
    }

    this.currentPlayer.update(event);
};
