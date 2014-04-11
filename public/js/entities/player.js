!function(){

    var baseVelocity = 140;

    function Player(params) {
        var self       = this;
        self._id       = params._id;
        self.name      = params.name;
        self.type      = 'local';
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

        var text          = phaser.add.bitmapText(100, 100, 'default', self.name, 16);
        self.playerName   = text;
        self.playerName.x = (self.sprite.x + (self.sprite.width/2)) - (self.playerName.textWidth/2);
        self.playerName.y = self.sprite.y - self.playerName.textHeight;

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

        // Touch control
        game.debug('userAgent -> ' + navigator.userAgent);
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            phaser.input.onDown.add(handleTouch, this);
        }
    }

    function handleTouch(pointer) {
        var player          = game.localPlayer;
        player.destinationX = pointer.x;
        player.destinationY = pointer.y;
        game.debug('Moving player to -> x: ' + pointer.x + ' x: ' + pointer.y);
        // player.direction    = data.direction;
    }

    var onCollision = function(){
    };

    Player.prototype.update = function() {
        var self       = this;

        var player     = self.sprite,
        cursors        = self.cursors,
        moveParams     = {},
        positionOffset = 10;

        if(game.groups.collisionGroup){
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision, null, this);
        }

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        self.playerName.x = (player.x + (player.width/2)) - (self.playerName.textWidth/2);
        self.playerName.y = player.y - self.playerName.textHeight;

        // // Moved to destination (touch)
        // if (self.destinationX && self.destinationX < player.x - positionOffset) {
        //     self.direction         = 'left';
        //     player.body.velocity.x = -baseVelocity;
        // } else if (self.destinationX && self.destinationX > player.x + positionOffset) {
        //     self.direction         = 'right';
        //     player.body.velocity.x = baseVelocity;
        // }

        // if (self.destinationY && self.destinationY < player.y - positionOffset) {
        //     player.body.velocity.y = -baseVelocity;
        //     self.direction         = 'up';
        // } else if (self.destinationY && self.destinationY > player.y + positionOffset) {
        //     player.body.velocity.y = baseVelocity;
        //     self.direction         = 'down';
        // }
        // // End of moved to destination

        // Touch
        if (self.destinationY || self.destinationY){
            phaser.physics.arcade.moveToXY(player, self.destinationX, self.destinationY, 10, baseVelocity);
        }

        // Up/Down
        if (cursors.up.isDown) {
            player.body.velocity.y = -baseVelocity;
            self.direction         = 'up';
            moveParams.velY        = -baseVelocity;
        } else if (cursors.down.isDown) {
            player.body.velocity.y = baseVelocity;
            self.direction         = 'down';
            moveParams.velY        = baseVelocity;
        }

        // Left/Right
        if (cursors.left.isDown) {
            player.body.velocity.x = -baseVelocity;
            self.direction         = 'left';
            moveParams.velX        = -baseVelocity;
        } else if (cursors.right.isDown) {
            player.body.velocity.x = baseVelocity;
            self.direction         = 'right';
            moveParams.velX        = baseVelocity;
        }

        if( player.body.velocity.x || player.body.velocity.y ) {
            self.sprite.animations.play('walk-'+self.direction, 5, true);
        } else {
            self.sprite.animations.play('stand-'+self.direction, 5, true);
        }

        if(player.lastPosition.x !== player.body.x || player.lastPosition.y !== player.body.y){
            moveParams.x          = player.body.x;
            moveParams.y          = player.body.y;
            moveParams.direction  = self.direction;

            game.socket.emit('move', moveParams);

            player.lastPosition.x = player.body.x;
            player.lastPosition.y = player.body.y;
        }

        player.destinationX = 0;
        player.destinationY = 0;
    };

    game.entities        = game.entities || {};
    game.entities.Player = Player;

}();