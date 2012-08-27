var gameAttrs = {
  radius    : 100
, gravity   : 10
, time_step : 1/30
};

var playerAttrs = {
  position : { x: 0, y: 0 }
, radius   : 10
, weight   : 15
, movement : { friction: 0.9, force: gameAttrs.radius / 2, cutoff: gameAttrs.radius / 200 }
, score    : { scale: 10 }
};

require('./client/js')(['js/lib/game'], function(Game) {

  // Create game
  var game = new Game(gameAttrs);
  var player = game.addPlayer('name', playerAttrs);

  player.setPosition({ x:45, y: 80});
  player.setVelocity({ x:0, y: 1 });
  player._bounceOfWall(game);

});