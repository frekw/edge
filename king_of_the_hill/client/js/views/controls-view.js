define(['backbone', 'underscore'], function(Backbone, _) {

  return Backbone.View.extend({

    events: {
      'click .join'  : '_join'
    , 'click .leave' : '_leave'
    },

    render: function() {
      this.$el.html(template('controls'));
      return this;
    },

    hide: function() {
      this.$el.find('button').hide();
      return this;
    },

    connected: function() {
      this.$el.find('.join').show();
      this.$el.find('.leave').hide();
      return this;
    },

    joined: function() {
      this.$el.find('.join').hide();
      this.$el.find('.leave').show();
      return this;
    },

    _join: function(ev) {
      ev.preventDefault();
      this.$el.find('.join').hide();
      this.trigger('join');
    },

    _leave: function(ev) {
      ev.preventDefault();
      this.$el.find('.leave').hide();
      this.trigger('leave');
    }

  });

});