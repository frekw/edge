var server = require('./server/server');

/**
 * Start listening
 */
var port       = parseInt(process.argv[2], 10) || 3003
  , bouncePort = parseInt(process.argv[3], 10);

server.listen(port, function() {
  console.log("Server listening on port %d", server.address().port);
});

if (bouncePort) {
  /**
   * Setup bouncer
   */
  require('bouncy')(function (req, bounce) {
    var host = req.headers.host || '';

    console.log('http://' + host + req.url);

    var found = server.buttons.some(function(button) {
      if (host === button.host && !button.disabled) {
        bounce(button.port);
        return true;
      }
      return false;
    });

    if (!found) {
      bounce(port);
    }

  }).listen(bouncePort, function() {
    console.log("Bouncy listening on port %d", bouncePort);
  });
}