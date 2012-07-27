define(['backbone', 'underscore', 'app/views/modal_view', 'app/views/loading_view', 'app/views/dialog_view'], 
function(bb, _, ModalView, LoadingView, DialogView){
  return bb.View.extend({
    initialize: function(args){
      this.mediator = args.mediator
      this.player = args.player
      this.modalView = new ModalView()
      this.modalView.show()
      
      this.loadingView = new LoadingView();
      this.dialog = new DialogView();
      
      this.modalView.view(this.dialog)
      
      _.bindAll(this, 'didConnect', 'createPlayer')
      this.mediator.on('socket:ready', this.didLoad)
      this.dialog.on('create', this.createPlayer)
    }
    
  , didConnect: function(){
      alert('did load!')
    }
  , createPlayer: function(){
      
    }
  })
})