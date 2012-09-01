




keys.on('move', function(direction) {
  socket.emit('move', direction);
});
motion.on('move', function(direction) {
  socket.emit('move', direction);
});






socket.on('move', socket_move = function(direction) {
  if (player == null) return;

  // Start moving
  player.move(direction);
});






Player.prototype.move = function(direction) {
  ...

  // Emit
  this.emit('move', direction);
};






player.on('move', move = function(direction) {
  // Broadcast player move
  io.sockets.emit('move player', player.id, player.getState(), direction);
});







socket.on('move player', function(id, state, direction) {
  var player = game.getPlayer(id);
  if (player) {
    player.updateState(state);
    player.move(direction);
    gameView.socketPlayerMove(player);
  }
});