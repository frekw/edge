jQuery(function($) {

  console.log('check support');

  if (!("WebSocket" in window)) {
    $('#unsupported').show();
    return;
  }

  console.log('connect to socket');
  var socket = io.connect();

  socket.on('buttons', function (buttons) {
    $('#buttons').empty();
    jQuery.each(buttons, function(index, button) {
      var link = $('<a href="#" class="btn btn-large btn-block" />').text(button.text);

      if (button.primary) {
        link.addClass('btn-primary');
      }

      if (button.disabled) {
        link.addClass('disabled');
        link.click(function() { return false; });
      } else {
        link.click(function(ev) {
          ev.preventDefault();
          window.location = 'http://' + button.host;
        });
      }

      link.appendTo('#buttons');
    });
  });

});