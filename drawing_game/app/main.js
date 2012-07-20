define(['backbone', 'underscore', 'app/util'], function(bb, _, util){
  return bb.View.extend({
    events: function(){
      if(util.hasTouch)
        return {
          'touchstart': 'didStartDrawing'
        , 'touchmove': 'didDraw'
        , 'touchend': 'didStopDrawing'
        }
      else
        return {
          'mousedown': 'didStartDrawing'
        , 'mousemove': 'didDraw'
        , 'mouseup': 'didStopDrawing'
        }
    }
  , isDrawing: false
    
  , initialize: function(){
      _.bindAll(this, 'didStopDrawing', 'didStartDrawing', 'didDraw')
      this.ctx = this.el.getContext('2d');
    }
    
  , didStartDrawing: function(e){
      e.preventDefault()
      var coords = this.getCoordinates(e)
      this.isDrawing = true
      this.ctx.beginPath()
      this.ctx.moveTo(coords.x, coords.y)
    }
    
  , didDraw: function(e){
      e.preventDefault()
      if(!this.isDrawing) return
      var coords = this.getCoordinates(e)
      this.ctx.lineTo(coords.x, coords.y)
      this.ctx.stroke()
    }
    
  , didStopDrawing: function(e){
      e.preventDefault()
      this.isDrawing = false
      this.ctx.closePath()
    }
  , getCoordinates: function(e){
      if(e.originalEvent.targetTouches)
        return { x: e.originalEvent.targetTouches[0].clientX, y: e.originalEvent.targetTouches[0].clientY}
      else
        return { x: e.clientX, y: e.clientY}
    }
    
  })
})