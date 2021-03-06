define(['underscore', 'backbone'], function(_, bb){
  var PlayerView = bb.View.extend({
    tagName: 'ul'
  , className: 'player-view'
  
  , initialize: function(model){
      _.bindAll(this, 'render')
    
      this.model.bind('change:players', this.render)
      this.model.bind('change:turn', this.render)
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
      _.each(this.model.players, function(player){
        if(player) this.$el.append(template('player', { name: player }))
      }, this)
      this.$('li:eq(' + this.model.turn + ')').addClass('active')
      
      return this
    }
  })
  
  
  return PlayerView
})