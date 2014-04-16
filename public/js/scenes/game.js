// Game Scene
(function(){

  var GameScene = function(game) {
  };

  // Preload
  GameScene.prototype.preload = function() {
    console.log('Game preload');

    // Tilemap
    this.load.tilemap('desert', 'assets/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles', 'assets/maps/sprites/tmw_desert_spacing.png');

    // Player
    this.load.spritesheet('player','assets/sprites/characters.png', 32, 32);

    // Fonts
    var fontFile = (navigator.isCocoonJS) ? 'default.xml' : 'default_desktop.xml';
    this.load.bitmapFont('default', 'assets/fonts/default.png', 'assets/fonts/' + fontFile);

    // Disable pause on blur
    this.stage.disableVisibilityChange = true;

    // Gamepad
    this.load.image('arrow_left', 'assets/images/arrow_left.png');
    this.load.image('arrow_right', 'assets/images/arrow_right.png');
    this.load.image('arrow_up', 'assets/images/arrow_up.png');
    this.load.image('arrow_down', 'assets/images/arrow_down.png');
  };

  // Create
  GameScene.prototype.create = function() {
    console.log('Game create');

    // CocoonJS.App.showTextDialog('Título', 'Mensaje', 'Texto', CocoonJS.App.KeyboardType.TEXT, 'Cancel', 'Ok');
    // CocoonJS.App.onTextDialogFinished.addEventListener(function(text){
    //   // console.log('Value:', text);
    // });

    // Start physics
    phaser.physics.startSystem(Phaser.Physics.ARCADE);

    // Tilemap
    var map          = phaser.add.tilemap('desert');
    map.addTilesetImage('Desert', 'tiles');

    // Map Layers
    var layer        = map.createLayer('Ground');
    layer.resizeWorld();

    // Collision group
    game.groups.collisionGroup                 = phaser.add.group();
    game.groups.collisionGroup.enableBody      = true;
    game.groups.collisionGroup.physicsBodyType = Phaser.Physics.ARCADE;

    // Player
    var user_id;
    if(game.use_random_id){
      user_id = 'test_id_'+(Math.floor(Math.random(1, 100) * 1000));
    } else {
      user_id = user._id;
    }

    game.localPlayer        = new game.entities.Player({
      _id   : user_id,
      name  : user.username || 'Local player',
      group : game.groups.collisionGroup
    });
    game.players[user_id] = game.localPlayer;

    //  And now we convert all of the Tiled objects with an ID of 1 into sprites within the collision group
    // map.createFromObjects('CollisionLayer', 1, 'collider', 0, true, false, group);

    // NPC
    var npc = window.npc = new game.entities.Character({
      name  : 'NPC',
      x     : 300,
      y     : 320,
      group : game.groups.collisionGroup
    });

    // $('.chat').fadeIn('slow');
    // Logon event
    game.socket.emit('logon', {
      _id : user_id,
      x   : game.localPlayer.sprite.body.x,
      y   : game.localPlayer.sprite.body.y
    });

    // Motd
    // var html = "<span class='motd'>Welcome to "+game.title+"!</span><br/>";
    // addChatMessage(html);

    // Gamepad
    var gamepad                = this.add.group();
    gamepad.alpha              = 0.5;
    var gamepad_padding        = 10;
    var leftArrow              = gamepad.create(0, 0, 'arrow_left');
    leftArrow.y                += leftArrow.height;
    var rightArrow             = gamepad.create(leftArrow.width * 2, 0, 'arrow_right');
    rightArrow.y               += rightArrow.height;
    var upArrow                = gamepad.create(leftArrow.width, 0, 'arrow_up');
    var downArrow              = gamepad.create(leftArrow.width, upArrow.height * 2, 'arrow_down');
    gamepad.scale.x            = 0.5;
    gamepad.scale.y            = 0.5;
    gamepad.y                  = phaser.canvas.height - ((leftArrow.height/2) * 3 ) - gamepad_padding;
    gamepad.x                  += gamepad_padding;

    // Socket.io events
    this.addSocketListeners();
  };

  GameScene.prototype.addSocketListeners = function() {
    var self = this;

    game.socket.on('alert', function(data){
      alert(data.message);
    });

    game.socket.on('disconnect', function(data){
      location.href = '/signout';
    });

    // New player connected
    game.socket.on('connected', function(player) {
      console.log('New player online: ', player);
      self.addRemotePlayer(player);
    });

    // Remove player
    game.socket.on('disconnected', function(player) {
      if(player && game.players[player._id]){
        game.players[player._id].playerName.destroy();
        game.players[player._id].sprite.kill();
        delete game.players[player._id];
      }
    });

    // Player has moved
    game.socket.on('moved', function(_player) {
      self.movePlayer(_player);
    });

    // Get online players
    game.socket.on('players', function(players){
      _.each(players, function(player){
        self.addRemotePlayer(player);
      });
    });

    game.socket.on('new_message', function(data){
      // var html = "<b>" + data.from + ":</b> " + data.message + "<br/>";
      // addChatMessage(html);
    });

    game.socket.on('updateMobs', function(mobs){
      _.each(mobs, function(mob){
        if(!game.players[mob._id]){
          self.addRemotePlayer(mob);
        } else {
          self.movePlayer(mob);
        }
      });
    });
  };

  // Update
  function collisionHandler(sp1, sp2) {
    // console.log(sp1, sp2);
  }

  GameScene.prototype.updatePlayers = function() {
    _.each(game.players, function(player){
      player.update && player.update();
    });
  };

  // Main update
  GameScene.prototype.update = function() {
    this.updatePlayers();
  };

  GameScene.prototype.render = function() {
    if (game.localPlayer.sprite) {
      phaser.debug.spriteCoords(game.localPlayer.sprite, 20, 20);
    }
  };

  GameScene.prototype.addRemotePlayer = function(player) {
    game.players[player._id] = new game.entities.Character({
      _id  : player._id,
      x    : player.x,
      y    : player.y,
      name : player.name || 'Remote player'
    });
  };

  GameScene.prototype.moveRemotePlayer = function(player, data) {
    player.destinationX = data.x;
    player.destinationY = data.y;
    player.direction    = data.direction;
  };

  GameScene.prototype.movePlayer = function(_player) {
    var player = game.players[_player._id];
    if (player) {
      this.moveRemotePlayer(player, _player);
    } else {
      this.addRemotePlayer(_player);
    }
  };

  // Render
  GameScene.prototype.render = function() {
    console.log('Game render');
  };

  // Logout
  GameScene.prototype.logout = function() {
    this.state.start('login');
  };

  window.onfocus = function(){
    _.each(game.players, function(player){
      if(player.type === 'remote'){
        console.log('move player', player);
        phaser.add.tween(player.sprite.body).to({
          x: player.destinationX,
          y: player.destinationY
        }, 1, Phaser.Easing.Linear.None, true);
      }
    });
  };

  // game.scenes.Game = GameScene;
  phaser.state.add('Game', GameScene);

})();