define(['backbone', 'underscore'], function(bb, _){
  return bb.View.extend({
    
    initialize: function(attrs){
      attrs = attrs || { text: 'Loading' }
      _.bindAll(this, 'render')
      
      this.on('change:text', this.render)
      this.text(attrs.text)
    }
    , render: function(){
      this.$el.html(template('loading', { text: this.text() }))
    }
    , text: function(text){
      if(!text) return this._text
      this._text = text
      this.trigger('change:text')
      return this
    }
  })
})