!function(root){

	// App variables
	var app = root.app = {
		entities     : {},
		otherPlayers : {}
	};

	var socket,
	noop = function(){};

	var gameWidth = 800,
	gameHeight    = 600;

	if (window.outerWidth < 1024) {
		$('#game')
			.css('width', window.outerWidth)
			.css('height', window.outerHeight);

		gameWidth  = window.outerWidth;
		gameHeight = window.outerHeight;
	}

	// Add player
	app.addPlayer = function(player) {
		me.ObjectSettings.spritewidth  = 32;
		me.ObjectSettings.spriteheight = 32;
		me.ObjectSettings.image        = "character";

		app.otherPlayers[player.id]    = new app.entities.Character(player.x, player.y, me.ObjectSettings);
		app.otherPlayers[player.id].z  = 3;

		me.game.add(app.otherPlayers[player.id]);
		me.game.sort();
	};

	// Resources
	app.resources = [
		{ name: "desert1",          type: "image", src: "data/desert1.png" },
		{ name: "desert",           type: "tmx",   src: "data/desert.tmx" },
		{ name: "character",        type: "image", src: "data/sprites/characters.png" }
	];

	var PlayScreen = me.ScreenObject.extend({
	    onResetEvent: function() {
	        // stuff to reset on state change
	        me.levelDirector.loadLevel("desert");
	    },
	    onDestroyEvent: function() {
	    }
	});

	app.game = {
		onload: function() {

	        if (!me.video.init('game', gameWidth, gameHeight, true, 1.0)) {
				alert("Sorry but your browser does not support html 5 canvas.");
				return;
	        }

	        // debug panel
	        me.plugin.register.defer(debugPanel, "debug");

	        // initialize the "audio"
	        me.audio.init("mp3,ogg");

	        // set all resources to be loaded
	        me.loader.onload = this.loaded.bind(this);

	        // set all resources to be loaded
	        me.loader.preload(app.resources);

	        // load everything & display a loading screen
	        me.state.change(me.state.LOADING);
	    },

	    loaded: function() {
	        // set the "Play/Ingame" Screen Object
	        me.state.set(me.state.PLAY, new PlayScreen());

	        // add our player entity in the entity pool
	        me.entityPool.add("mainPlayer", app.entities.Player);

	        // enable the keyboard
	        me.input.bindKey(me.input.KEY.LEFT,  "left");
	        me.input.bindKey(me.input.KEY.RIGHT, "right");
	        me.input.bindKey(me.input.KEY.UP,    "up");
	        me.input.bindKey(me.input.KEY.DOWN,  "down");

	        //me.debug.renderHitBox = true;

	        // start the game
	        me.state.change(me.state.PLAY);
	    }

	};

	app.localPlayerCreated = function(playerEntity) {
		var player = app.player = playerEntity;
		socket     = io.connect();

		var lastPosition = {};

	    socket.on('connect', function() {
	        socket.emit('logon', player.pos);
	    });

	    socket.on('players', function(players) {
	        console.log('Players: ', players);

	        _.each(players, function(player){
	        	app.addPlayer(player);
	        });

	        function sendPosition() {
	        	if(lastPosition.x !== player.pos.x || lastPosition.y !== player.pos.y){
	            	socket.emit('move', player.pos);
					lastPosition.x = player.pos.x;
					lastPosition.y = player.pos.y;
	            }
	            timeout = setTimeout(sendPosition, 200);
	        }

	        // We're connected and have sent out initial position, start sending out updates
	        timeout = setTimeout(sendPosition, 200);
	    });

	    socket.on('moved', function(player) {
	        console.log("Moved: " + player.id + " " + player.x + "," + player.y);
	        var character = app.otherPlayers[player.id]
	        if (character) {
	            character.destinationX = player.x;
	            character.destinationY = player.y;
	        }
	    });

	    socket.on('connected', function(player) {
	        console.log('Connected: ', player);
	        app.addPlayer(player);
	    });

	    socket.on('disconnected', function(player) {
	        console.log('Disconnected: ', player);
	        // TODO: Figure out how to remove characters from the map
	        var character = app.otherPlayers[player.id];
	        me.game.remove(character);me.state.pause
	        delete app.otherPlayers[player.id];
	    });
	};

	// Export to window
	root.app = app;

	// Ready?
	window.onReady(function() {
		// Disable pause/resume
		me.state.pause     = noop;
		me.state.resume    = noop;
		me.sys.pauseOnBlur = false;

		// Load game
	    app.game.onload();
	});

}(window);