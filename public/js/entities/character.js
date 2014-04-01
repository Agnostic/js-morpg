!function(){

    function Character(params) {
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
        self.sprite.name           = self.name;
        self.sprite.body.immovable = true;
    }

    var onCollision = function(){
    };

    Character.prototype.update = function() {
        var self   = this;
        var player = self.sprite;

        if(game.groups.collisionGroup){
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision, null, this);
        }

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
    };

    game.entities           = game.entities || {};
    game.entities.Character = Character;

}();