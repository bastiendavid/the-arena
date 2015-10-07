<!-- phaser -->

function Game(socket) {
    this.socket = socket;
    this.playerName = undefined;
    this.players = {};
    var self = this;

    this.socket.on('player list', function(playersList) {
        self.updatePlayers(playersList);
    });
}

Game.prototype.updatePlayers = function(playersList) {
    var self = this;
    playersList.forEach(function (currentPlayer) {
        if (!self.players[currentPlayer.name]) {
            self.addPlayer(currentPlayer);
            console.log('player registered : ' + currentPlayer.name);
        }
        else {
            console.log('update position for : ' + currentPlayer.name);
            if (currentPlayer.position){
                self.players[currentPlayer.name].updatePosition(currentPlayer.position);
            }
        }
    });
    // TODO: remove players that are now longer registered on the server
}

Game.prototype.play = function(playerName) {
    var self = this;
    this.playerName = playerName;
    this.game = new Phaser.Game(800, 608, Phaser.AUTO, 'game', {
        preload: function() {
            self.preload();
        },
        create: function() {
            self.create();
            self.socket.emit('join game', self.playerName);
        },
        update: function() {
            self.update();
        }
    });
    this.listenEvents();

    this.socket.on('request player position', function() {
        self.sendPlayerPosition();
    });
};

Game.prototype.sendPlayerPosition = function () {
    if (this.playerName == undefined) {
        return;
    }
    this.socket.emit('player position', this.playerName, this.players[this.playerName].getPosition());
};

Game.prototype.spectate = function () {
    var self = this;
    this.game = new Phaser.Game(800, 608, Phaser.AUTO, 'game', {
        preload: function() {
            self.preload();
        },
        create: function() {
            self.create();
            self.socket.emit('request player list');
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
        self.players[event.playerName].addEvent(event.event);
    });
};

Game.prototype.preload = function () {
    this.game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    this.game.load.image('background_image', 'assets/background.png');
    this.collisions = this.game.load.tilemap('level', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
};

Game.prototype.create = function () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 300;

    var map = this.game.add.tilemap('level');
    map.addTilesetImage('background', 'background_image');
    this.layer = map.createLayer('background');
    this.layerCol = map.createLayer('collisions');
    // uncomment to display collisions boxes
    //this.layerCol.debug = true;
    map.setCollisionBetween(0, 608, true, 'collisions');
    this.layer.resizeWorld();

    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
    this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    this.attackButton = this.game.input.keyboard.addKey(Phaser.Keyboard.J);

};

Game.prototype.addPlayer = function (player) {
    var newPlayer = new Player(player.name, this);
    newPlayer.updatePosition(player.position);
    this.players[newPlayer.name] = newPlayer;
};

Game.prototype.update = function () {
    var postEvent;

    for (var playerName in this.players) {
        this.game.physics.arcade.collide(this.players[playerName].player, this.layerCol);
        this.players[playerName].update();
    }


    if (this.leftButton.isDown)
    {
        postEvent = "left";
    }

    if (this.rightButton.isDown)
    {
        postEvent = "right";
    }

    if (this.jumpButton.isDown && this.players[this.playerName].canJump())
    {
        postEvent = "jump";
    }

    if (this.attackButton.isDown && this.players[this.playerName].canAttack()) {
        postEvent = "attack";
    }

    // Send event to server
    if (postEvent != undefined) {
        this.socket.emit('event', new Event(this.playerName, postEvent, this.players[this.playerName].position));
    }
};

Game.prototype.updateSpectate = function () {
    for (var playerName in this.players) {
        this.game.physics.arcade.collide(this.players[playerName].player, this.layerCol);
        this.players[playerName].update();
    }
};
