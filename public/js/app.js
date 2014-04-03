!function(root){

  // App variables
  var game = root.game = {
  	title         : 'js-mmo',
    entities      : {},
    groups        : {},
    players       : {},
    use_random_id : true
  };

  game.socket = io.connect(),
  noop        = function(){};

  var gameWidth = 800,
  gameHeight    = 600;

  if (window.outerWidth < 1024) {
    $('#game, #container')
      .css('width', window.outerWidth)
      .css('height', window.outerHeight);

    gameWidth  = window.outerWidth;
    gameHeight = window.outerHeight;
  }

  function preload() {

    // phaser.onBlur                        = noop;
    // phaser.onFocus                       = noop;
    // phaser.onPause                       = noop;
    // phaser.onResume                      = noop;
    phaser.stage.checkVisibility         = noop;
    phaser.stage.disableVisibilityChange = true;
    phaser.stage.visibilityChange        = noop;
    phaser.focusLoss                     = noop;
    phaser.focusGain                     = noop;

    // Tilemap
    phaser.load.tilemap('desert', 'assets/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    phaser.load.image('tiles', 'assets/maps/sprites/tmw_desert_spacing.png');

    // Player
    // phaser.load.image('player','assets/sprites/phaser-dude.png');
    phaser.load.spritesheet('player','assets/sprites/characters.png', 32, 32);

  }

  function create() {

    // Disable pause on blur
    this.stage.disableVisibilityChange = true;

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
      user_id = 'test_id_'+Math.floor(Math.random(1, 100) * 1000);
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

    game.socket.emit('logon', {
      _id : user_id,
      x   : game.localPlayer.sprite.body.x,
      y   : game.localPlayer.sprite.body.y
    });

    var html = "<span class='motd'>Welcome to "+game.title+"!</span><br/>";
    addChatMessage(html);

    addSocketListeners();
  }

  function collisionHandler(sp1, sp2) {
    // console.log(sp1, sp2);
  }

  function updatePlayers() {
    _.each(game.players, function(player){
      player.update && player.update();
    });
  }

  // Main update
  function update() {
    updatePlayers();
  }

  function render() {
    phaser.debug.cameraInfo(phaser.camera, 32, 32);
    if(game.localPlayer.sprite){
      phaser.debug.spriteCoords(game.localPlayer.sprite, 32, 110);
    }
  }

  function addRemotePlayer(player) {
    game.players[player._id] = new game.entities.Character({
      _id  : player._id,
      x    : player.x,
      y    : player.y,
      name : player.name || 'Remote player'
    });
  }

  function moveRemotePlayer(player, data) {
    // console.log('Moved: ', data);
    // player.sprite.x  = player.x;
    // player.sprite.y  = player.y;

    // Experimental
    player.destinationX = data.x;
    player.destinationY = data.y;
    player.direction    = data.direction;
    // TODO: Add animation
  }

  // Socket.io events
  function addSocketListeners() {

    game.socket.on('alert', function(data){
      alert(data.message);
    });

    game.socket.on('disconnect', function(data){
      location.href = '/signout';
    });

    // New player connected
    game.socket.on('connected', function(player) {
      console.log('New player online: ', player);
      addRemotePlayer(player);
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
    game.socket.on('moved', function(data) {
      var player = game.players[data._id];
      if (player) {
        moveRemotePlayer(player, data);
      } else {
        addRemotePlayer(data);
      }
    });

    // Get online players
    game.socket.on('players', function(players){
      _.each(players, function(player){
        addRemotePlayer(player);
      });
    });

    game.socket.on('new_message', function(data){
      var html = "<b>" + data.from + ":</b> " + data.message + "<br/>";
      addChatMessage(html);
    });

  }

  function addChatMessage(message){
	message = "<span class='message-time'>" + new Date().toTimeString().substr(0, 8) + '</span>&nbsp;&nbsp;' + message;
	$('.messages').append(message).scrollTop($('.messages')[0].scrollHeight);
  }

  game.sendMessage = function(e){
    game.socket.emit('message', { message: $('#chat-text').val() });
    var html = "<span class='me'><b>" + game.localPlayer.name + ":</b> " + $('#chat-text').val() + "</span><br/>";
    addChatMessage(html);
    $('#chat-text').val('').blur();

    e && e.preventDefault();
    return false;
  };

  // Ready?
  $(function() {
    window.phaser = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'game', {
      preload : preload,
      create  : create,
      update  : update,
      render  : render
    });
  });

}(window);