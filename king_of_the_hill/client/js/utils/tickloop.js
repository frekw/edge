define(function() {

  // Shim layer with setTimeout fallback
  var requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var Tickloop = function(callback) {
    this.callback = callback;
    this.loop = false;
  };

  Tickloop.prototype.start = function() {
    var self = this;

    if (!this.loop) {
      this.loop = function() {
        if (self.loop) requestAnimFrame(self.loop);
        self.callback();
      };
      this.loop();
    }
  };

  Tickloop.prototype.stop = function() {
    this.loop = false;
  };

  return Tickloop;

});