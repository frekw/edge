define(['backbone', 'underscore'], function(Backbone, _) {

  var Leave = Backbone.View.extend({

    events: {
      'click button' : '_leave'
    },

    render: function() {
      this.$el.html(template('controls/leave'));
    },

    _leave: function() {
      event.preventDefault();
      this.trigger('leave');
    }

  });

  return {
    Leave: Leave
  };

});