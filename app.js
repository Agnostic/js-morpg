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

// socket.io authorization handler (handshake)
var cookieParser = express.cookieParser(config.sessionSecret);
io.set('authorization', function (data, callback) {
  if(!data.headers.cookie) {
      return callback('No cookie transmitted.', false);
  }

  // We use the Express cookieParser created before to parse the cookie
  cookieParser(data, {}, function(parseErr) {
    if(parseErr) { return callback('Error parsing cookies.', false); }

    // Get the SID cookie
    var sidCookie = (data.secureCookies && data.secureCookies['express.sid']) ||
                    (data.signedCookies && data.signedCookies['express.sid']) ||
                    (data.cookies && data.cookies['express.sid']);

    // Then we just need to load the session from the Express Session Store
    sessionStore.load(sidCookie, function(err, session) {
      // And last, we check if the used has a valid session and if he is logged in
      if (err || !session || !session.user._id) {
          callback('Not logged in.', false);
      } else {
        // Attach session to access from "socket.handshake.session"
        data.session = session;
        callback(null, true);
      }
    });
  });
});
 
// Express configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());

  // Express/Mongo session storage
  app.use(express.session({
    secret: config.sessionSecret,
    store: new mongoStore({
      db         : db.connection.db,
      collection : config.sessionCollection
    })
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
var models_path = __dirname + '/models';
walk(models_path, null);

// Bootstrap routes
var routes_path = __dirname + '/routes';
walk(routes_path, app);

// Socket.io
io.sockets.on('connection', function(socket) {
    require('./socket_events')(io, socket);
});

console.log(config.gameTitle + ' server listening on port ' + config.port);