define(['backbone', 'underscore', 'app/views/modal_view', 'app/views/loading_view', 'app/views/dialog_view', 'app/models/player_model'], 
function(bb, _, ModalView, LoadingView, DialogView, players){
  return bb.View.extend({
    initialize: function(args){
      _.bindAll(this, 'didConnect', 'didCreatePlayer', 'didJoinRoom')
      this.mediator = args.mediator
      
      this.modalView = new ModalView()
      this.modalView.show()
      
      this.loadingView = new LoadingView()
                          .text('Connecting')
      this.dialog = new DialogView()
      
      this.modalView.view(this.loadingView)
      
      this.dialog.on('create', this.didCreatePlayer)
      this.mediator.on('socket:ready', this.didConnect)
      this.mediator.on('game:join', this.didJoinRoom)
    }
    
  , didCreatePlayer: function(data){
      this.player = new players.Player(data)
      this.player.save()
      
      this.loadingView.text('Waiting for a game')
      this.modalView.view(this.loadingView)
      
      this.mediator.trigger('player:create', this.player)
    }
  , didJoinRoom: function(room){
      this.modalView.hide()
    }
    
  , didConnect: function(){
      this.modalView.view(this.dialog)
    }
  , hide: function(){
      this.modelView.detach()
    }
  })
})