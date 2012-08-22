var app = require('./server/app');

/**
 * Start listening
 */
var port = parseInt(process.argv[1], 10) || 3000;

app.listen(port, function() {
  console.log("Server listening on port %d", app.address().port);
});
