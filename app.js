/**
*  js-morpg
*  Multiplayer RPG Game
*
*  Gilberto Avalos <agnosticmusic@gmail.com>
*/

var express = require('express'),
routes      = require('./routes'),
config      = require('./config'),
fs          = require('fs');

var app     = express();
var server  = app.listen(config.port);
var io      = require('socket.io').listen(server);
 
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});
 
app.configure('development', function(){
  app.use(express.errorHandler());
});

var players = [];
var nextId  = 0;

// Bootstrap models
var models_path = __dirname + '/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

// Routes
require('./routes')(app);

io.sockets.on('connection', function(socket) {
    var player;

    socket.on('logon', function(pos) {
        // Create the player
        player = { id: nextId++, x: pos.x, y: pos.y };

        // Send existing players to client
        socket.emit('players', players);

        // Send the new player to other clients
        socket.broadcast.emit('connected', player);

        // Add client to list of players
        players.push(player);
    });

    socket.on('move', function(data) {
        if (player) {
            player.x = data.x;
            player.y = data.y;

            // Broadcast position change to all other clients
            socket.broadcast.emit('moved', player);
        }
    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(player), 1);
        io.sockets.emit('disconnected', player);
    });
});

console.log("Express server listening on port " + config.port);