!function(){

    function Character(params) {
        var self   = this;
        self.id    = params.id;
        self.x     = params.x;
        self.y     = params.y;
        self.name  = params.name;
        self.group = params.group;

        // Sprite config
        var characterSprite = 'player';

        if(self.group){
            self.sprite = self.group.create(self.x, self.y, characterSprite);
        } else {
            self.sprite = phaser.add.sprite(self.x, self.y, characterSprite);
            phaser.physics.enable(self.sprite, Phaser.Physics.ARCADE);
        }
        self.sprite.name           = self.name;
        self.sprite.body.immovable = true;
    }

    var onCollision = function(){
    };

    Character.prototype.update = function() {
        phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision, null, this);
    };

    game.entities           = game.entities || {};
    game.entities.Character = Character;

}();