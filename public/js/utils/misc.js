(function(game){

  game.input = function(params) {
    var callback = function(text){
      params.callback && params.callback(text);
      CocoonJS.App.onTextDialogFinished.removeEventListener(callback);
    };

    CocoonJS.App.showTextDialog('Prompt', params.message, '', CocoonJS.App.KeyboardType.TEXT, 'Cancel', 'Ok');
    CocoonJS.App.onTextDialogFinished.addEventListener(callback);
  };

})(game);