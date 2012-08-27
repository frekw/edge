define(['events', 'underscore', './vector', './player'], function(events, _, Vector, Player) {

  var Game = function(options) {
    events.EventEmitter.call(this);

    this.objects      = {};
    this.nextObjectId = 0;

    // The board of the game, a large circle
    var radius = (options && options.radius) || 100;
    this.board   = {
      center : new Vector(0, 0)
    , radius : radius
    , top    : -radius
    , left   : -radius
    , bottom : radius
    , right  : radius
    };

    this.score = {};

    this.time_step  = (options && options.time_step) || 1/60;
    this.nextUpdate = this.startTime = Date.now();
    this.updates    = 0;
  };

  Game.prototype = new events.EventEmitter();

  //
  // Simple game properties
  //

  Game.prototype.getObjects = function() {
    return _.values(this.objects);
  };

  Game.prototype.getBoard = function() {
    return this.board;
  };

  Game.prototype.getScore = function() {
    return this.score;
  };

  Game.prototype.setScore = function(score) {
    if (!_.isEqual(this.score, score)) {
      this.score = score;
      this.emit('score updated', this.score);
    }
  };

  //
  // State methods
  //

  Game.prototype.getState = function() {
    return {
      objects      : _.reduce(this.objects, function(result, object) {
                       result[object.id] = object.getState();
                       return result;
                     }, {})
    , nextObjectId : this.nextObjectId
    , board        : this.board
    , score        : this.score
    , time_step    : this.time_step
    };
  };

  Game.prototype.updateState = function(state) {
    // -- objects
    var currentIds = _.keys(this.objects)
      , newIds     = _.keys(state.objects);

    var add    = _.difference(newIds, currentIds)
      , update = _.intersection(currentIds, newIds)
      , remove = _.difference(currentIds, newIds);

    // Add new
    _.each(add, function(id) {
      this.addObject(state.objects[id]);
    }, this);

    // Update existing
    _.each(update, function(id) {
      this.objects[id].updateState(state.objects[id]);
    }, this);

    // Remove missing
    _.each(remove, function(id) {
      this.removeObject(id);
    }, this);

    // -- nextObjectId
    this.nextObjectId = state.nextObjectId;

    // -- board
    this.board = state.board;

    // -- score
    this.setScore(state.score);

    // -- time_step
    this.time_step = state.time_step;

    this.emit('state updated', this);
  };

  Game.prototype.resetGameState = function() {
    _.each(this.objects, function(object) {
      this.removeObject(object.id);
    }, this);
    this.nextObjectId = 0;
    this.score = {};
    this.nextUpdate = this.startTime = Date.now();
    this.updates    = 0;
  };

  Game.prototype.updateObjectStates = function(states) {
    // Only update existing objects, ignore add/remove
    _.each(states, function(state) {
      if (state.id in this.objects) {
        this.objects[state.id].updateState(state);
      }
    }, this);
  };

  //
  // Generic object methods
  //

  Game.prototype.getObjects = function() {
    return _.values(this.objects);
  };

  Game.prototype.getObject = function(id) {
    return this.objects[id];
  };

  Game.prototype.addObject = function(state) {
    if (state.type === Player.TYPE) {
      return this._addPlayer(Player.createFromState(state));
    } else {
      return null;
    }
  };

  Game.prototype.removeObject = function(id) {
    if (!(id in this.objects)) return false;

    var object = this.objects[id]
      , method = 'remove' + object.type;

    if (!(method in this)) return false;

    return this[method](id);
  };

  //
  // Player methods
  //

  Game.prototype.getPlayers = function() {
    return this._getObjectsOfType(Player.TYPE);
  };

  Game.prototype.getPlayer = function(id) {
    return this._getObjectOfType(id, Player.TYPE);
  };

  Game.prototype.addPlayer = function(name, attributes) {
    // Set attributes
    if (!attributes) attributes = {};
    attributes.name = name;

    // Create player
    var player = new Player(this._getNextObjectId(), attributes);

    // Randomize position
    player.randomizePosition(this);

    // Add player
    return this._addPlayer(player);
  };

  Game.prototype.removePlayer = function(id) {
    var player = this._removeObjectOfType(id, Player.TYPE);
    if (player) {
      this.emit('remove player', player);
    }
    return player;
  };

  //
  // Tick method
  //

  Game.prototype.tick = function() {
    var self = this, time, i, j
      , updateFn = function(obj) { obj.update(time, self); }
      , getXFn   = function(obj) { return obj.getPosition().x; };


    while (this.nextUpdate < (time = Date.now())) {

      // Update each object
      _.each(this.objects, updateFn);

      // Check for collisions
      //  - http://fanitis.com/2011/03/15/collision-detector-performance-trick-1/
      var by_x = _.sortBy(this.objects, getXFn);

      for (i=0; i<by_x.length - 1; i++) {
        for (j=i+1; j < by_x.length && by_x[j].getGeometry().left <= by_x[i].getGeometry().right; j++) {
          if (by_x[i].checkCollisionWithObject(by_x[j])) {
            this.emit('objects collided', by_x[i], by_x[j]);
          }
        }
      }

      this.updates += 1;
      this.nextUpdate += this.time_step * 1000;
    }

    // Update score for each player
    _.each(this.getPlayers(), function(player) {
      var score = player.calculateScore(self);
      if (!(player.id in self.score)) {
        self.score[player.id] = 0;
      }
      self.score[player.id] += score;
    });
    this.emit('score updated', this.score);

    // Update fps
    var elapsed = Date.now() - this.startTime;
    this.fps = (this.updates/elapsed*1000);
  };

  //
  // Internal methods
  //

  Game.prototype._getObjectsOfType = function(type) {
    return _.filter(this.objects, function(object) { return object.type === type; });
  };

  Game.prototype._getObjectOfType = function(id, type) {
    var object = this.objects[id];
    if (object && object.id === id && object.type === type) {
      return object;
    } else {
      return null;
    }
  };

  Game.prototype._addObject = function(object) {
    // Make sure nextObjectId is still valid
    if (object.id >= this.nextObjectId) {
      this.nextObjectId = object.id + 1;
    }

    // Ignore existing check
    // // Check if object already exists
    // if (object.id in this.objects) throw new Error('Trying to add duplicate object: ' + object.id);

    // Add object and emit
    this.objects[object.id] = object;
    this.emit('add object', object);

    return object;
  };

  Game.prototype._removeObjectOfType = function(id, type) {
    var object = this.objects[id];
    if (object && object.id === id && (!type || object.type === type)) {
      delete this.objects[id];
      this.emit('remove object', object);
      return object;
    } else {
      return false;
    }
  };

  Game.prototype._addPlayer = function(player) {
    // Add player to list of objects and emit
    this._addObject(player);
    this.emit('add player', player);

    return player;
  };

  Game.prototype._getNextObjectId = function() {
    var id = this.nextObjectId;
    this.nextObjectId += 1;
    return id;
  };

  return Game;

});