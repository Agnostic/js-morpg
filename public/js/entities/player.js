!function(){

    app.entities.Player = app.entities.Character.extend({

        init: function(x, y, settings) {
            // call the parent constructor
            this.parent(x, y, settings);

            // set the display to follow our position on both axis
            me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

            app.localPlayerCreated(this);
        },

        handleInput: function() {
            if (me.input.isKeyPressed('left'))
            {
                this.vel.x -= this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation('left');
                this.direction = 'left';
            }
            else if (me.input.isKeyPressed('right'))
            {
                this.vel.x += this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation('right');
                this.direction = 'right';
            }

            if (me.input.isKeyPressed('up'))
            {
                this.vel.y = -this.accel.y * me.timer.tick;
                this.renderable.setCurrentAnimation('up');
                this.direction = 'up';
            }
            else if (me.input.isKeyPressed('down'))
            {
                this.vel.y = this.accel.y * me.timer.tick;
                this.renderable.setCurrentAnimation('down');
                this.direction = 'down';
            }
        }

    });

}();