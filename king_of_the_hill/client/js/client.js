define([
  'jquery'
, 'socket.io'
, 'underscore'
, './lib/game'
, './utils/tickloop'
, './views/raphael-gameview'
, './views/alerts-view'
, './views/signup-view'
, './views/controls-view'
, './views/scoreboard-view'
, './input/keys'
, './input/motion'
, './input/touch'
], function($, io, _, Game, Tickloop, GameView, Alerts, Signup, Controls, ScoreBoard, keys, motion, touch) {

  // http://advanced.aviary.com/launch/toucan
  var gameViewOptions = {
    camera : {
      type   : 'player'
    , width  : 100
    , height : 100
    }
  , background : {
      color : '#36185f' // 'r#36185f-#fff'
    , circles : 8
    , inner : { stroke: '#fff', 'stroke-width': 3 }
    , outer : { stroke: '#000', 'stroke-width': 3 }
    }
  , players : {
      attrs : {
        fill   : 'r(0.4, 0.4)#d9d9d9-#fff'
      , stroke : '#fff'
      }
    , active : {
        fill   : 'r(0.4, 0.4)#cc9933-#ffee00'
      , stroke : '#fff'
      }
    , collision : '#9933cc'
    , updated   : '#cc9933'
    , arrow     : {
        stroke : '#000'
      , scale  : 0.3
      }
    }
  };

  return {
    init: function() {
      // Create game
      var game = new Game();

      // Simplify graphics for touch devices
      if (touch.hasTouch) {
        gameViewOptions.players.attrs.fill = '#d9d9d9';
        gameViewOptions.players.active.fill = '#ffcc22';
        delete gameViewOptions.players.collision;
        delete gameViewOptions.players.updated;
      }

      // Create views
      var gameView = new GameView(_.extend({ el: '#game', game: game }, gameViewOptions))
        , alerts   = new Alerts({ el: '#alerts' })
        , signup   = new Signup({ el: '#signup' })
        , score    = new ScoreBoard({ el: '#score', game: game })
        , controls = new Controls({ el: '#controls' });

      gameView.render().hide();
      controls.render().hide();

      // Remove score and controls if touch device for performance reasons
      if (touch.hasTouch) {
        score.remove();
        controls.remove();
      }

      // Game loop
      var tickloop = new Tickloop(function() {
        game.tick();
        gameView.gameTicked();
      });

      // SocketIO
      var socket = io.connect();

      //
      // Connection events
      //

      socket.on('connect_failed', function() {
        alerts.error('Failed to connect to server...');
      });

      socket.on('connect', function() {
        alerts.info('Connected to server...');
        socket.emit('get game state');
        gameView.show();
        tickloop.start();
        controls.connected();
        signup.show();
      });

      socket.on('disconnect', function() {
        alerts.info('Disconnected from server...');
        tickloop.stop();
        gameView.hide();
        game.resetGameState();
        controls.hide();
      });

      socket.socket.on('error', function (reason) {
        alerts.error('SocketIO error: ' + reason);
      });

      //
      // Join / leave game
      //

      signup.on('signup', function(name) {
        socket.emit('join game', name);
      });

      signup.on('cancel', function(name) {
        controls.connected();
      });

      controls.on('join', function() {
        signup.show();
      });

      controls.on('leave', function() {
        socket.emit('leave game');
      });

      socket.on('game joined', function(id) {
        signup.hide();
        controls.joined();
        gameView.setPlayerId(id);
        score.setPlayerId(id);
      });

      socket.on('join failed', function(message, name) {
        signup.show();
        controls.connected();
        if (message === 'name exists') {
          signup.error('Player with name "' + name + '" already exists.');
        } else {
          signup.error('Server error: ' + message);
        }
      });

      socket.on('game left', function() {
        gameView.setPlayerId(undefined);
        controls.connected();
      });

      //
      // Gameplay events
      //

      keys.on('move', function(direction) {
        socket.emit('move', direction);
      });

      keys.on('stop', function() {
        socket.emit('stop');
      });

      keys.on('zoom', function() {
        gameView.toggleZoom();
      });

      keys.on('cancel', function() {
        socket.emit('leave game');
      });

      motion.on('move', function(direction) {
        socket.emit('move', direction);
      });

      motion.on('stop', function() {
        socket.emit('stop');
      });

      socket.on('game state', function(state) {
        game.updateState(state);
      });

      socket.on('add object', function(state) {
        game.addObject(state);
      });

      socket.on('remove object', function(id) {
        game.removeObject(id);
      });

      socket.on('objects collided', function(o1_id, o1_state, o2_id, o2_state) {
        var o1 = game.getObject(o1_id)
          , o2 = game.getObject(o2_id);
        if (o1) o1.updateState(o1_state);
        if (o2) o2.updateState(o2_state);
      });

      socket.on('move player', function(id, state, direction) {
        var player = game.getPlayer(id);
        if (player) {
          player.updateState(state);
          player.move(direction);
          gameView.socketPlayerMove(player);
        }
      });

      socket.on('stop player', function(id, state) {
        var player = game.getPlayer(id);
        if (player) {
          player.stop();
          player.updateState(state);
          gameView.socketPlayerStop(player);
        }
      });

      socket.on('still player', function(id, state) {
        var player = game.getPlayer(id);
        if (player) {
          player.updateState(state);
          gameView.socketPlayerStill(player);
        }
      });

      socket.on('score updated', function(score) {
        game.setScore(score);
      });

    }
  };

});