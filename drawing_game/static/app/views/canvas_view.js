define(['backbone', 'underscore', 'app/util'], function(bb, _, util){
  return bb.View.extend({
    isDrawing: false
  , isDisabled: false
    
  , events: function(){
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
    
  , initialize: function(args){      
      _.bindAll(this, 'render', 'draw', 'didStopDrawing', 'didStartDrawing', 'didDraw')
      this.thickness = args.thickness || 3
      this.color     = args.color || 'black'
      
      this.lineCap         = 'round'
      this.lineJoin        = 'round'
      
      this.render()
    }
    
  , render: function(){
      this.$el.html(template('piece'))
      this.canvas = this.$('canvas')[0]
      
      this.ctx = this.canvas.getContext('2d');
      this.ctx.strokeStyle = this.color
      this.ctx.lineWidth   = this.thickness
      
      //this._setRandomRotation()
    }
    
  , _setRandomRotation: function(){
      // Rotation between -2 and 2
      var rotation = 'rotate(' + (-2 + Math.random() * 4) + 'deg)'
      
      this.$el.css({
        webkitTransform: rotation
      , mozTransform: rotation
      , msTransform: rotation
      , oTransform: rotation 
      })
    }
    
  , draw: function(data){
      var img = new Image()
        , ctx = this.canvas.getContext('2d');
      
      img.src = data
      img.onload = function(){
        ctx.drawImage(img, 0, 0)
        img.onload = null
        img = null
      }
    }
  , didStartDrawing: function(e){
      e.preventDefault()
      if(this.isDisabled) return
      var coords = this.getNormalizedCoordinates(e)
      this.ctx.beginPath()
      this.ctx.moveTo(e.x, e.y)
      this.isDrawing = true
    }

  , didDraw: function(e){
      e.preventDefault()
      if(!this.isDrawing || this.isDisabled) return
      var coords = this.getNormalizedCoordinates(e)
      this.ctx.lineTo(coords.x, coords.y)
      this.ctx.stroke()
    }

  , didStopDrawing: function(e){
      e.preventDefault()
      if(this.isDisabled) return
      this.didDraw(e)
      this.isDrawing = false
      
      this.model.drawing(this.$('canvas')[0].toDataURL())
    }
  , getCoordinates: function(e){
      if(e.originalEvent.targetTouches && e.originalEvent.targetTouches.length)
        return { x: e.originalEvent.targetTouches[0].clientX, y: e.originalEvent.targetTouches[0].clientY}
      else
        return { x: e.clientX, y: e.clientY}
    }
  , getNormalizedCoordinates: function(e){
      var coords = this.getCoordinates(e)
      return {
        x: coords.x - this.$el.offset().left
      , y: coords.y - this.$el.offset().top + $(window).scrollTop()
      }
      return coords
    }
  , disable: function(){
      this.isDisabled = true
      return this
    }
  , enable: function(){
      this.isDisabled = false
      return this
    }
  })
})