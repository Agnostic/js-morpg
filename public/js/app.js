!function(){

	var gameWidth = 800,
	gameHeight    = 600;

	if (window.outerWidth < 1024) {
		$('#game')
			.css('width', window.outerWidth)
			.css('height', window.outerHeight);

		gameWidth  = window.outerWidth;
		gameHeight = window.outerHeight;
	}

}();