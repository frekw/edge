define(['backbone', 'underscore', 'bootstrap'], function(Backbone, _) {

  return Backbone.View.extend({

    events: {
      'click .signup' : '_signup'
    , 'click .cancel' : '_cancel'
    , 'keydown input' : '_cancelOnEscape'
    , 'shown'         : '_shown'
    },

    initialize: function(options) {
      _.bindAll(this, '_shown');
      this.render();
    },

    render: function() {
      this.setElement(template('signup'));
      this.$el.hide().modal({
        backdrop : 'static'
      , keyboard : false
      , show     : false
      }).on('shown', this._shown);
      return this;
    },

    show: function() {
      this.$('button').attr('disabled', false);
      this.$('.error').text('');
      this.$el.modal('show');
      this.$el.removeClass('animated flipOutX');
      return this;
    },

    hide: function() {
      this.$el.addClass('animated flipOutX');
      this.$el.modal('hide');
      return this;
    },

    error: function(message) {
      this.$('.error').text(message);
      this.$('button').attr('disabled', false);
    },

    _signup: function(e) {
      e.preventDefault();

      var name  = this.$('input[name="name"]').val()
        , error = this.$('.error');

      if (/^\s*$/.test(name)) {
        return error.text('Must supply name');
      }

      this.$('button').attr('disabled', true);
      console.log('trigger signup');
      this.trigger('signup', this.$('input[name="name"]').val());
    },

    _cancel: function(e) {
      e.preventDefault();
      this.hide();
      this.trigger('cancel');
    },

    _cancelOnEscape: function(e) {
      if (e.which === 27) this._cancel(e);
    },

    _shown: function() {
      this.$('input[name="name"]').focus();
    }

  });

});