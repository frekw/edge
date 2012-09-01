jQuery(function($) {

  var socket = io.connect();
  socket.on('buttons', function (buttons) {
    $('#buttons').empty();

    jQuery.each(buttons, function(index, button) {
      var tr      = $('<tr />')
        , name    = $('<td />').text(button.text).appendTo(tr)
        , href    = $('<td />').text(button.href).appendTo(tr)
        , active  = $('<td />').appendTo(tr)
        , group   = $('<div class="btn-group" data-toggle="buttons-radio" />').appendTo(active)
        , on      = $('<button type="button" class="btn btn-success">on</button>').appendTo(group)
        , off     = $('<button type="button" class="btn btn-danger">off</button>').appendTo(group)
        , primary = $('<td >').appendTo(tr)
        , set     = $('<button type="button" class="btn" data-toggle="button">Default</button>').appendTo(primary);

      on.click(function(ev) {
        ev.preventDefault();
        button.disabled = false;
        socket.emit('set buttons', buttons);
      });

      off.click(function(ev) {
        ev.preventDefault();
        button.disabled = true;
        button.primary = false;
        socket.emit('set buttons', buttons);
      });

      (button.disabled ? off : on).button('toggle');

      group.button();

      set.click(function(ev) {
        ev.preventDefault();
        var selected = button;
        jQuery.each(buttons, function(index, button) {
          if (button === selected) {
            button.disabled = false;
            button.primary = true;
          } else {
            button.primary = false;
          }
        });
        socket.emit('set buttons', buttons);
      });

      if (button.primary) set.button('toggle');

      tr.appendTo('#buttons');
    });
  });

});