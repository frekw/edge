define(['backbone', 'underscore'], function(bb, _){
  var Room = function(data){
    this.pieces       = data.pieces
    this.currentPiece = data.currentPiece
    this.players      = this.pieces.map(function(piece){ return piece.name });
  }
  
  _.extend(Room.prototype, Backbone.Events)
  
  return {
    Room: Room
  }
});