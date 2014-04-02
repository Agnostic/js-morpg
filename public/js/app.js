!function(root){

  // App variables
  var game = root.game = {
    entities : {},
    groups   : {},
    players  : {}
  };

  game.socket = io.connect(),
  noop        = function(){};

  var gameWidth = 800,
  gameHeight    = 600;

  if (window.outerWidth < 1024) {
    $('#game')
      .css('width', window.outerWidth)
      .css('height', window.outerHeight);

    gameWidth  = window.outerWidth;
    gameHeight = window.outerHeight;
  }

  function preload() {

    // Tilemap
    phaser.load.tilemap('desert', 'assets/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    phaser.load.image('tiles', 'assets/maps/sprites/tmw_desert_spacing.png');

    // Player
    // phaser.load.image('player','assets/sprites/phaser-dude.png');
    phaser.load.spritesheet('player','assets/sprites/characters.png', 32, 32);

  }

  function create() {

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
    var player_id           = 'test_id_'+Math.floor(Math.random(1, 100) * 1000);
    game.localPlayer        = new game.entities.Player({
      _id   : player_id,
      name  : user.username || 'Local player',
      group : game.groups.collisionGroup
    });
    game.players[player_id] = game.localPlayer;

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
      _id : player_id,
      x   : game.localPlayer.sprite.body.x,
      y   : game.localPlayer.sprite.body.y
    });

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

  function addSocketListeners() {

    // Remove player
    game.socket.on('disconnected', function(player) {
      if(game.players[player._id]){
        game.players[player._id].kill();
        delete game.players[player._id];
      }
    });

    // Player has moved
    game.socket.on('moved', function(_player) {
        var player = game.players[_player._id];
        if (player) {
          console.log('Moved: ' + _player._id + ' ' + _player.x + ', ' + _player.y);
          player.sprite.x = _player.x;
          player.sprite.y = _player.y;
          // TODO: Add animation
        } else {
          addRemotePlayer(_player);
        }
    });

    game.socket.on('connected', function(player) {
      addRemotePlayer(player);
    });

  }

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