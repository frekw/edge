define(['backbone', 'underscore', 'app/views/canvas_view'], function(bb, _, CanvasView){
  return bb.View.extend({
    className: 'piece'
  , initialize: function(){
      _.bindAll(this, 'render')
      this.render()
    }
  , render: function(){
      this.canvas = new CanvasView({model: this.model})
      this.$el.append(this.canvas.el)
    }
  , disable: function(direction){
      this.$el.append('<div class="conceal ' + direction + '" />')
      this.canvas.disable()
    }
  , enable: function(){
      this.canvas.enable()
    }
  })
})