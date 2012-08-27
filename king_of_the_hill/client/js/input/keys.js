define(['events', 'jquery'], function(events, $) {

  var directions = {
    '37'    : { x:-1, y: 0 } // left
  , '38'    : { x: 0, y:-1 } // up
  , '39'    : { x: 1, y: 0 } // right
  , '40'    : { x: 0, y: 1 } // down
  , '37_38' : { x:-1, y:-1 } // left-up
  , '37_40' : { x:-1, y: 1 } // left-down
  , '38_39' : { x: 1, y:-1 } // up-right
  , '39_40' : { x: 1, y: 1 } // right-down
  };

  var emitter = new events.EventEmitter()
    , moving  = false
    , keys    = {};

  $(document).keydown(function(ev) {
    if (ev.keyCode in directions) {
      keys[ev.keyCode] = true;
      var key = _.keys(keys).sort().join('_');
      if (key in directions && moving !== directions[key]) {
        emitter.emit('move', directions[key]);
        moving = directions[key];
      }
      ev.preventDefault();
    }
  }).keyup(function(ev) {
    if (ev.keyCode in directions) {
      delete keys[ev.keyCode];
      var key = _.keys(keys).sort().join('_');
      if (key in directions) {
        emitter.emit('move', directions[key]);
        moving = directions[key];
      } else if (moving) {
        emitter.emit('stop');
        moving = false;
      }
      ev.preventDefault();
    }
  });

  return emitter;

});