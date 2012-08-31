var express  = require('express')
  , stylus   = require('stylus')
  , path     = require('path')
  , SocketIO = require('socket.io');

// Static configuration
var ROOT_DIR      = path.join(__dirname, '..')
  , STATIC_DIR    = path.join(ROOT_DIR, 'static')
  , CLIENT_DIR    = path.join(ROOT_DIR, 'client')
  , VIEW_DIR      = path.join(CLIENT_DIR, 'jade')
  , CLIENT_JS_DIR = path.join(CLIENT_DIR, 'js');


/**
 * Setup express
 */

var app = module.exports = express.createServer();

app.configure(function(){

  app.set('views', VIEW_DIR);
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  // Plugins
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'index' }));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(stylus.middleware({ src: CLIENT_DIR, dest: STATIC_DIR }));
  app.use(express['static'](STATIC_DIR));
  app.use('/js', express['static'](CLIENT_JS_DIR));

});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

/**
 * Application
 */

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/admin', function(req, res) {
  res.render('admin');
});

var io = SocketIO.listen(app);

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging
io.set('transports', [                     // enable all transports (optional if you want flashsocket)
  'websocket'
]);

app.buttons = [
  { text: 'demo 1', host: 'monitor.fnnl.se', port: 9000, disabled: false, primary: true },
  { text: 'demo 2', host: 'draw.fnnl.se', port: 3000, disabled: true },
  { text: 'demo 3', host: 'hill.fnnl.se', port: 3001, disabled: true }
];

app.updateButtons = function() {
  io.sockets.emit('buttons', app.buttons);
};

// Listen for incoming connections
io.sockets.on('connection', function(socket) {
  // Send buttons
  socket.emit('buttons', app.buttons);

  socket.on('set buttons', function(buttons_) {
    app.buttons = buttons_;
    app.updateButtons();
  });
});