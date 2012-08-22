var GameObject = require('./gameobject')
  , Vector     = require('./vector');

/**
 * Player has the following attributes (in addition to GameObject's)
 *  - name
 *  - score
 *  - movement
 */
var Player = module.exports = function(id, attributes) {
  GameObject.call(this, id, Player.TYPE, attributes);

  // Assert width == height
  var size = this.getSize();
  if (size.width !== size.height) throw new Error('Player must have width === height');

  // Assert movement exists
  this.set('movement', _.clone(this.get('movement')) || { friction: 0.9, force: 0.3 });

  // Create acceleration information
  this.get('movement').acceleration = { x:0, y:0 };
};

Player.TYPE = 'Player';

GameObject.extend(Player);

Player.prototype.getName = function() {
  return this.get('name');
};

Player.prototype.move = function(direction) {
  console.log('Player("%s").move("%o")', this.getName(), direction);

  var movement = this.get('movement')
    , v        = new Vector(direction);

  // Normalize over movement force
  v = v.scalarMulti(movement.force / v.norm());

  // Set direction of burst (change existing burts)
  movement.acceleration.x = v.x;
  movement.acceleration.y = v.y;
};

Player.prototype.stop = function() {
  console.log('Player("%s").stop()');
  var movement = this.get('movement');
  movement.acceleration.x = 0;
  movement.acceleration.y = 0;
  this.emit('stopped', this);
};

Player.prototype.randomizePosition = function(game) {
  var board  = game.getBoard()
    , radius = board.radius;

  // Create random vector
  var pos = new Vector(Math.random() - 0.5, Math.random() - 0.5);

  // Position at 80% of radius
  pos = pos.unit().scalarMulti(radius * 0.8);

  // Update position
  this.setPosition(pos);
};

Player.prototype.calculateScore = function(game) {
  var pos   = this.getPosition()
    , board = game.getBoard()
    , scale = this._attributes.score.scale || 1;

  // Score based on proximity to game center
  var dist  = pos.dist(board.center)
    , score = 1 - (dist / board.radius);

  return Math.pow(score, 2) * scale;
};

Player.prototype._updateObject = function(position, velocity, duration, game) {
  var movement = this.get('movement')
    , before   = Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2);

  // Adjust velocity using friction and acceleration
  velocity.x = (1 - movement.friction * duration) * velocity.x + duration * movement.acceleration.x;
  velocity.y = (1 - movement.friction * duration) * velocity.y + duration * movement.acceleration.y;

  // Prevent too small values for velocity
  if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
  if (Math.abs(velocity.y) < 0.01) velocity.y = 0;

  // Invoke super method to update object
  GameObject.prototype._updateObject.apply(this, arguments);

  // Bounce of wall
  this._bounceOfWall(game);

  // Check if player stopped and emit
  if (before > 0 && velocity.x === 0 && velocity.y === 0) {
    this.emit('still', this);
  }
};

Player.prototype._bounceOfWall = function(game) {
  var p1     = this.getPosition()
    , v1     = this.getVelocity()
    , radius = this.getRadius()
    , board  = game.getBoard();

  // Distance from center of player to center of board
  var dist = p1.dist(board.center);

  // Check if part of player is outside boundry
  if (dist + radius < board.radius) {
    // Inside boundry, return
    return;
  }

  // Find intersection point with game boundry
  var p2 = p1.scalarMulti(board.radius / dist);

  // Position inside border
  // TODO: Use velocity to back-track time of collision and calculate correct position
  var partOfBoardRadius = (board.radius - radius) / board.radius;
  this.setPosition(p2.scalarMulti(partOfBoardRadius));

  // Calculate normal vector for game boundry
  var N = p2.sub(board.center).unit();

  // Project velocity onto N
  var vn = v1.scalarProj(N);

  // New velocity is v' = v - 2 * projN(v)
  var v2 = v1.sub(vn.scalarMulti(2));
  this.setVelocity(v2);
};

Player.prototype._distanceFromCenter = function(game) {
  // Use vectors for position and board center
  return this.getPosition().dist(game.getBoard().center);
};