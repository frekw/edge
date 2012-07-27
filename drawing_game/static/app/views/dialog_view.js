define(['backbone', 'underscore', 'app/views/tooltip_view'], function(bb, _, Tooltip){
  return bb.View.extend({
    events: {
      'click .button': 'didSubmitForm'
    , 'submit form': 'didSubmitForm'
    }
  , initialize: function(){
      _.bindAll(this, 'render', 'didSubmitForm')
      this.render()
    }
      
  , render: function(){
      this.$el.html(template('dialog'))
    }

  , didSubmitForm: function(e){
      e.preventDefault();
      var name = this.$('input[type=text]').val()

      if(this.tooltip) this.tooltip.hide()
      
      if(name.length < 1) this.markFormAsInvalid()
      else this.trigger('create', { name: name })
    }
    
  , markFormAsInvalid: function(){
      this.$('input[type=text]').addClass('invalid').focus()
      if(this.tooltip) this.tooltip.show(this.$('input[type=text]'))
      else  this.tooltip = new Tooltip()
                            .text('You forgot to enter your name!')
                            .show(this.$('input[type=text]'))
    }
  , destroy: function(){
      this.off('create')
      this.undelegateEvents()
    }
  })
})