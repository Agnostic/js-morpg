!function(){

    app.entities.Character = me.ObjectEntity.extend({
        init: function(x, y, settings) {
            settings.spritewidth  = 32;
            settings.spriteheight = 32;

            // call the parent constructor
            this.parent(x, y, settings);

            // set the walking speed
            this.setVelocity(2.5, 2.5);

            this.setFriction(0.2, 0.2);

            // adjust the bounding box
            this.updateColRect(20, 24, 44, 16);

            // disable gravity
            this.gravity = 0;

            this.firstUpdates = 2;
            this.direction = 'down';
            this.destinationX = x;
            this.destinationY = y;

            this.renderable.addAnimation("stand-down", [3]);
            this.renderable.addAnimation("stand-left", [15]);
            this.renderable.addAnimation("stand-up", [39]);
            this.renderable.addAnimation("stand-right", [27]);
            this.renderable.addAnimation("down", [3,4,5]);
            this.renderable.addAnimation("left", [15,16,17]);
            this.renderable.addAnimation("up", [39,40,41]);
            this.renderable.addAnimation("right", [27,28,29]);
        },

        update: function() {
            hadSpeed = this.vel.y !== 0 || this.vel.x !== 0;

            this.handleInput();

            // check & update player movement
            updated = this.updateMovement();

            if (this.vel.y === 0 && this.vel.x === 0)
            {
                this.renderable.setCurrentAnimation('stand-' + this.direction);
                if (hadSpeed) {
                    updated = true;
                }
            }

            // update animation
            if (updated)
            {
                // update object animation
                this.parent(this);
            }
            return updated;
        },

        handleInput: function() {
            if (this.destinationX < this.pos.x - 10)
            {
                this.vel.x -= this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation('left');
                this.direction = 'left';
            }
            else if (this.destinationX > this.pos.x + 10)
            {
                this.vel.x += this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation('right');
                this.direction = 'right';
            }

            if (this.destinationY < this.pos.y - 10)
            {
                this.vel.y = -this.accel.y * me.timer.tick;
                this.renderable.setCurrentAnimation('up');
                this.direction = 'up';
            }
            else if (this.destinationY > this.pos.y + 10)
            {
                this.vel.y = this.accel.y * me.timer.tick;
                this.renderable.setCurrentAnimation('down');
                this.direction = 'down';
            }
        }
    });

}();