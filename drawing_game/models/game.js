

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
  for(var i = 0; i < Game.MAX_COUNT; i++)
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
Game.TIME_BETWEEN_ROUNDS = 5 * 1000; // milliseconds
Game._games = []

Game.findGame = function(){
  console.log('games', Game._games)
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
  for(var i = 0, len = this._players.length; i < len; i++){
    if(!this._players[i]) available.push(i)
  }
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
  var slot = this.availableSlots()[0];
  this._players[slot] = player
  this.bindEvents(player)
  
  var data = this.serialize()
  data.slot = slot // we need to get the slot to the connected client.
  
  player.socket.emit('game:join', data)
  this.broadcast('game:player:joined', this.serialize())
}

Game.prototype.remove = function(player){
  var index = this._players.indexOf(player)
  this._players.splice(index, 1)
  this.broadcast('game:player:left', this.serialize())
}

Game.prototype.bindEvents = function(player){
  var socket = player.socket
    , self   = this
  if(!socket) return
  socket.on('game:turn:next', function(data){
    self.didReceiveData(data)
    self.nextTurn()
  })
  socket.on('disconnect', function(){ self.remove(player) })
}

Game.prototype.didReceiveData = function(data){
  this._data.push(data)
}

Game.prototype.nextTurn = function(){
  if(++this._turn > Game.MAX_COUNT - 1){
//    this.broadcast('game:end', Game.TIME_BETWEEN_ROUNDS)
    this.broadcast('game:end', this.serialize(), Game.TIME_BETWEEN_ROUNDS)
    setTimeout(this.reset.bind(this), Game.TIME_BETWEEN_ROUNDS)
  } else {
    this.broadcast('game:turn:next', this.serialize())
  }
}

Game.prototype.reset = function() {
  this._turn = 0
  this._data = []
  this.broadcast('game:reset', this.serialize())
};


Game.prototype.serialize = function(){
  return {
    turn: this._turn
  , players: this._players.map(function(player){ return player ? player.name : undefined })
  , data: this._data
  , slots: Game.MAX_COUNT
  }
}

Game.prototype.broadcast = function(message, data){
  this._players.forEach(function(player){
    if(player)
      player.socket.emit(message, data)
  })
  return this
}

module.exports = Game