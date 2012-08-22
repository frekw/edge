$(document).ready(function() {

  // http://advanced.aviary.com/launch/toucan
  var rendererOptions = {
    background: {
      fill   : 'r#36185f-#fff'
    , stroke : 'none'
    , bullseye : {
        fill   : '#36185f'
      , stroke : '#fff'
      }
    }
  , viewBox : {
      type   : 'playerx'
    , width  : 100
    , height : 100
    }
  , player : {
      fill   : 'r(0.4, 0.4)#cc9933-#ffee00'
    , stroke : '#fff'
    }
  };

  var Game         = require('/game.js')
    , game         = new Game({})
    , renderer     = new Renderer($('#game'), game, rendererOptions)
    , selfId       = null
    , tickloop     = null;

  var socket = io.connect()
    .on('connect', function() {
      notify('info', 'Connected to server');

      // Load initial state
      socket.emit('get game state');

      // Show game
      renderer.show();

      // Start tickloop
      if (!tickloop) {
        tickloop = function() {
          if (tickloop) requestAnimFrame(tickloop, $('#game'));
          game.tick();
          renderer.gameTicked();
        };
        tickloop();
      }

      // $('#signup').modal('show');
      socket.emit('join game', 'Calle');

      updateUI(false);
    })
    .on('connect_failed', function() {
      $('#signup_action').attr('disabled',true).val('Could not connect');
      notify('error', 'Failed to connect to server...');
    })
    .on('disconnect', function() {
      tickloop = null;
      renderer.hide();
      game.resetGameState();
      $('#signup_action').attr('disabled',true);
      notify('info', 'Disconnected from server');
    })
    // Handle join/leave of game
    .on('game joined', function(id) {
      $('#signup').modal('hide');

      selfId = id;
      renderer.setSelf(selfId);

      updateUI(true);
    })
    .on('game left', function() {
      selfId = undefined;
      renderer.setSelf(selfId);
      updateUI(false);
    })
    .on('join failed', function(message) {
      $('#signup_action').attr('disabled',false);
      if (message = 'name exists') {
        $('#signup_error').text('Player with name "' + name + '" already exists.').show();
      } else {
        $('#signup_error').text('Server error: ' + message).show();
      }
    })

    .on('game state', function(state) {
      game.updateState(state);
    })
    .on('add object', function(state) {
      game.addObject(state);
    })
    .on('remove object', function(id) {
      game.removeObject(id);
    })
    .on('objects collided', function(o1_id, o1_state, o2_id, o2_state) {
      var o1 = game.getObject(o1_id);
      if (o1) {
        o1.updateState(o1_state);
        renderer.objectStateUpdated(o1);
      }
      var o2 = game.getObject(o2_id);
      if (o2) {
        o2.updateState(o2_state);
        renderer.objectStateUpdated(o2);
      }
      if (o1 && o2) {
        renderer.objectsCollided(o1, o2);
      }
    })
    .on('move player', function(id, state, direction) {
      var player = game.getPlayer(id);
      if (player) {
        player.updateState(state);
        renderer.objectStateUpdated(player);
        player.move(direction);
      }
    })
    .on('stop player', function(id, state) {
      var player = game.getPlayer(id);
      if (player) {
        player.stop();
        player.updateState(state);
        renderer.objectStateUpdated(player);
      }
    })
    .on('still player', function(id, state) {
      var player = game.getPlayer(id);
      if (player) {
        player.updateState(state);
        renderer.objectStateUpdated(player);
      }
    })
    .on('score updated', function(score) {
      game.setScore(score);
    });

  socket.socket.on('error', function (reason) {
    alert('SocketIO error: ' + reason);
  });

  //
  // UI code
  //

  var updateUI = function(joined) {
    $('#legend')[joined ? 'show' : 'hide']();
    $('#leave_game')[joined ? 'show' : 'hide']();
    $('#chat_form')[joined ? 'show' : 'hide']();
  };

  var notify = function(type, message) {
    var alert = $('#alerts').find('.template').clone()
      .removeClass('template').removeClass('hide')
      .addClass('alert-' + type)
      .find('.content').text(message);

    alert.alert();
  };

  // Signup

  $('#signup').modal({
    backdrop : 'static'
  , keyboard : false
  , show     : false
  }).on('show', function() {
    $('#signup_action').attr('disabled', false);
    $('#signup').find('.error').hide();
  }).on('shown', function() {
    $('#signup').find('input[name="name"]').focus();
  }).submit(function(event) {
    event.preventDefault();

    var name  = $('input[name="name"]', this).val()
      , error = $('.error', this);

    if (/^\s*$/.test(name)) {
      return error.text('Must supply name').show();
    }

    $('#signup_action').attr('disabled', true);
    socket.emit('join game', name);
  });

  // Leave

  $('#leave_game').click(function(event) {
    event.preventDefault();
    socket.emit('leave game');
  });

  // Movement

  var moving = false
    , keys   = {};

  var directions = {
    '37' : { x:-1, y: 0 } // left
  , '38' : { x: 0, y:-1 } // up
  , '39' : { x: 1, y: 0 } // right
  , '40' : { x: 0, y: 1 } // down
  , '37_38' : { x:-1, y:-1 } // left-up
  , '37_40' : { x:-1, y: 1 } // left-down
  , '38_39' : { x: 1, y:-1 } // up-right
  , '39_40' : { x: 1, y: 1 } // right-down
  };

  $(document).keydown(function(ev) {
    if (ev.keyCode in directions) {
      keys[ev.keyCode] = true;
      var key = _.keys(keys).sort().join('_');
      if (key in directions && !moving) {
        socket.emit('move', directions[key]);
        moving = true;
      }
      ev.preventDefault();
    }
  }).keyup(function(ev) {
    if (ev.keyCode in directions) {
      delete keys[ev.keyCode];
      var key = _.keys(keys).sort().join('_');
      if (key in directions) {
        socket.emit('move', directions[key]);
        moving = true;
      } else if (moving) {
        socket.emit('stop');
        moving = false;
      }
      ev.preventDefault();
    }
  });

  if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function(ev) {
          var acc = ev.accelerationIncludingGravity;
          var rot = ev.rotationRate;
          console.log(acc, rot);
      }, false);
  } else {
    console.log('No DeviceMotionEvent support');
  }

  //
  // Utility functions
  //

  // Simple scroll functionality in jQuery
  $.fn.scrollToBottom = function() {
    this.prop('scrollTop', this.prop('scrollHeight'));
  };

  // shim layer with setTimeout fallback
  var requestAnimFrame = (function() {
    // return function(callback, elem){
    //   window.setTimeout(callback, 1000 / 20);
    // };
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback, elem){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var formatDate = function(date) {
    if (!date) return '';
    return [date.getFullYear(), padNumber(date.getMonth() + 1, 2), padNumber(date.getDate(), 2)].join('-');
  };

  var formatTime = function(date) {
     return [padNumber(date.getHours(), 2), padNumber(date.getMinutes(), 2), padNumber(date.getSeconds(), 2)].join(':');
  };

  var padNumber = function(value, length) {
    var string = value.toString();
    if (length <= string.length) return string.substring(0, length);
    return Array(length + 1 - string.length).join('0') + string;
  };

});
