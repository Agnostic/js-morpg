!function(){

    function Character(params) {
        var self   = this;
        self._id   = params._id;
        self.name  = params.name;

        var posX = params.x || 0;
        var posY = params.y || 0;

        // Sprite config
        var characterSprite = 'player';

        if(params.group){
            self.group  = params.group;
            self.sprite = self.group.create(posX, posY, characterSprite);
        } else {
            self.sprite = phaser.add.sprite(posX, posY, characterSprite);
            phaser.physics.enable(self.sprite, Phaser.Physics.ARCADE);
        }

        self.sprite.name           = self.name;
        self.sprite.body.immovable = true;

        var text = phaser.add.text(200, 200, self.name);
        text.anchor.set(0.6);
        text.align = 'center';

        //  Font style
        text.font = 'Arial';
        text.fontSize = 12;
        text.fontWeight = 'bold';

        //  Stroke color and thickness
        text.stroke = '#000000';
        text.strokeThickness = 3;
        text.fill = '#fff';
        text.z = 100;

        text.x = posX + (self.sprite.width / 2) + 5;
        text.y = posY - 5;

        self.sprite.animations.add('stand-down', [0]);
        self.sprite.animations.add('walk-down', [0, 1, 2]);

        self.sprite.animations.add('stand-left', [12]);
        self.sprite.animations.add('walk-left', [12, 13, 14]);

        self.sprite.animations.add('stand-right', [24]);
        self.sprite.animations.add('walk-right', [25, 26, 27]);

        self.sprite.animations.add('stand-up', [36]);
        self.sprite.animations.add('walk-up', [36, 37, 38]);

        self.playerName = text;
    }

    var onCollision = function(){
    };

    Character.prototype.update = function() {
        var self   = this;
        var player = self.sprite;

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        self.playerName.x = player.x + (player.width / 2) + 5;
        self.playerName.y = player.y - 5;

        if(game.groups.collisionGroup){
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision, null, this);
        }
    };

    game.entities           = game.entities || {};
    game.entities.Character = Character;

}();