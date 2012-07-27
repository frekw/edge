define(['backbone', 'underscore'], function(bb, _){
  var Room = bb.Model.extend({})
  
  var Rooms = bb.Model.extend({
    model: Room
  , initialize: function(socket) {
    
    }
  })
  
  return {
    model: Room
  , collection: Rooms
  }
});