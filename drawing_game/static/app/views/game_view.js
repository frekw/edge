define(['backbone', 'underscore', 'app/views/piece_view', 'app/views/player_view'], function(bb, _, PieceView, PlayerView){
  return bb.View.extend({
    initialize: function(opts){
      console.log('GameView#init')
      _.bindAll(this, 'render', 'update')
      
      this.model.on('change', this.update)      
      this.render()
    }
  , render: function(){
      this.$el.html(template('game'))
      
      this.pieces = []
      
      for(i = 0, len = this.model.slots; i < len; i ++){
        //var view = new PieceView({model: this.model.pieces[i]})
        var view = new PieceView({model: {}})
        this.pieces.push(view)
        this.$('.pieces').append(view.el)
      }
      
      var playerView = new PlayerView({model: this.model})
      playerView.$el.appendTo(this.$el)
      
    }
  , update: function(){
    }
  })
})