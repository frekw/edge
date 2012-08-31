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

      return this;
    },

    toggleZoom: function() {
      GameView.prototype.toggleZoom.apply(this, arguments);
      this.camera.setZoom(this.zoom);
    },

    gameTicked: function() {
      GameView.prototype.gameTicked.apply(this, arguments);
      this._updateUI();
    },

    socketPlayerMove: function(player) {
      this._socketPlayerUpdated(player);
    },

    socketPlayerStop: function(player) {
      this._socketPlayerUpdated(player);
    },

    socketPlayerStill: function(player) {
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
      this.camera.forceUpdate();
    },

    _playerAdded: function(player) {
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

      // Check if active player leaves
      if (player.id === this.playerId) {
        player.view.setActive(false);
        this.camera.setActivePlayer(null);
      }

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

    _objectPositionUpdated: function(obj, pos) {
      // Move player
      obj.view.move(pos);

      // Notify camera of move
      this.camera.playerMove(obj);
    },

    _objectRadiusUpdated: function(obj, radius) {
      obj.view.resize(radius);
    },

    _updateUI: function() {
      this.camera.update();
      var players = this.game.getPlayers();
      _.each(players, function(player) {
        player.view.update();
      });
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
      , player  = null
      , zoom    = false;

    var setViewBox = true;

    return {
      setActivePlayer: function(player_) {
        player = player_;
        // Zoom if player exists
        zoom = !!player;
        setViewBox = true;
      },
      setZoom: function(zoom_) {
        zoom = zoom_;
        setViewBox = true;
      },
      playerMove: function(player_) {
        if (type === 'player' && player && player.id === player_.id && zoom) {
          setViewBox = true;
        }
      },
      forceUpdate: function() {
        setViewBox = true;
      },
      update: function() {
        if (!setViewBox) return;

        if (type === 'player' && player && zoom) {
          // Center around player
          var pos = player.getPosition();
          raphael.setViewBox(pos.x - width / 2, pos.y - height / 2, width, height, true);
        } else {
          // Show full board or center of board if zoomed
          var gameRadius   = game.getBoard().radius
            , cameraRadius = zoom ? gameRadius / 5 : gameRadius;
          raphael.setViewBox(-cameraRadius, -cameraRadius, cameraRadius * 2, cameraRadius * 2, true);
        }

        setViewBox = false;
      }
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
      , name   = this.text(0, 0, player.getName()).attr({ 'font-size': 6 })
      , arrow  = false;

    set.push(circle, name);

    if (options.arrow) {
      attr = _.extend({}, options.arrow, { 'stroke-width': 1 });
      arrow = this.path('M0,0L0,-1').attr(attr);
      set.push(arrow);
    }

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

    var pos = null;
    set.move = function(pos_) {
      pos = pos_;
    };

    set.update = function() {
      if (!pos) return;
      set.transform('T' + pos.x + ',' + pos.y);
      if (arrow) {
        var movement = player.get('movement')
          , acc      = movement.acceleration
          , scale    = options.arrow.scale || 1;
        arrow.attr('path', 'M0,0L' + (acc.x * scale).toFixed(0) + ',' + (acc.y * scale).toFixed(0));
      }
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