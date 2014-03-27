!function(){

    app.entities.Character = me.ObjectEntity.extend({
        init: function(x, y, settings) {
            // call the parent constructor
            this.parent(x, y, settings);

            // set the walking speed
            this.setVelocity(2.5, 2.5);

            this.setFriction(0.2, 0.2);

            // adjust the bounding box
            this.updateColRect(20,24, 44, 16);

            // disable gravity
            this.gravity = 0;

            this.firstUpdates = 2;
            this.direction = 'down';
            this.destinationX = x;
            this.destinationY = y;

            this.renderable.addAnimation("stand-down", [0]);
            this.renderable.addAnimation("stand-left", [7]);
            this.renderable.addAnimation("stand-up", [14]);
            this.renderable.addAnimation("stand-right", [21]);
            this.renderable.addAnimation("down", [1,2,3,4,5,6]);
            this.renderable.addAnimation("left", [8,9,10,11,12,13]);
            this.renderable.addAnimation("up", [15,16,17,18,19,20]);
            this.renderable.addAnimation("right", [22,23,24,25,26,27]);
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