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
    
  , initialize: function(args){
      _.bindAll(this, 'didStopDrawing', 'didStartDrawing', 'didDraw')
      this.thickness = args.thickness || 3
      this.color     = args.color || 'black'
      
      this.ctx             = this.el.getContext('2d');
      this.ctx.strokeStyle = this.color
      this.ctx.lineWidth   = this.thickness
      this.lineCap         = 'round'
      this.lineJoin        = 'round'
    }
    
  , didStartDrawing: function(e){
      e.preventDefault()
      var coords = this.getCoordinates(e)
      this.ctx.beginPath()
      this.ctx.moveTo(e.x, e.y)
      this.isDrawing = true
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
      this.didDraw(e)
      this.isDrawing = false
      
      console.log(this.ctx.getImageData(0, 0, this.el.width, this.el.height))
    }
  , getCoordinates: function(e){
      if(e.originalEvent.targetTouches)
        return { x: e.originalEvent.targetTouches[0].clientX, y: e.originalEvent.targetTouches[0].clientY}
      else
        return { x: e.clientX, y: e.clientY}
    }    
  })
})