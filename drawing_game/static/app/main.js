define(['socket.io/socket.io', 'app/models/player_model', 'app/models/game_model', 'app/views/splash_view', 'app/views/game_view', 'app/util'], 
  function(dummy, players, game, SplashView, GameView, util){

  var Main = function(){
    var mediator   = _.extend({}, Backbone.Events)
      , socket     = io.connect('/')
      , splashView = new SplashView({mediator: mediator})
      , mainView

    socket.on('ready', function(){
      mediator.trigger('socket:ready')
    })
    
    socket.on('game:join', function(data){
      mediator.trigger('game:join', data)
      
      
      /* Here we should:
       * 1. Start listening to the game's channel. (which the room.Room should take care of)
       * 2. Setup the game view.
       */
       
      var joined = new game.Game(data, data.slot, socket)
      mainView = new GameView({mediator: mediator, model: joined})
      mainView.$el.appendTo('body')
      
    })
    
    mediator.on('player:create', function(player){
      this.player = player;
    })
    
    if(util.hasTouch){
        $('html').addClass('has-touch')
      
  }
  
  return Main;
  
  
  
  
/*  var socket = io.connect('/')
    , sid     = Math.random().toString(36).substr(2,9) // TODO: Poor solution, find a better one.
    
  socket.on('connect', function(){
    socket.emit('session', sid)
  })
  
  socket.on('ready', function(){
  })
  
  socket.on('data', function(data){
    
    
    if(data.id == sid) return
    
    
    var canvas = $('#canvas')[0]
      , img = new Image()
      , ctx = canvas.getContext('2d');
    img.src = data.image
    img.onload = function(){
      ctx.drawImage(img, 0, 0)
      img.onload = null
      img = null
    }
    
  });*/
})