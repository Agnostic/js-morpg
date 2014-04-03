!function(){

    var velocity = 140;

    function Player(params) {
        var self       = this;
        self._id       = params._id;
        self.name      = params.name;
        self.direction = params.direction || 'down';

        var posX       = params.x || 100;
        var posY       = params.y || 100;

        // Sprite config
        var characterSprite = 'player';

        if(params.group){
            self.group  = params.group;
            self.sprite = self.group.create(posX, posY, characterSprite);
        } else {
            self.sprite = phaser.add.sprite(posX, posY, characterSprite);
            phaser.physics.enable(self.sprite, Phaser.Physics.ARCADE);
        }

        var text             = phaser.add.text(200, 200, self.name);
        text.align           = 'center';
        text.anchor.set(0.6);

        //  Font style
        text.font            = 'Arial';
        text.fontSize        = 12;
        text.fontWeight      = 'bold';

        //  Stroke color and thickness
        text.stroke          = '#000000';
        text.strokeThickness = 3;
        text.fill            = '#fff';
        text.z               = 100;

        text.x               = posX + (self.sprite.width / 2) + 5;
        text.y               = posY - 5;

        self.playerName      = text;

        self.sprite.animations.add('stand-down', [0]);
        self.sprite.animations.add('walk-down', [0, 1, 2]);

        self.sprite.animations.add('stand-left', [12]);
        self.sprite.animations.add('walk-left', [12, 13, 14]);

        self.sprite.animations.add('stand-right', [24]);
        self.sprite.animations.add('walk-right', [25, 26, 27]);

        self.sprite.animations.add('stand-up', [36]);
        self.sprite.animations.add('walk-up', [36, 37, 38]);

        self.sprite.name         = self.name;
        self.sprite.lastPosition = {};
        self.cursors             = phaser.input.keyboard.createCursorKeys();
        phaser.camera.follow(self.sprite);
    }

    var onCollision = function(){
    };

    Player.prototype.update = function() {
        var self   = this;

        var player = self.sprite,
        cursors    = self.cursors,
        moveParams = {};

        if(game.groups.collisionGroup){
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision, null, this);
        }

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        self.playerName.x = player.x + (player.width / 2) + 5;
        self.playerName.y = player.y - 5;

        // Up/Down
        if (cursors.up.isDown) {
            player.body.velocity.y = -velocity;
            self.direction         = 'up';
            moveParams.velY        = -velocity;
        } else if (cursors.down.isDown) {
            player.body.velocity.y = velocity;
            self.direction         = 'down';
            moveParams.velY        = velocity;
        }

        // Left/Right
        if (cursors.left.isDown) {
            player.body.velocity.x = -velocity;
            self.direction         = 'left';
            moveParams.velX        = -velocity;
        } else if (cursors.right.isDown) {
            player.body.velocity.x = velocity;
            self.direction         = 'right';
            moveParams.velX        = velocity;
        }

        if( player.body.velocity.x || player.body.velocity.y ) {
            self.sprite.animations.play('walk-'+self.direction, 5, true);
        } else {
            self.sprite.animations.play('stand-'+self.direction, 5, true);
        }

        if(player.lastPosition.x !== player.body.x || player.lastPosition.y !== player.body.y){
            moveParams.x         = player.body.x;
            moveParams.y         = player.body.y;
            moveParams.direction = self.direction;

            game.socket.emit('move', moveParams);

            player.lastPosition.x = player.body.x;
            player.lastPosition.y = player.body.y;
        }
    };

    game.entities        = game.entities || {};
    game.entities.Player = Player;

}();