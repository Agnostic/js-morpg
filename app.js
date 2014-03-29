/**
*  js-morpg
*  Multiplayer RPG Game
*
*  Gilberto Avalos <avalosagnostic@gmail.com>
*/

// Dependences
var express    = require('express'),
config         = require('./config'),
fs             = require('fs'),
mongoose       = require('mongoose'),
MongoStore     = require('connect-mongo')(express),
io             = require('socket.io'),
cookie         = require('cookie');

// Init express & Socket.io
var app        = express();
var server     = app.listen(config.port);
var sio        = io.listen(server);

// Bootstrap db connection
var db         = mongoose.connect(config.db, { auto_reconnect: true });

// Set up mongoStore
var mongoStore = new MongoStore({
  db         : db.connection.db,
  collection : config.sessionCollection
});

// socket.io authorization handler (handshake)
sio.set('authorization', function (data, callback) {
  if(!data.headers.cookie) {
      return callback('No cookie transmitted.', false);
  } else {

    data.cookie = cookie.parse(data.headers.cookie);
    if(data.cookie[config.sessionKey]){
      var sessionID = data.cookie[config.sessionKey].split(":");
      sessionID     = sessionID[1].split(".");
      sessionID     = sessionID[0];

      // Get session from mongoStore
      mongoStore.get(sessionID, function(err, session){
        if(session){
          data.session = session;
          callback(null, true);
        } else {
          callback('Not logged in', false);
        }
      });
    } else {
      callback('Not logged in', false);
    }
  }
});

// Express configuration
app.configure(function(){
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());

  // Express/Mongo session storage
  app.use(express.session({
    key    : config.sessionKey,
    secret : config.sessionSecret,
    store  : mongoStore
  }));

  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var walk = function(path, _app) {
  fs.readdirSync(path).forEach(function(file) {
    var newPath = path + '/' + file;
    var stat    = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js$|coffee$)/.test(file)) {
        if(_app){
          require(newPath)(_app);
        } else {
          require(newPath);
        }
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};

// Bootstrap models
var models_path = __dirname + '/app/models';
walk(models_path, null);

// Bootstrap routes
var routes_path = __dirname + '/app/routes';
walk(routes_path, app);

// Socket.io
sio.sockets.on('connection', function(socket) {
    require('./app/socket_events')(sio, socket);
});

console.log(config.gameTitle + ' server listening on port ' + config.port);