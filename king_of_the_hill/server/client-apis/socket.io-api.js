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
    if (!scoreTimeout) {
      io.sockets.emit('score updated', score);
      scoreTimeout = setTimeout(function() { scoreTimeout = null; }, 5000);
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
    , move, stop, still
    , socket_move, socket_stop, socket_leave_game;

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

    player.on('move', move = function(direction) {
      // Broadcast player move
      io.sockets.emit('move player', player.id, player.getState(), direction);
    });

    player.on('stop', stop = function() {
      // Broadcast player stop
      io.sockets.emit('stop player', player.id, player.getState());
    });

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

  socket.on('move', socket_move = function(direction) {
    if (player == null) return;

    // Start moving
    player.move(direction);
  });

  socket.on('stop', socket_stop = function(direction) {
    if (player == null) return;

    // Stop player
    player.stop();
  });

  socket.on('leave game', socket_leave_game = function() {
    if (player == null) return;

    // Remove player from game
    game.removePlayer(player.id);

    // Remove listeners from player
    player.removeListener('move', move);
    player.removeListener('stop', stop);
    player.removeListener('still', still);
    move = stop = still = null;

    // Remove listeners from socket
    socket.removeListener('move', socket_move);
    socket.removeListener('stop', socket_stop);

    // Clear player
    player = null;

    // Emit response
    socket.emit('game left');
  });

  socket.on('disconnect', socket_leave_game);

}