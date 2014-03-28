/**
*  js-morpg
*  Multiplayer RPG Game
*
*  Gilberto Avalos <agnosticmusic@gmail.com>
*/

var express = require('express'),
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

// Bootstrap models
var models_path = __dirname + '/models';
walk(models_path);

// Bootstrap routes
var routes_path = __dirname + '/routes';
walk(routes_path);

// Socket.io
io.sockets.on('connection', function(socket) {
    require('./socket_events')(socket);
});

console.log(config.gameTitle + ' server listening on port ' + config.port);