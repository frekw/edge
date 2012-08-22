var Renderer = function(elem, game, options) {
  _.bindAll(this, '_gameStateUpdated', '_scoreUpdated', '_addPlayer', '_removePlayer', '_updateObjectSize', '_updateObjectPosition');

  this.elem = elem;
  this.game = game;
  this.options = options;

  this.elem.board   = this.elem.find('#board');
  this.elem.score   = this.elem.find('#score');

  // Setup Raphael graphing
  this.raphael = this._setupRaphael(this.elem.board[0]);

  // Set initial view box
  this._updateViewBox();

  // Setup listeners on game
  this.game.on('state updated', this._gameStateUpdated);
  this.game.on('score updated', this._scoreUpdated);
  this.game.on('add player',    this._addPlayer);
  this.game.on('remove player', this._removePlayer);
};

Renderer.prototype.show = function() {
  // Show element
  this.elem.show();
};

Renderer.prototype.hide = function() {
  this.elem.hide();
};

Renderer.prototype.setSelf = function(id) {
  var prev = this.self && this.game.getObject(this.self);
  if (prev && prev.elem) {
    prev.elem.setSelf(false);
    prev.elem.stop().tranform('t' + prev.elem.getPosition().x + ',' + prev.elem.getPosition().y);
  }

  this.self = id;
  var curr = this.game.getObject(this.self);
  if (curr && curr.elem) {
    curr.elem.setSelf(false);
    this._updateViewBox();
    this._moveElement(curr.id, curr.elem, curr.getPosition());
  }
};

Renderer.prototype.gameTicked = function() {
};

Renderer.prototype.objectStateUpdated = function(object) {
  // Flash in red to singal update from server
  if (object.elem) {
    object.elem.flash('red');
  }
};

Renderer.prototype.objectsCollided = function(o1, o2) {
  // Flash in blue to singal collision
  if (o1.elem) o1.elem.flash('blue');
  if (o2.elem) o2.elem.flash('blue');
};

//
// Graphics methods
//

Renderer.prototype._setupRaphael = function(elem) {
  var options = this.options
    , board   = this.game.getBoard();

  // Create main Raphael instance
  var raphael = Raphael(elem);

  // Create set for all the objects in the world
  raphael.world = raphael.set();

  // Setup background
  this.background = raphael.background(board.center, board.radius, options.background);

  // Add background to world
  raphael.world.push(this.background);

  return raphael;
};

Renderer.prototype._updateBackground = function() {
  console.log('Renderer._updateBackground(game = %o)', this.game);
  var board = this.game.getBoard();

  // Update background based on size
  this.background.resize(board.center, board.radius);
};

Renderer.prototype._updateViewBox = function() {
  console.log('Renderer._updateViewBox(game = %o)', this.game);

  var raphael = this.raphael
    , viewBox = this.options.viewBox || {};

  if (viewBox.type === 'player' && this.self) {
    // Center around player
    console.log('Renderer._updateViewBox() center around player');
    raphael.setViewBox(-viewBox.width / 2, -viewBox.height / 2, viewBox.width, viewBox.height, false);
  } else {
    // Show full game
    var gameRadius = this.game.getBoard().radius;
    console.log('Renderer._updateViewBox() show full game (%s)', gameRadius);
    raphael.setViewBox(0, 0, gameRadius * 2, gameRadius * 2, false);
  }
};

Renderer.prototype._moveElement = function(id, elem, pos) {
  var raphael = this.raphael
    , viewBox = this.options.viewBox || {};

  if (viewBox.type === 'player' && this.self && this.self === id) {
    console.log('move world instead of player');
    raphael.world.stop().animate({ transform: 't' + -pos.x + ',' + -pos.y }, 100);
  } else {
    console.log('move player %s !== %s', this.self, id);
    elem.stop().animate({ transform: 't' + pos.x + ',' + pos.y }, 100);
  }
};

//
// Event handlers
//

Renderer.prototype._gameStateUpdated = function(game) {
  console.log('Renderer._gameStateUpdated(%o)', game);
  // Update background
  this._updateBackground();

  // Update view box
  this._updateViewBox();
};

Renderer.prototype._scoreUpdated = function(score) {
  this.elem.score.find('.value').text(score);
};

Renderer.prototype._addPlayer = function(player) {
  var raphael = this.raphael
    , pos     = player.getPosition()
    , radius  = player.getRadius()
    , world   = raphael.world;

  // Create player elem
  player.elem = raphael.player(player, this.options.player);

  // Check self
  if (player.id === this.self) {
    player.self = true;
    player.elem.setSelf(true);
  }

  // Add player to world
  world.push(player.elem);

  // Add element
  this._updateObjectSize(player);
  this._updateObjectPosition(player);

  // Listen for player updates
  player.on('move', this._updateObjectPosition);
};

Renderer.prototype._removePlayer = function(player) {
  // Remove player elem
  player.elem.remove();
  // Remove listeners
  player.removeListener('move',   this._updateObjectPosition);
};

Renderer.prototype._updateObjectSize = function(object) {
  console.log('resize player %o', object);
  object.elem.resize(object.getRadius());
};

Renderer.prototype._updateObjectPosition = function(object) {
  this._moveElement(object.id, object.elem, object.getPosition());
};

//
// Raphael extensions
//

Raphael.fn.background = function(center, radius, options) {
  var elem       = this.set()
    , background = this.circle(center.x, center.x, radius).attr(options)
    , bullseye   = this.circle(center.x, center.x, radius / 50).attr(options.bullseye);

  elem.push(background, bullseye);

  elem.resize = function(center, radius) {
    background.attr({ cx: center.x, cy: center.x, r: radius });
    bullseye.attr({ cx: center.x, cy: center.y, r: radius / 50 });
  };

  return elem;
};

Raphael.fn.player = function (player, attrs) {
  var elem   = this.set()
    , radius = player.getRadius()
    , circle = this.circle(0, 0, radius).attr(attrs)
    , name   = this.text(0, -radius, player.getName());

  elem.push(circle, name);

  // Special methods for updating circle

  elem.setSelf = function(self) {
   circle.attr({ 'stroke-width': self ? 2 : 1 });
  };

  var color = circle.attr('fill');
  elem.flash = function(color_) {
    circle.animate({ fill:color_ }, 100, "elastic", function() {
      circle.animate({ fill:color }, 100, "elastic");
    });
  };

  elem.resize = function(radius) {
    circle.attr({ r:radius });
    name.attr({ y: -radius });
  };

  return elem;
};