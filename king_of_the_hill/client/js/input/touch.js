define(['events'], function(events){

  var hasTouch = 'ontouchstart' in document.documentElement;

  if (hasTouch) {
    // Disable touch scrolling
    document.ontouchmove = function(e) { e.preventDefault(); };
  }

  return {
    hasTouch : hasTouch
  };

});