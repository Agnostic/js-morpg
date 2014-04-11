// Login Scene
(function(){

  var LoginScene = function(game) {
  };

  // Preload
  LoginScene.prototype.preload = function() {
    console.log('Login preload');

    // Fonts
    var fontFile = (navigator.isCocoonJS) ? 'default.xml' : 'default_desktop.xml';
    this.load.bitmapFont('default', 'assets/fonts/default.png', 'assets/fonts/' + fontFile);
  };

  // Create
  LoginScene.prototype.create = function() {
    console.log('Login create');
    this.stage.backgroundColor = 0x2d2d2d;

    this.add.bitmapText(50, 50, 'default', 'Login Scene', 16);

    // CocoonJS Fix
    var fake = this.game.add.image(0, 0, '');
  };

  // Update
  LoginScene.prototype.update = function() {

  };

  // Render
  LoginScene.prototype.render = function() {
    // phaser.debug.cameraInfo(phaser.camera, 20, 20);
  };

  // initGame
  LoginScene.prototype.initGame = function() {
    this.state.start('game');
  };

  // game.scenes.login = LoginScene;
  phaser.state.add('Login', LoginScene);

})();