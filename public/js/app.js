!function(root){

  // App variables
  var game = root.game = {
  	title         : 'js-mmo',
    entities      : {},
    groups        : {},
    players       : {},
    enableDebug   : true,
    use_random_id : true
  };

  io.connect = function (host, details) {
    // var global;
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    // if (global && global.location) {
    //   uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
    //   uri.host = uri.host || (global.document
    //     ? global.document.domain : global.location.hostname);
    //   uri.port = uri.port || global.location.port;
    // }

    console.log('URI', uri);
    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

  game.socket = io.connect(location.protocol + '//' + location.host);
  noop        = function(){};

  var gameWidth = 800,
  gameHeight    = 600;

  if (navigator.isCocoonJS) {
    // $('#game, #container')
    //   .css('width', window.innerWidth)
    //   .css('height', window.innerHeight);

    gameWidth  = window.innerWidth;
    gameHeight = window.innerHeight;
  }

  function preload() {

    // Disable pause on blur
    phaser.stage.disableVisibilityChange = true;

    // Tilemap
    phaser.load.tilemap('desert', 'assets/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    phaser.load.image('tiles', 'assets/maps/sprites/tmw_desert_spacing.png');

    // Fonts
    var fontFile = (navigator.isCocoonJS) ? 'default.xml' : 'default_desktop.xml';
    phaser.load.bitmapFont('default', 'assets/fonts/default.png', 'assets/fonts/' + fontFile);

    // Player
    // phaser.load.image('player','assets/sprites/phaser-dude.png');
    phaser.load.spritesheet('player','assets/sprites/characters.png', 32, 32);

    phaser.canvas.id = 'canvas';
  }

  function create() {

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

    // $('.chat').fadeIn('slow');
    // Logon event
    game.socket.emit('logon', {
      _id : user_id,
      x   : game.localPlayer.sprite.body.x,
      y   : game.localPlayer.sprite.body.y
    });

    // Motd
    var html = "<span class='motd'>Welcome to "+game.title+"!</span><br/>";
    addChatMessage(html);

    // Socket.io events
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
    // if (game.localPlayer.sprite) {
    //   phaser.debug.spriteCoords(game.localPlayer.sprite, 20, 20);
    // }
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
  }

  function movePlayer(_player) {
    var player = game.players[_player._id];
    if (player) {
      moveRemotePlayer(player, _player);
    } else {
      addRemotePlayer(_player);
    }
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
    game.socket.on('moved', function(_player) {
      movePlayer(_player);
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

    game.socket.on('updateMobs', function(mobs){
      _.each(mobs, function(mob){
        if(!game.players[mob._id]){
          addRemotePlayer(mob);
        } else {
          movePlayer(mob);
        }
      });
    });

    window.onfocus = function(){
      _.each(game.players, function(player){
        if(player.type === 'remote'){
          console.log('move player', player);
          phaser.add.tween(player.sprite.body).to( { x: player.destinationX, y: player.destinationY }, 1, Phaser.Easing.Linear.None, true);
        }
      });
    };

  }

  game.debug = function(message){
    if(game.enableDebug){
      if(arguments.length){
        message = Array.prototype.join.call(arguments, ', ');
      }
      addChatMessage("<span class='debug'><b>[DBG] </b>" + message + "</span><br/>");
    }
  }

  function addChatMessage(message){
  	message = "<span class='message-time'>" + new Date().toTimeString().substr(0, 8) + '</span>&nbsp;&nbsp;' + message;
  	// $('.messages').append(message).scrollTop($('.messages')[0].scrollHeight);
  }

  game.sendMessage = function(e){
    game.socket.emit('message', { message: $('#chat-text').val() });
    // var html = "<span class='me'><b>" + game.localPlayer.name + ":</b> " + $('#chat-text').val() + "</span><br/>";
    addChatMessage(html);
    // $('#chat-text').val('').blur();

    e && e.preventDefault();
    return false;
  };

  // Ready?
  window.onload = function(){
    var target = (navigator.isCocoonJS) ? '' : 'game';
    window.phaser = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, target, {
      preload : preload,
      create  : create,
      update  : update,
      render  : render
    });
  };

}(window);