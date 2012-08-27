define(['backbone', 'underscore'], function(Backbone, _){

  var Alert = Backbone.View.extend({

    events: {
      'click' : 'close'
    },

    initialize: function(options) {
      _.bindAll(this, 'close');
    },

    type: function(type) {
      this.type = type;
      return this;
    },

    message: function(message) {
      this.message = message;
      return this;
    },

    render: function(){
      var args = { content: this.message, title: this.title };
      this.setElement(template('alert', args));
      this.$el
        .addClass('alert-' + this.type)
        .addClass('animated fadeInDown');
      setTimeout(this.close, this.options.timeout || 2000);
      return this;
    },

    close: function() {
      var el = this.$el;
      el.addClass('fadeOutUp');
      setTimeout(function() { el.remove(); }, 600);
      return this;
    }

  });

  return Backbone.View.extend({

    show: function(type, message) {
      var alert = new Alert().type(type).message(message);
      this.$el.append(alert.render().el);
    },

    info: function(message) {
      return this.show('info', message);
    },

    success: function(message) {
      return this.show('success', message);
    },

    warn: function(message) {
      return this.show('warn', message);
    },

    error: function(message) {
      return this.show('error', message);
    }

  });

});