define(['raphael', 'underscore', './gameview'], function(Raphael, _, GameView) {

  var RaphaelGameView = GameView.extend({

    render: function() {
      // Invoke GameView.render
      GameView.prototype.render.apply(this, arguments);

      // Setup Raphael
      this.raphael = Raphael(this.el);

      // Setup background
      var board = this.game.getBoard();
      this.background = this.raphael.background(board.center, board.radius, this.options.background);

      // Setup camera
      this.camera = this.raphael.camera(this.game, this.options.camera);
    },

    socketPlayerMove: function(player) {
      console.log('RaphaelGameView.socketPlayerMove()');
      this._socketPlayerUpdated(player);
    },

    socketPlayerStop: function(player) {
      console.log('RaphaelGameView.socketPlayerStop()');
      this._socketPlayerUpdated(player);
    },

    socketPlayerStill: function(player) {
      console.log('RaphaelGameView.socketPlayerStill()');
      this._socketPlayerUpdated(player);
    },

    _socketPlayerUpdated: function(player) {
      var options = this.options.players || {};
      if (options.updated) {
        // Flash to singal update from server
        player.view.flash(options.updated);
      }
    },

    _setPlayer: function(player) {
      console.log('RaphaelGameView._setPlayer()');
      player.view.setActive(true);
      this.camera.setActivePlayer(player);
    },

    _unsetPlayer: function(player) {
      player.view.setActive(false);
      this.camera.setActivePlayer(null);
    },

    _gameStateUpdated: function(game) {
      var board = game.getBoard();

      // Update background based on board size
      this.background.resize(board.center, board.radius);

      // Update camera
      this.camera.update();
    },

    _playerAdded: function(player) {
      console.log('RaphaelGameView._playerAdded()');
      // Invoke GameView._playerAdded
      GameView.prototype._playerAdded.apply(this, arguments);

      // Create player view
      player.view = this.raphael.player(player, this.options.players);

      // Check active
      if (player.id === this.playerId) {
        player.view.setActive(true);
        this.camera.setActivePlayer(player);
      }

      // Initial position
      player.view.move(player.getPosition());
    },

    _playerRemoved: function(player) {
      // Invoke GameView._playerRemoved
      GameView.prototype._playerRemoved.apply(this, arguments);

      // Remove player view
      player.view.remove();
    },

    _objectsCollided: function(obj1, obj2) {
      var options = this.options.players || {};
      if (options.collision) {
        // Flash to singal collision
        obj1.view.flash(options.collision);
        obj2.view.flash(options.collision);
      }
    },

    _objectSizeUpdated: function(obj, size) {
      obj.view.resize(obj.getRadius());
    },

    _objectPositionUpdated: function(obj, pos) {
      // Move player
      obj.view.move(pos);

      // Notify camera of move
      this.camera.playerMove(obj);
    }

  });

  //
  // Raphael extensions
  //

  Raphael.fn.camera = function(game, options) {
    var raphael = this
      , type    = options.type
      , width   = options.width
      , height  = options.height
      , player  = null;

    var update = function() {
      if (type === 'player' && player) {
        // Center around player
        var pos = player.getPosition();
        raphael.setViewBox(pos.x - width / 2, pos.y - height / 2, width, height, false);
      } else {
        // Show full board
        var gameRadius = game.getBoard().radius;
        raphael.setViewBox(-gameRadius, -gameRadius, gameRadius * 2, gameRadius * 2, false);
      }
    };

    update();

    return {
      setActivePlayer: function(player_) {
        player = player_;
        update();
      },
      playerMove: function(player_) {
        if (type === 'player' && player && player.id === player_.id) {
          update();
        }
      },
      update: update
    };

  };

  Raphael.fn.background = function(c, r, options) {
    var set   = this.set()
      , color = Raphael.color(options.color)
      , i, r_i, color_i, i_len = options.circles || 5;

    // Make smaller and smaller circles with darker color
    for (i=i_len; i>0; i--) {
      r_i = r * (i / i_len);
      color_i = Raphael.hsl(color.h, color.s, 0.2 + 0.8 * (i / i_len));
      set.push(
        this.circle(c.x, c.y, r_i)
          .attr({ fill:color_i, stroke: 'none' }))
          .data({ i:i }
      );
    }

    // Optional options for outer and inner circles
    if (options.outer) set[0].attr(options.outer);
    if (options.inner) set[i_len - 1].attr(options.inner);

    // Handle resize
    set.resize = function(c, r) {
      var i, r_i;
      for (i=i_len; i>0; i--) {
        r_i = r * (i / i_len);
        set[i_len - i].attr({ cx: c.x, cy: c.y, r: r_i });
      }
    };

    return set;
  };

  Raphael.fn.player = function (player, options) {
    var set    = this.set()
      , radius = player.getRadius()
      , active = false
      , attr   = _.extend({}, options.attrs, { 'stroke-width': 1 })
      , circle = this.circle(0, 0, radius).attr(attr)
      , name   = this.text(0, 0, player.getName()).attr({ 'font-size': 6 });

    set.push(circle, name);

    var stroke = circle.attr('stroke');

    set.setActive = function(active_) {
      active = active_;
      circle.attr(active ? options.active : options.attrs);
      stroke = circle.attr('stroke');
    };

    var flashTimeout;
    set.flash = function(color) {
      circle.attr({ stroke: color, 'stroke-width': 3 });
      if (flashTimeout) clearTimeout(flashTimeout);
      flashTimeout = setTimeout(function() {
        circle.attr({ stroke: stroke, 'stroke-width': 1 });
      }, 100);
    };

    set.move = function(pos) {
      set.transform('t' + pos.x + ',' + pos.y);
    };

    set.resize = function(radius) {
      circle.attr({ r:radius });
      name.attr({ y: -radius });
    };

    return set;
  };

  // Return GameView
  return RaphaelGameView;

});