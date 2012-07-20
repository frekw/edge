define(['jquery'], function($){
  var util = {
    eventNames: {}
  , hasTouch: 'ontouchstart' in document.documentElement
  }
  
  if(util.hasTouch)
    util.eventNames.mouse = {
      mousedown: 'touchstart'
    , mouseup: 'touchend'
    };
  else
    util.eventNames.mouse = {
      mousedown: 'mousedown'
    , mouseup: 'mouseup'
    }
    
  return util
});