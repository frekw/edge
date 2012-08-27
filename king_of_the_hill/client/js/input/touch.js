define(['events'], function(events){

  // Disable touch scrolling
  document.ontouchmove = function(e) { e.preventDefault(); };

});