define(['backbone', 'underscore', 'app/views/piece_view', 'app/views/player_view'], function(bb, _, PieceView, PlayerView){
  return bb.View.extend({
    events: {
      'click a.next-button': 'didClickNext'
    }
    
  , initialize: function(opts){
      console.log('GameView#init')
      _.bindAll(this, 'render', 'didClickNext', 'roundDidEnd', 'roundDidStart')
      
      this.model.on('change:data', this.render)
      this.model.on('change:turn', this.render)
      this.model.on('round:start', this.roundDidStart)
      this.model.on('round:end', this.roundDidEnd)
      
      this.render()
    }
  , render: function(){
      this.$el.html(template('game'))
      
      this.pieces = []
      
      for(i = 0, len = this.model.slots; i < len; i ++){
        var view = new PieceView({model: this.model})
        if(i < this.model.slot) view.disable('above')
        if(i > this.model.slot) view.disable('below')
        
        if(this.model._data[i]) view.canvas.draw(this.model._data[i])
        
        this.pieces.push(view)
        this.$('.pieces').append(view.el)
      }
      
      if(this.model.turn !== this.model.slot) this.$('a.button').remove()
      
      this.$('#game').css('margin-top', - 480 * this.model.slot + 20)
      
      if(this.model.turn === this.model.slot)
        this.$el.append('<a href="#" class="button next-button">Next</a>')
        
      this.$el.append('<a href="#" class="button disable-touch-button">Toggle scrolling</a>')


      var playerView = new PlayerView({model: this.model})
      playerView.$el.appendTo(this.$el)
      
    }
  , didClickNext: function(){
      this.pieces[this.model.slot].canvas.disable()
      this.model.endTurn(this.serialize())
      console.log('btn', this.$('a.next-button'))
      this.$('a.next-button').hide()
    }

  , serialize: function(){
      return {a:'b'}
    }
  , roundDidEnd: function(){
      this.$('#game').css('margin-top', - (480 * this.model.players.length * 0.25))
      this.$('#game').addClass('finished')
    }
  , roundDidStart: function(){
      this.$('#game').removeClass('finished')
      this.pieces[this.model.slot].canvas.enable()
      this.$('a.next-button').show()
      this.render()
    }
  })
})