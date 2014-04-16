(function(game){

  game.input = function(params) {
    CocoonJS.App.showTextDialog('Prompt', params.message, '', CocoonJS.App.KeyboardType.TEXT, 'Cancel', 'Ok');
    CocoonJS.App.onTextDialogFinished.addEventListener(function(text){
      params.callback && params.callback(text);
    });
  };

})(game);