define(['backbone', 'underscore'], function(bb, _){
  var Game = function(data, slot, socket){
    console.log('Game#init', data)
    
    _.bindAll(this, 'didFinishTurn', 'didFinishRound', 'playerJoined', 'playerLeft')
    
    this.socket  = socket
    this.slot    = slot
    this.players = data.players
    
    this.update(data)
    
    this.socket.on('game:turn:next', this.didFinishTurn)
    this.socket.on('game:reset', this.didFinishRound)
    this.socket.on('game:player:joined', this.playerJoined)
    this.socket.on('game:player:left', this.playerLeft)
  }
  
  _.extend(Game.prototype, Backbone.Events)
  
  Game.prototype.update = function(data){
    /*
    1. Break data into models
    2. Update game state
    2. Notify listeners (views)
    */
    this.data = data.data
    this.turn = data.turn
    this.slots = data.slots
    console.log('Game#update', data)
    
    this.trigger('change:data')
  }
  
  Game.prototype.endTurn = function(){
    this.socket.emit('game:turn:next')
  }
  
  
  /* playerJoined and playerLeft could be rewritten as
     this.updatePlayers.bind(this), but are left here for clarity
     
     Same goes for didFinishTurn and didFinishRound
  */

  Game.prototype.updatePlayers = function(data) {
    this.players = data.players
    this.trigger('change:players')
  }
  
  
  Game.prototype.playerJoined = function(data){
    console.log('Game#playerJoined')
    this.updatePlayers(data)
  }
  
  Game.prototype.playerLeft = function(data){
    console.log('Game#playerLeft')
    this.updatePlayers(data)
  }
  
  Game.prototype.didFinishTurn = function(data){
    this.update(data)
    this.trigger('change:turn')
  }
  
  Game.prototype.didFinishRound = function(data){
    this.update(data)
    this.trigger('reset')
  }
  
  return {
    Game: Game
  }
});