define(['backbone', 'underscore'], function(bb, _){
  var Game = function(data, socket){
    console.log('Game#init', data)
    
    _.bindAll(this, 'didFinishTurn', 'didFinishRound', 'playerJoined', 'playerLeft')
    
    this.socket = socket
    this.data = data.data
    this.turn = data.turn
    this.slots = data.slots
    this.players = data.players
    
    
    var self = this
    this.socket.on('game:turn:next', this.didFinishTurn)
    this.socket.on('game:reset', this.didFinishRound)
    this.socket.on('game:player:joined', this.playerJoined)
    this.socket.on('game:player:left', this.playerLeft)

    
    this.socket.emit('WTF')
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
  }
  
  
  /* playerJoined and playerLeft could be rewritten as
     this.updatePlayers.bind(this), but are left here for clarity
     
     Same goes for didFinishTurn and didFinishRound
  */

  Game.prototype.updatePlayers = function(data) {
    this.players = data.players
    this.trigger('changed:players')
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
    this.trigger('changed:turn')
  }
  
  Game.prototype.didFinishRound = function(data){
    this.update(data)
    this.trigger('reset')
  }
  
  return {
    Game: Game
  }
});