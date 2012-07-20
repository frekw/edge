define(['backbone', 'underscore', 'app/util', 'socket.io/socket.io'], function(bb, _, util){
  
  var socket = io.connect('/')
    , sid     = Math.random().toString(36).substr(2,9) // TODO: Poor solution, find a better one.
    
  socket.on('connect', function(){
    socket.emit('session', sid)
  })
  
  socket.on('ready', function(){
    console.log('socket.io is ready')
  })
  
  socket.on('data', function(data){
    var data = JSON.parse(data)
    
    console.log('ids', sid, data.id)
    
    if(data.id == sid) return
    
    console.log('draw data...')
    
    var canvas = $('#canvas')[0]
      , img = new Image()
      , ctx = canvas.getContext('2d');
    img.src = data.image
    img.onload = function(){
      ctx.drawImage(img, 0, 0)
      img.onload = null
      img = null
    }
    
  });
  
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
      socket.emit('data', this.el.toDataURL());
    }
  , getCoordinates: function(e){
      if(e.originalEvent.targetTouches && e.originalEvent.targetTouches.length)
        return { x: e.originalEvent.targetTouches[0].clientX, y: e.originalEvent.targetTouches[0].clientY}
      else
        return { x: e.clientX, y: e.clientY}
    }    
  })
})