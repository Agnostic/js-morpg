!function(root){

  // App variables
  var game = root.game = {
    title         : 'js-mmo',
    entities      : {},
    scenes        : {},
    groups        : {},
    players       : {},
    enableDebug   : true,
    use_random_id : true
  };

  game.socket     = io.connect(location.protocol + '//' + location.host);
  noop            = function(){};

  game.gameWidth  = 800,
  game.gameHeight = 600;

  if (navigator.isCocoonJS) {
    game.gameWidth  = window.innerWidth * window.devicePixelRatio;
    game.gameHeight = window.innerHeight * window.devicePixelRatio;
  }

  game.debug = function(message){
    if(game.enableDebug){
      if(arguments.length){
        message = Array.prototype.join.call(arguments, ', ');
      }
      // addChatMessage("<span class='debug'><b>[DBG] </b>" + message + "</span><br/>");
      console.log('DEBUG: ', message);
    }
  };

  // function addChatMessage(message){
  // 	message = "<span class='message-time'>" + new Date().toTimeString().substr(0, 8) + '</span>&nbsp;&nbsp;' + message;
  // 	// $('.messages').append(message).scrollTop($('.messages')[0].scrollHeight);
  // }

  // game.sendMessage = function(e){
  //   game.socket.emit('message', { message: $('#chat-text').val() });
  //   // var html = "<span class='me'><b>" + game.localPlayer.name + ":</b> " + $('#chat-text').val() + "</span><br/>";
  //   addChatMessage(html);
  //   // $('#chat-text').val('').blur();

  //   e && e.preventDefault();
  //   return false;
  // };

  // Initializing Phaser
  var target = 'game';
  if(navigator.isCocoonJS){
    target = '';
  }
  window.phaser = new Phaser.Game(game.gameWidth, game.gameHeight, Phaser.CANVAS, target);

  // Ready?
  window.onload = function(){
    phaser.state.start('Login');
  };

}(window);