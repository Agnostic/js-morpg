/**
*  js-morpg
*  Multiplayer RPG Game
*
*  Gilberto Avalos <agnosticmusic@gmail.com>
*/

var express = require('express'),
routes      = require('./routes'),
config      = require('./config');

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
 
console.log("Express server listening on port " + config.port);