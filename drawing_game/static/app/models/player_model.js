define(['backbone', 'underscore', 'socket.io/socket.io'], function(bb, _, dummy){

  var cache = {}
    , socket = io.connect('/')

  /*
   * This basically re-implements a Backbone model
   * but makes the code easier to follow for people not familiar with
   * Backbone's API
   */
  
  var Player = function(attrs){
    attrs = attrs || {}
    if(cache[attrs.id]) return cache[attrs.id]
    if(attrs.id) cache[attrs.id] = this
    
    _.bindAll(this, '_addSelfToCache')

    this._attrs = {}

    this.on('change:id', this._addSelfToCache)
    this.storeAttributes(attrs)
  }
  
  /*
  * Provides us with the following API
  * on - subscribe to an event
  * off - unsubscribe to a event 
  * trigger - trigger all listeners for an event
  */ 
  _.extend(Player.prototype, bb.Events)
  
  Player.prototype.storeAttributes = function(attributes){
    for(var key in attributes){
      if(!attributes.hasOwnProperty(key)) continue
      this._attrs[key] = attributes[key]
      this.trigger('change:' + key)
    }
    this.trigger('change')
  }
  
  Player.prototype.set = function(attr, val){
    if(this._attrs[attr] === val) return
    this._attrs[attr] = val
    this.trigger('change:' + attr)
  }
  
  Player.prototype.get = function(attr){
    return this._attrs[attr]
  }
  
  Player.prototype._addSelfToCache = function(){
    if(this.id) cache[this.id] == this
  }
  
  /*
   * To achieve the same effect with Backbone,
   * overwrite Model.sync instead.
   */
  Player.prototype.save = function(success, error){
    var self = this
    socket.emit('player:create', this._attrs)
  }

  return {
    Player: Player
  }
});