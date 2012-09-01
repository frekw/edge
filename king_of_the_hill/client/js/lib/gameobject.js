define(['events', 'underscore', './vector'], function(events, _, Vector) {

  /**
   * GameObject is a circular object in the game and has the following attributes:
   *  - p {x, y} (position of object center)
   *  - radius (size)
   *  - v {x, y} (current velocity)
   */
  var GameObject = function(id, type, attributes) {
    events.EventEmitter.apply(this, []);

    if (!type) {
      throw new Error('Cannot create GameObject without type');
    }

    // Clone attributes to preserve them
    attributes = attributes ? _.clone(attributes) : {};

    this.id   = id;
    this.type = type;

    // Set position, size, velocity and weight and remove from attributes
    this.position = new Vector(attributes.position || { x: 0, y: 0 });
    delete attributes.position;
    this.radius   = 'radius' in attributes ? attributes.radius : 1;
    delete attributes.size;
    this.velocity = new Vector(attributes.velocity || { x: 0, y: 0 });
    delete attributes.velocity;
    this.weight   = 'weight' in attributes ? attributes.weight : 1;
    delete attributes.weight;

    // Set remaining attributes
    this._attributes = attributes;
  };

  GameObject.prototype = new events.EventEmitter();

  var empty_constructor = function() {};
  empty_constructor.prototype = GameObject.prototype;
  GameObject.extend = function(constructor) {
    constructor.prototype = new empty_constructor();
    constructor.createFromState = _.bind(GameObject.createFromState, null, constructor);
  };

  GameObject.createFromState = function(constructor, state) {
    var object = new constructor(state.id, {});
    object.updateState(state);
    return object;
  };

  GameObject.prototype.get = function(name) {
    return this._attributes[name];
  };

  GameObject.prototype.set = function(name, value) {
    this._attributes[name] = value;
  };

  GameObject.prototype.getPosition = function() {
    return this.position;
  };

  GameObject.prototype.setPosition = function(position_) {
    var position = this.getPosition();
    if (position.x !== position_.x || position.y !== position_.y) {
      position.x = position_.x;
      position.y = position_.y;
      this.emit('change position', this, position);
    }
  };

  GameObject.prototype.getRadius = function() {
    return this.radius;
  };

  GameObject.prototype.setRadius = function(radius) {
    if (this.radius !== radius) {
      this.radius = radius;
      this.emit('change radius', this, radius);
    }
  };

  GameObject.prototype.getSize = function() {
    return { width: this.radius * 2, height: this.radius * 2 };
  };

  GameObject.prototype.getVelocity = function() {
    return this.velocity;
  };

  GameObject.prototype.setVelocity = function(velocity_) {
    var velocity = this.getVelocity();
    if (velocity.x !== velocity_.x || velocity.y !== velocity_.y) {
      velocity.x = velocity_.x;
      velocity.y = velocity_.y;
      this.emit('change velocity', this, velocity);
    }
  };

  GameObject.prototype.getWeight = function() {
    return this.weight;
  };

  GameObject.prototype.setWeight = function(weight) {
    if (this.weight !== weight) {
      this.weight = weight;
      this.emit('change weight', this, weight);
    }
  };

  GameObject.prototype.getGeometry = function() {
    var position = this.getPosition()
      , radius   = this.getRadius()
      , result = {
          left   : position.x - radius
        , right  : position.x + radius
        , top    : position.y - radius
        , bottom : position.y + radius
        , width  : radius * 2
        , height : radius * 2
        };
    return result;
  };

  GameObject.prototype.getState = function() {
    var state  = {};
    state.id   = this.id;
    state.type = this.type;

    state.position = this.getPosition();
    state.radius   = this.getRadius();
    state.velocity = this.getVelocity();
    state.weight   = this.getWeight();

    state.attributes = this._attributes;
    return state;
  };

  GameObject.prototype.updateState = function(state) {
    this.id   = state.id;
    this.type = state.type;

    this.setPosition(state.position);
    this.setRadius(state.radius);
    this.setVelocity(state.velocity);
    this.setWeight(state.weight);

    // Update remaining attribues
    this._attributes = state.attributes;

    // Finally emit state updated
    this.emit('state updated', this);
  };

  GameObject.prototype.update = function(time, game) {
    if (this.lastUpdate) {
      var position = _.clone(this.getPosition())
        , velocity = _.clone(this.getVelocity())
        , duration = (time - this.lastUpdate) / 1000;

      this._updateObject(position, velocity, duration, game);

      // Update position and velocity possibly emitting move/change velocity
      this.setPosition(position);
      this.setVelocity(velocity);
    }
    this.lastUpdate = time;
  };

  GameObject.prototype.checkCollisionWithObject = function(other) {
    // Make sure collision is valid
    if (!this._validCollisionTarget(other)) return false;
    if (!other._validCollisionTarget(this)) return false;

    // Check overlap and movement
    if (this._overlapsObject(other) && this._movingTowards(other)) {
      // Update object according to collision
      this._performCollision(other);
      return true;
    } else {
      return false;
    }
  };

  GameObject.prototype._updateObject = function(position, velocity, duration, game) {
    // Update position
    position.x += velocity.x * duration;
    position.y += velocity.y * duration;
  };

  GameObject.prototype._validCollisionTarget = function(other) {
    return true;
  };

  GameObject.prototype._overlapsObject = function(other) {
    /**
     * Check if distance between centers is less than r1 + r2
     */
    var p1 = this.getPosition()
      , r1 = this.getRadius()
      , p2 = other.getPosition()
      , r2 = other.getRadius();

    return p1.dist(p2) <= (r1 + r2);
  };

  GameObject.prototype._movingTowards = function(other) {
    /**
     * Idea is to project the difference in speed onto the line that
     * connects the centre of the two objects. If this projection is
     * negative the objects are moving towards each other.
     */
    var p1 = this.getPosition()
      , v1 = this.getVelocity()
      , p2 = other.getPosition()
      , v2 = other.getVelocity();

    var d  = p2.sub(p1)
      , dv = v2.sub(v1);
    return d.dotProd(dv) < 0;
  };

  GameObject.prototype._performCollision = function(other) {
    var p1 = this.getPosition()
      , v1 = this.getVelocity()
      , r1 = this.getRadius()
      , m1 = this.getWeight()
      , p2 = other.getPosition()
      , v2 = other.getVelocity()
      , r2 = other.getRadius()
      , m2 = other.getWeight();

    var px = p1.x - p2.x;
    var py = p1.y - p2.y;
    var vx = v1.x - v2.x;
    var vy = v1.y - v2.y;
    var R  = r1 + r2;

    // Find the exact time of the collision
    var p = - (2 * (px*vx + py*vy)/(vx*vx + vy*vy) );
    var q = (px*px + py*py - R*R)/(vx*vx + vy*vy);
    var tao = - p/2 + Math.sqrt( (p*p/4) - q);
    if (isNaN(tao) || tao < 0){
      tao = 0;
    }

    // Update placements with the true position at collision
    p1 = p1.sub(v1.scalarMulti(tao)); // p1 = p1 - tao * v1
    p2 = p2.sub(v2.scalarMulti(tao)); // p2 = p2 - tao * v2

    // Calculate distance and angle between objects
    var d   = p2.sub(p1)
      , phi = -d.angleRad();

    // Rotate basis phi degrees using the matrix:
    //  [cos(phi) -sin(phi); sin(phi)  cos(phi)] * [v.x, v.y]'
    //  o*V*Prim are all pre collision speeds in the new basis.
    var vPrim1 = v1.rotateRad(phi);
    var vPrim2 = v2.rotateRad(phi);

    // Calculate the corresponding values after collision:
    //  u1_x* = (v1_x*(m1 - m2) + 2m2 * v2_x* ) / (m1 + m2)
    //  u2_x* = (v2_x*(m2 - m1) + 2m1 * v1_x* ) / (m1 + m2)
    //  o1.m is the mass [kg] of the object.
    var uPrim1 = new Vector((vPrim1.x * (m1 - m2) + 2*m2 * vPrim2.x) / (m1 + m2), vPrim1.y);
    var uPrim2 = new Vector((vPrim2.x * (m2 - m1) + 2*m1 * vPrim1.x) / (m1 + m2), vPrim2.y);

    // New speed for o1 is [o1UxPrim, o1VyPrim] and for o2 [o2UxPrim, o2VyPrim]
    //  all the are expressed using the new basis.
    // Transform these into the regular basis by applying the inverse rotation.
    //  Rinv(phi) = [cos(phi) sin(phi); -sin(phi) cos(phi)]
    var u1 = uPrim1.rotateRad(-phi)
      , u2 = uPrim2.rotateRad(-phi);

    // Estimate the position tao seconds after the collision.
    p1 = p1.add(u1.scalarMulti(tao)); // p1 = p1 + tao * v1_
    p2 = p2.add(u2.scalarMulti(tao)); // p2 = p2 + tao * v2_

    // Update position and velocities on both of the objects
    this.setPosition(p1);
    this.setVelocity(u1);
    other.setPosition(p2);
    other.setVelocity(u2);
  };

  return GameObject;

});