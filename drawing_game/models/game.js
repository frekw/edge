var Game = function(){
  
  /*
  The players in the current room.
  contains:
  [{
    name: String
  , socket: Socket.io.Socket
  }]
  */
  this._players = []
  for(var i = 0; i < Game.MAX_COUNT - 1; i++)
    this._players[i] = null
  
  /*
  The data for each turn
  contains
  [ String(base64) ]
  */
  this._data = []
  this._turn = 0
}

Game.MAX_COUNT = 2
Game._games = []

Game.findGame = function(){
  var available = Game._games.filter(function(game){
    return game.isFull()
  })
  if(available.length) return available[0]
  
  var game = new Game()
  Game._games.push(game)
  return game
}

Game.prototype.isFull = function(){
  return !!this.availableSlots().length
}

Game.prototype.availableSlots = function(){
  // TODO: compensate for the current turn (?)
  var available = []
  for(var i = 0, len = this._players.length; i < len; i++)
    if(!this._players[i]) available.push(i)
  return available
  
  /*
    Or, if you prefer a more functional style:
    var emptySlots = this._players.map(function(val, i){ 
      return val ? undefined : i
    })
    return emptySlots.filter(function(value){ return !!value })
  */
}

Game.prototype.add = function(player){
  this._players.push(player)
  this.bindEvents(player)
  player.socket.emit('game:join', this.serialize())
}

Game.prototype.remove = function(player){
  var index = this._players.indexOf(player)
  this._players.splice(index, 1)
  this.unbindEvents(player)
}

Game.prototype.bindEvents = function(player){
  var socket = player.socket
  if(!socket) return
  socket.on('game:turn:next', this.didReceiveData.bind(this))
  socket.on('disconnect', function(){
    this.remove(player)
  }, this)
}

Game.prototype.unbindEvents = function(player){
  var socket = player.socket
  if(!socket) return
  socket.off('game:turn:next')
  socket.off('disconnect')
}


Game.prototype.didReceiveData = function(data){
  this.data.push(data)
  this.nextTurn();
}

Game.prototype.nextTurn = function(){
  if(++this._turn > Game.MAX_COUNT){
    this._turn = 0
    this._data = []
    this.broadcast('game:reset', this.serialize())
  } else {
    this.broadcast('game:turn:next', this.serialize())
  }
}

Game.prototype.serialize = function(){
  return {
    turn: this._turn
  , players: this._players.map(function(player){ return player ? player.name : undefined })
  , data: this._data
  , slots: Game.MAX_COUNT
  }
}

Game.prototype.broadcast = function(message, data){
  this._players.each(function(player){
    if(!(player && player.socket)) return
    player.socket.emit(message, data)
  })
  return this
}

module.exports = Game