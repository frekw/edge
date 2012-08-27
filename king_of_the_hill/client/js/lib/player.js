define(['underscore', './vector', './gameobject'], function(_, Vector, GameObject) {

  /**
   * Player has the following attributes (in addition to GameObject's)
   *  - name
   *  - score
   *  - movement
   */
  var Player = function(id, attributes) {
    GameObject.call(this, id, Player.TYPE, attributes);

    // Assert width == height
    var size = this.getSize();
    if (size.width !== size.height) throw new Error('Player must have width === height');

    // Assert movement exists
    this.set('movement', _.clone(this.get('movement')) || { friction: 0.9, force: 0.3, cutoff: 0.01 });

    // Create acceleration information
    this.get('movement').acceleration = { x:0, y:0 };
  };

  Player.TYPE = 'Player';

  GameObject.extend(Player);

  Player.prototype.getName = function() {
    return this.get('name');
  };

  Player.prototype.move = function(direction) {
    var movement = this.get('movement')
      , v        = new Vector(direction);

    // Normalize over movement force
    v = v.scalarMulti(movement.force / v.norm());

    // Set direction of burst (change existing burts)
    movement.acceleration.x = v.x;
    movement.acceleration.y = v.y;
  };

  Player.prototype.stop = function() {
    var movement = this.get('movement');
    movement.acceleration.x = 0;
    movement.acceleration.y = 0;
    this.emit('stopped', this);
  };

  Player.prototype.randomizePosition = function(game) {
    var board  = game.getBoard()
      , radius = board.radius;

    // Create random vector
    var pos = new Vector(Math.random() - 0.5, Math.random() - 0.5).unit();

    // Position at 80% of (radius - player radius)
    pos = pos.scalarMulti(0.8 * (radius - this.getRadius()));

    // Update position
    this.setPosition(pos);
  };

  Player.prototype.calculateScore = function(game) {
    var pos   = this.getPosition()
      , board = game.getBoard()
      , scale = this._attributes.score.scale || 1;

    // Score based on proximity to game center
    var dist  = pos.norm()
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
    if (Math.abs(velocity.x) < movement.cutoff) velocity.x = 0;
    if (Math.abs(velocity.y) < movement.cutoff) velocity.y = 0;

    // Invoke super method to update object
    GameObject.prototype._updateObject.apply(this, arguments);

    // Bounce of wall
    this._bounceOfWall(game, position, velocity);

    // Check if player stopped and emit
    if (before > 0 && velocity.x === 0 && velocity.y === 0) {
      this.emit('still', this);
    }
  };

  Player.prototype._bounceOfWall = function(game, position, velocity) {
    var p1     = position
      , v1     = velocity
      , radius = this.getRadius()
      , board  = game.getBoard();

    // Distance to center of board
    var dist = p1.norm();

    // Check if part of player is outside boundry
    if (dist + radius < board.radius) {
      // Inside boundry, return
      return;
    }

    // console.log('Player("%s")._bounceOfWall(%d + %d >= %d)', this.getName(), dist, radius, board.radius);

    // Find intersection point with game boundry
    // TODO: Use velocity to back-track time of collision and calculate correct position
    // console.log('Player._bounceOfWall() p1 = ', p1, (board.radius - radius) / dist);
    var p2 = p1.scalarMulti((board.radius - radius) / dist);
    // console.log('Player._bounceOfWall() p2 = ', p2);

    // Update position
    position.x = p2.x;
    position.y = p2.y;

    // Check if player is moving towards wall, project speed onto position vector
    if (v1.dotProd(p1) < 0) {
      // Moving towards center
      return;
    }

    // Calculate normal vector for game boundry
    var N = p2.unit();

    // console.log('Player._bounceOfWall() N = ', N);

    // Project velocity onto N
    var vn = v1.scalarProj(N);

    // console.log('Player._bounceOfWall() vn = ', vn);

    // New velocity is v' = v - 2 * projN(v)
    var v2 = v1.sub(vn.scalarMulti(2));
    // console.log('Player._bounceOfWall() v2 = ', v2);
    velocity.x = v2.x;
    velocity.y = v2.y;
  };

  return Player;

});