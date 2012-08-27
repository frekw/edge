var SocketIO = require('socket.io');

/**
 * Start to listen for incoming SocketIO connection and
 * communicate with players over the socket connections.
 */
exports.listen = function(server, game, playerAttrs) {
  var io = SocketIO.listen(server);

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

  // Listen for incoming connections
  io.sockets.on('connection', function(socket) {
    handleConnection(game, io, socket, playerAttrs);
  });

  // Forward game events to clients over socket.io

  game.on('add object', function(object) {
    io.sockets.emit('add object', object.getState());
  });

  game.on('remove object', function(object) {
    io.sockets.emit('remove object', object.id);
  });

  var scoreTimeout;
  game.on('score updated', function(score) {
    // TODO: Only send score updates once every 5 seconds
    if (!scoreTimeout) {
      scoreTimeout = setTimeout(function() {
        io.sockets.emit('score updated', score);
        scoreTimeout = null;
      }, 5000);
    }
  });

  game.on('objects collided', function(o1, o2) {
    io.sockets.emit('objects collided', o1.id, o1.getState(), o2.id, o2.getState());
  });

};

/**
 * Handle SocketIO connections
 */
function handleConnection(game, io, socket, playerAttrs) {
  var player = null
    , still, leave_game;

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
      return socket.emit('join failed', 'name exists', name);
    }

    // Add player to game
    player = game.addPlayer(name, playerAttrs);

    //
    // Listen for player events
    //

    player.on('still', still = function() {
      // Broadcast player still
      io.sockets.emit('still player', player.id, player.getState());
    });

    // Emit success and player info to player
    socket.emit('game joined', player.id);
  });

  //
  // Messages applicable for joined players
  //

  socket.on('move', function move(direction) {
    if (player == null) return;

    // Start moving
    player.move(direction);

    // Broadcast player move
    io.sockets.emit('move player', player.id, player.getState(), direction);
  });

  socket.on('stop', function stop(direction) {
    if (player == null) return;

    // Stop player
    player.stop();

    // Broadcast player stop
    io.sockets.emit('stop player', player.id, player.getState());
  });

  socket.on('leave game', leave_game = function() {
    if (player == null) return;

    // Remove player from game
    game.removePlayer(player.id);

    // Remove listeners from player
    player.removeListener('still', still);

    // Clear player
    player = null;

    // Emit response
    socket.emit('game left');
  });

  socket.on('disconnect', leave_game);

}