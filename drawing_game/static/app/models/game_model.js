define(['backbone', 'underscore'], function(bb, _){
  var Game = function(data, slot, socket){
    
    _.bindAll(this, 'didStartRound', 'didFinishTurn', 'didFinishRound', 'playerJoined', 'playerLeft')
    
    this.socket  = socket
    this.slot    = slot
    this.players = data.players
    
    this.update(data)
    
    this.socket.on('game:turn:next', this.didFinishTurn)
    this.socket.on('game:end', this.didFinishRound)
    this.socket.on('game:reset', this.didStartRound)
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
    this._data = data.data
    this.turn = data.turn
    this.slots = data.slots
    
    this.trigger('change:data')
  }
  
  Game.prototype.endTurn = function(){
    this.socket.emit('game:turn:next', this._drawing)
  }
  
  Game.prototype.drawing = function(data){
    if(!data) return this._drawing
    this._drawing = data
    return this
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
    this.updatePlayers(data)
  }
  
  Game.prototype.playerLeft = function(data){
    this.updatePlayers(data)
  }
  
  Game.prototype.didFinishTurn = function(data){
    this.turn  = data.turn
    this._data = data.data
    this.trigger('change:turn')
  }
  
  Game.prototype.didStartRound = function(data) {
    this.turn  = data.turn
    this._data = data.data
    this.trigger('round:start')
  }
  
  
  Game.prototype.didFinishRound = function(timeout){
    this.trigger('round:end')
  }
  
  return {
    Game: Game
  }
});