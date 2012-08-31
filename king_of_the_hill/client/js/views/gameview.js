define(['backbone', 'underscore'], function(Backbone, _) {

  return Backbone.View.extend({

    initialize: function(options) {
      _.bindAll(this, '_gameStateUpdated', '_scoreUpdated',
        '_playerAdded', '_playerRemoved', '_objectsCollided',
        '_objectStateUpdated', '_objectPositionUpdated', '_objectRadiusUpdated');

      this.game = options.game;

      // Setup listeners on game
      this.game.on('state updated',    this._gameStateUpdated);
      this.game.on('score updated',    this._scoreUpdated);
      this.game.on('add player',       this._playerAdded);
      this.game.on('remove player',    this._playerRemoved);
      this.game.on('objects collided', this._objectsCollided);

      // Properties
      this.zoom = false;
    },

    render: function() {
      // Make our element fill the parent
      var parent = this.$el.parent()[0];
      this.$el.width(parent.scrollWidth).height(parent.scrollHeight);
      return this;
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    },

    toggleZoom: function() {
      this.zoom = !this.zoom;
    },

    setPlayerId: function(id) {
      var prev = this.game.getObject(this.playerId)
        , next = this.game.getObject(id);
      if (prev) this._unsetPlayer(prev);
      this.playerId = id;
      if (next) this._setPlayer(next);
    },

    gameTicked: function() {
    },

    socketPlayerMove: function(player) {
    },

    socketPlayerStop: function(player) {
    },

    socketPlayerStill: function(player) {
    },

    _setPlayer: function(player) {
    },

    _unsetPlayer: function(player) {
    },

    _gameStateUpdated: function(game) {
    },

    _scoreUpdated: function(score) {
    },

    _playerAdded: function(player) {
      // Listen for player updates
      player.on('state updated', this._objectStateUpdated);
      player.on('change position', this._objectPositionUpdated);
      player.on('change radius', this._objectRadiusUpdated);
      // 'change radius', 'change velocity', 'change weight'
    },

    _playerRemoved: function(player) {
      // Remove listeners
      player.removeListener('state updated', this._objectStateUpdated);
      player.removeListener('change position', this._objectPositionUpdated);
      player.removeListener('change radius', this._objectRadiusUpdated);
    },

    _objectsCollided: function(obj1, obj2) {
    },

    _objectStateUpdated: function(obj) {
    },

    _objectPositionUpdated: function(obj, pos) {
    },

    _objectRadiusUpdated: function(obj, radius) {
    }

  });

});