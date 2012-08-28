define(['backbone', 'underscore', 'bootstrap'], function(Backbone, _) {

  return Backbone.View.extend({

    events: {
    },

    initialize: function(options) {
      _.bindAll(this, 'render');
      this.game = options.game;

      // Listen for game events to re-render scoreboard
      this.game.on('score updated', this.render);
    },

    setPlayerId: function(id) {
      this.playerId = id;
    },

    render: function() {
      var game     = this.game
        , score    = this.game.getScore()
        , pos      = 1
        , players  = _.map(score, function(score, id) {
            id = parseInt(id, 10);
            var player = game.getPlayer(id);
            return { name: player.getName(), id: id, pos: pos++, score: score };
          });

      // Extract active player
      var active   = false
        , playerId = this.playerId;
      if (playerId) {
        active = _.find(players, function(player) { return player.id === playerId; });
      }

      this.$el.html(template('scoreboard', { players: players, active: active }));
      return this;
    }

  });

});