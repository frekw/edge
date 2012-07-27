define(['backbone', 'underscore'], function(bb, _){
  return bb.View.extend({
  initialize: function(){
      _.bindAll(this, 'render')
      this.on('view:change', this.render)
    }
  , render: function(){
      this.$el.html(template('overlay'))
      this.$('.view').html(this._view.el)
    }
  , view: function(view){
      if(!view) return this._view
      this._view = view
      this.trigger('view:change')
      return this
    }
  , show: function(animation){
      this.$el.appendTo('body')
      if(animation === false) return
      animation = animation || 'animated fadeIn'
      this.$el.addClass('animated ' + animation)
      return this
    }
  , hide: function(animation){
      if(animation === false){
        animation = animation || 'animated fadeIn'
        this.$el.addClass('animated ' + animation)
      } else {
        this.$el.detach()
      }
      return this
    }
  })
})