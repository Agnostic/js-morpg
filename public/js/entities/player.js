!function(){

    function Player(params) {
        var self   = this;
        self._id   = params._id;
        self.name  = params.name;

        var posX = params.x || 0;
        var posY = params.y || 0;

        // Sprite config
        var characterSprite = 'player';

        if(self.group){
            self.group  = params.group;
            self.sprite = self.group.create(posX, posY, characterSprite);
        } else {
            self.sprite = phaser.add.sprite(posX, posY, characterSprite);
            phaser.physics.enable(self.sprite, Phaser.Physics.ARCADE);
        }

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
        cursors    = self.cursors;

        if(game.groups.collisionGroup){
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision, null, this);
        }

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (cursors.up.isDown) {
            player.body.velocity.y = -200;
        } else if (cursors.down.isDown) {
            player.body.velocity.y = 200;
        }

        if (cursors.left.isDown) {
            player.body.velocity.x = -200;
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 200;
        }

        if(player.lastPosition.x !== player.body.x || player.lastPosition.y !== player.body.y){
            game.socket.emit('move', { x: player.body.x, y: player.body.y });
            player.lastPosition.x = player.body.x;
            player.lastPosition.y = player.body.y;
        }
    };

    game.entities        = game.entities || {};
    game.entities.Player = Player;

}();