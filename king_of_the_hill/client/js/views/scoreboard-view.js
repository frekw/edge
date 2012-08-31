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

    remove: function() {
      // Stop listening
      this.game.removeListener('score updated', this.render);

      // Invoke super
      return Backbone.View.prototype.remove.apply(this, arguments);
    },

    setPlayerId: function(id) {
      this.playerId = id;
    },

    render: function() {
      var game     = this.game
        , score    = this.game.getScore()
        , pos      = 1
        , players  = _.reduce(score, function(result, score, id) {
            id = parseInt(id, 10);
            var player = game.getPlayer(id);
            if (player) {
              result.push({ name: player.getName(), id: id, pos: pos++, score: score });
            }
            return result;
          }, []);

      // Sort players by score and limit to top 15
      players = players.sort(function(a, b) {
        return a.score - b.score;
      }).slice(0, 15);

      var active   = false;
      // // Extract active player
      // var active   = false
      //   , playerId = this.playerId;
      // if (playerId) {
      //   active = _.find(players, function(player) { return player.id === playerId; });
      // }

      this.$el.html(template('scoreboard', { players: players, active: active }));
      return this;
    }

  });

});