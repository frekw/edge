define(['underscore', 'backbone'], function(_, bb){
  var PlayerView = bb.View.extend({
    tagName: 'ul'
  , className: 'player-view'
  
  , initialize: function(model){
      _.bindAll(this, 'render')
    
      this.model.bind('changed:players', this.render)
      this.model.bind('changed:turn', this.render)
      this.model.bind('reset', this.render)
      
      this.render()
    }
  , render: function(){
      /* This could (should) be refactored into 
      * sub-views – that way handling events become easier
      * and we don't need to redraw the entire view
      * when one player changes.
      */ 
      
      this.$el.html('')
      console.log('le model', this.model)
      _.each(this.model.players, function(player){
        if(player) this.$el.append(template('player'), player)
      }, this)      
      
      return this
    }
  })
  
  
  return PlayerView
})