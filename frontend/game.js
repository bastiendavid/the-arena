<!-- phaser -->
var game;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;
var spectateEvents = [];

function playGame(playerName) {
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update
    });
    socket.on('event', function (event) {
        spectateEvents.push(event);
    });
}

function spectateGame() {
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: updateSpectate
    });
    socket.on('event', function (event) {
        spectateEvents.push(event);
    });
}

function preload() {
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.image('background', 'assets/sky1.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');

    game.physics.arcade.gravity.y = 300;

    player = game.add.sprite(32, 320, 'dude');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 1300;
    player.body.maxVelocity.y = 700;
    player.body.setSize(20, 32, 5, 16);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function update() {
    // game.physics.arcade.collide(player, layer);

    var postEvent;
    playNextEvent();

    if (cursors.left.isDown)
    {
        postEvent = "left";
    }

    if (cursors.right.isDown)
    {
        postEvent = "right";
    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        postEvent = "jump";
    }

    // Send event to server
    if (postEvent != undefined) {
        socket.emit('event', postEvent);
    }
}

function updateSpectate() {
    playNextEvent();
}

function playNextEvent() {
    player.body.velocity.x = 0;
    var event;
    if (spectateEvents.length > 0) {
        event = spectateEvents.splice(0,1);
    }

    if (event == "left")
    {
        player.body.velocity.x = -300;

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    else if (event == "right")
    {
        player.body.velocity.x = 300;

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else
    {
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }

    if (event == "jump")
    {
        player.body.velocity.y = -500;
        jumpTimer = game.time.now + 750;
    }
}
