// Mobs script
var mongoose = require('mongoose'),
Mob          = mongoose.model('Mob'),
_            = require('underscore');

function generateRandom(){
    var random = Math.floor(Math.random()*50) - 20;
    if(random === 0) return generateRandom();
    return random;
}

module.exports = function(sockets){
  var mobs = [];

  Mob.find({}, function(err, items){
    items.forEach(function(item){
      mobs.push(item.toObject());
    });
  });

  var updateMobs = function(){
    _.each(mobs, function(mob){

      if( Math.round(Math.random()) ){
        mob.x += generateRandom();
        mob.y += generateRandom();
      }

    });

    // sockets.emit('updateMobs', mobs);

    setTimeout(function(){
      updateMobs();
    }, 500);
  };
  updateMobs();

};