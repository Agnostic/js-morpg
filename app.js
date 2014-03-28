/**
*  js-morpg
*  Multiplayer RPG Game
*
*  Gilberto Avalos <agnosticmusic@gmail.com>
*/

// Dependences
var express = require('express'),
config      = require('./config'),
fs          = require('fs'),
mongoose    = require('mongoose'),
mongoStore  = require('connect-mongo')(express);

var app     = express();
var server  = app.listen(config.port);
var io      = require('socket.io').listen(server);

// Bootstrap db connection
var db      = mongoose.connect(config.db);
 
// Express configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);

  // Express/Mongo session storage
  app.use(express.session({
    secret: config.sessionSecret,
    store: new mongoStore({
      db         : db.connection.db,
      collection : config.sessionCollection
    })
  }));
});
 
app.configure('development', function(){
  app.use(express.errorHandler());
});

var walk = function(path) {
  fs.readdirSync(path).forEach(function(file) {
    var newPath = path + '/' + file;
    var stat    = fs.statSync(newPath);
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
    require('./socket_events')(io, socket);
});

console.log(config.gameTitle + ' server listening on port ' + config.port);