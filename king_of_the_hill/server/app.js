var express = require('express')
  , stylus  = require('stylus')
  , fs      = require('fs')
  , path    = require('path');

// Static configuration
var ROOT_DIR      = path.join(__dirname, '..')
  , STATIC_DIR    = path.join(ROOT_DIR, 'static')
  , CLIENT_DIR    = path.join(ROOT_DIR, 'client')
  , VIEW_DIR      = path.join(CLIENT_DIR, 'jade')
  , CLIENT_JS_DIR = path.join(CLIENT_DIR, 'js')
  , GAME_JS       = path.join(ROOT_DIR, 'lib', 'game.js');

/**
 * Setup express
 */
var app = module.exports = express.createServer();

app.configure(function(){

  app.set('views', VIEW_DIR);
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  // Plugins
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'king-of-the-hill' }));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use('/js', express['static'](CLIENT_JS_DIR));
  app.use(stylus.middleware({ src: CLIENT_DIR, dest: STATIC_DIR }));
  app.use(express['static'](STATIC_DIR));

});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

/**
 * Application
 */

app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Browserify
 */

var bundle = require('browserify')({ exports: ['require'] });
bundle.addEntry(GAME_JS);
app.use(bundle);

/**
 * Socket.IO
 */

var io = app.io = require('socket.io').listen(app);

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging
io.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

// Need to pollute global namespace with underscore
global._ = require(path.join(STATIC_DIR, 'js', 'underscore.js'));

var Game = require(GAME_JS);

var game_attributes = {
  radius    : 500
, gravity   : 10
, time_step : 1/30
};

var player_attributes = {
  position : { x: game_attributes.radius / 2, y: game_attributes.radius / 2 }
, radius   : 10
, weight   : 15
, speed    : 2
, movement : { friction: 0.9, force: 3 }
, score    : { scale: 10 }
};

// Create game
var game = new Game(game_attributes);

// Trigger update of game according to time_step
var ticks = 0, start = Date.now();
setInterval(function() {
  game.tick();
  ticks++;
}, game_attributes.time_step * 1000);

// setInterval(function() {
//   console.log('tps = %s', (ticks / (Date.now() - start) * 1000).toFixed(2));
// }, 1000);

//
// Handle SocketIO connections
//
io.sockets.on('connection', function(socket) {
  var player = null;

  //
  // Messages applicable for all connected clients
  //

  socket.on('get game state', function() {
    socket.emit('game state', game.getState());
  });

  // Handle `join game`
  socket.on('join game', function(name) {
    if (player) {
      return socket.emit('join failed', 'already joined game');
    }

    // Make sure name is valid
    var nameExists = game.getPlayers().some(function(p) { return p.get('name') === name; });
    if (nameExists) {
      return socket.emit('join failed', 'name exists');
    }

    // Add player to game
    player = game.addPlayer(name, player_attributes);
    player.randomizePosition(game);

    // Listen for events on player
    player.on('still', function() {
      // Broadcast player still
      io.sockets.emit('still player', player.id, player.getState());
    });

    // Emit success and player info to player
    socket.emit('game joined', player.id);
  });

  //
  // The following messages are for joined players only
  //

  socket.on('move', function(direction) {
    if (!player) return;

    // Start moving
    player.move(direction);
    // Broadcast player move
    io.sockets.emit('move player', player.id, player.getState(), direction);
  });

  socket.on('stop', function(direction) {
    if (!player) return;

    // Stop player
    player.stop();
    // Broadcast player stop
    io.sockets.emit('stop player', player.id, player.getState());
  });

  function leave_game() {
    if (!player) return;

    // Remove listeners from player
    player.removeAllListeners('still');

    // Remove player from game
    game.removePlayer(player.id);

    // Clear player
    player = null;

    // Emit response
    socket.emit('game left');
  }

  // Handle leave game
  socket.on('leave game', leave_game);

  // Handle disconnect
  socket.on('disconnect', leave_game);

});

// Forward game events to clients over socket.io

game.on('add object', function(object) {
  io.sockets.emit('add object', object.getState());
});

game.on('remove object', function(object) {
  io.sockets.emit('remove object', object.id);
});

game.on('score updated', function(score) {
  // TODO: Only send score updates each 10 seconds
  io.sockets.emit('score updated', score);
});

game.on('objects collided', function(o1, o2) {
  io.sockets.emit('objects collided', o1.id, o1.getState(), o2.id, o2.getState());
});