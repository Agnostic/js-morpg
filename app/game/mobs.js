// Mobs script
var mongoose = require('mongoose'),
Mob          = mongoose.model('Mob'),
_            = require('underscore');

module.exports = function(sockets){
  var mobs = [];

  Mob.find({}, function(err, items){
    mobs = items;
  });

  var updateMobs = function(){

    _.each(mobs, function(mob){

    });

    sockets.emit('updateMobs', mobs);

    setTimeout(function(){
      updateMobs();
    }, 500);
  };
  updateMobs();

};