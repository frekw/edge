var server = require('./server/server');

/**
 * Start listening
 */
var port = parseInt(process.argv[2], 10) || 3000;

server.listen(port, function() {
  console.log("Server listening on port %d", server.address().port);
});
