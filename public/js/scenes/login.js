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

    var fontFile2 = (navigator.isCocoonJS) ? 'font_large.xml' : 'font_large_desktop.xml';
    this.load.bitmapFont('font_large', 'assets/fonts/font_large.png', 'assets/fonts/' + fontFile2);

    // Background
    this.load.image('background', 'assets/images/login_background2.jpg');

    // Input
    this.load.image('input', 'assets/images/input.png');

    // Button
    this.load.image('login_btn', 'assets/images/button_login.png');
  };

  // Create
  LoginScene.prototype.create = function() {
    var self                   = this;
    this.stage.backgroundColor = 0x2d2d2d;
    var background             = this.add.sprite(0, 0, 'background');
    background.alpha           = 0.4;

    var title                  = this.add.bitmapText(phaser.canvas.width/2, 80, 'font_large', 'js-morpg', 72);
    title.x                    -= title.textWidth/2;

    var subtitle_text          = 'Javascript + WebSockets = Awesome';
    var subtitle               = this.add.bitmapText(phaser.canvas.width/2, 80+title.textHeight, 'default', subtitle_text, 16);
    subtitle.x                 -= subtitle.textWidth/2;

    var form                   = this.add.group();
    var username               = form.create(0, 0, 'input');
    username.inputEnabled      = true;
    username.width             = 250;
    var password               = form.create(0, 50, 'input');
    password.width             = 250;
    password.inputEnabled      = true;
    var loginBtn               = form.create(0, 100, 'login_btn');
    loginBtn.width             = 250;
    loginBtn.inputEnabled      = true;
    form.x                     = phaser.canvas.width/2 - 250/2;
    form.y                     = 210;

    var placeholder1           = this.add.bitmapText(form.x + 15, form.y + 10, 'default', 'Username', 16);
    placeholder1.alpha         = 0.7;

    var placeholder2           = this.add.bitmapText(form.x + 15, form.y + 60, 'default', 'Password', 16);
    placeholder2.alpha         = 0.7;

    var login_text             = this.add.bitmapText(form.x + (250/2), form.y + 106, 'font_large', 'Login', 30);
    login_text.x               -= login_text.textWidth/2;

    var user_password          = '';

    // Login event
    loginBtn.events.onInputDown.add(function(){
      var params = 'username=' + placeholder1.text + '&password='+user_password;

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/signin?'+params, true);

      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      xhr.onload = function(){
        var response = {};
        try {
          response = JSON.parse(this.responseText);
        } catch(e) {}
        if(response.success){
          game.user = response.user;
          self.initGame();
        } else {
          alert(response.error);
        }
      };
      xhr.send(params);
    });

    // Username prompt
    username.events.onInputDown.add(function(){
      game.input({
        message: 'Type your username',
        callback: function(text){
          if(text){
            placeholder1.text = text;
          }
        }
      });
    });

    // Password prompt
    password.events.onInputDown.add(function(){
      game.input({
        message: 'Type your password',
        callback: function(text) {
          if (text){
            var placeholder = '';
            for (var i=0; i < text.length; i++){
              placeholder += '*';
            }
            user_password     = text;
            placeholder2.text = placeholder;
          }
        }
      });
    });

    // CocoonJS Fix
    var fake = this.game.add.image(0, 0, '');
  };

  // Update
  LoginScene.prototype.update = function() {

  };

  // Render
  LoginScene.prototype.render = function() {
    phaser.debug.cameraInfo(phaser.camera, 20, 20);
  };

  // initGame
  LoginScene.prototype.initGame = function() {
    this.state.start('Game');
  };

  // game.scenes.login = LoginScene;
  phaser.state.add('Login', LoginScene);

})();