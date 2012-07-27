define(['backbone', 'underscore'], function(bb, _){
  return bb.View.extend({
    className: 'tooltip'
  , initialize: function(){
      _.bindAll(this, 'update')
      this.on('text:change', this.update)
    }
  , update: function(){
    this.$el.text(this.text)
  }
  , text: function(text){
      if(!text) return text
      this.text = text
      this.trigger('text:change')
      return this
    }
  , show: function(element){
      this.$el.appendTo('body')

      var w  = this.$el.outerWidth()
        , h  = this.$el.outerHeight()
        , ew = $(element).outerWidth()
        , eh = $(element).outerHeight()
        , y  = $(element).offset().top
        , x  = $(element).offset().left

      this.$el.css({
        left: x + ew / 2 - w / 2
      , top: y - h - 10
      })
      
      this.$el.addClass('animated bounceInLeft')
      
      return this
    }
  , hide: function(){
      this.$el.detach()
      return this
    }
  , destroy: function(){
      this.off('text:change')
    }
  })
})