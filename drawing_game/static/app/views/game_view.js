define(['backbone', 'underscore', 'app/views/piece_view'], function(bb, _, PieceView){
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
      
      for(i = 0, len = this.model.pieces.length; i < len; i ++){
        var view = new PieceView({model: this.model.pieces[i]})
        this.pieces.push(view)
        this.$('.pieces').append(view.el)
      }
      
    }
  , update: function(){
    }
  })
})