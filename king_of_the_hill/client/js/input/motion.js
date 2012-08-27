define(['events'], function(events){

  var threshold = 10;

  var emitter = new events.EventEmitter()
    , motion  = { x: 0, y: 0 };

  function toMotion(val) {
    if (val <= -threshold) {
      return -1;
    } else if (val >= threshold) {
      return 1;
    } else {
      return 0;
    }
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function(ev) {
      // http://dev.w3.org/geo/api/spec-source-orientation.html#deviceorientation
      var motion_x = toMotion(ev.gamma)
        , motion_y = toMotion(ev.beta);
      if (!(motion.x === motion_x && motion.y === motion_y)) {
        motion = { x: motion_x, y: motion_y };
        if (motion.x === 0 && motion.y === 0) {
          emitter.emit('stop');
        } else {
          emitter.emit('move', motion);
        }
      }
    }, true);
  }

  return emitter;

});