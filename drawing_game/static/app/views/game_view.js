define(['backbone', 'underscore', 'app/views/piece_view', 'app/views/player_view'], function(bb, _, PieceView, PlayerView){
  return bb.View.extend({
    events: {
      'click a.button': 'didClickNext'
    }
    
  , initialize: function(opts){
      console.log('GameView#init')
      _.bindAll(this, 'render', 'didClickNext')
      
      this.model.on('change:data', this.render)
      this.model.on('change:turn', this.render)
      var self = this;
      this.model.on('change:turn', function(){
        console.log('change turn! ', self.model)
      }, this)
      this.render()
    }
  , render: function(){
      this.$el.html(template('game'))
      
      this.pieces = []
      
      for(i = 0, len = this.model.slots; i < len; i ++){
        var view = new PieceView({model: this.model})
        if(i < this.model.slot) view.deactivate('above')
        if(i > this.model.slot) view.deactivate('below')
        
        console.log('has data?', !!this.model._data[i], this.model, i)
        
        if(this.model._data[i]) view.canvas.draw(this.model._data[i])
        
        this.pieces.push(view)
        this.$('.pieces').append(view.el)
      }
      
      if(this.model.turn !== this.model.slot) this.$('a.button').remove()
      
      var playerView = new PlayerView({model: this.model})
      playerView.$el.appendTo(this.$el)
      
    }
  , didClickNext: function(){
      this.model.endTurn(this.serialize())
    }

  , serialize: function(){
      return {a:'b'}
    }
  })
})