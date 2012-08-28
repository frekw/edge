var express  = require('express')
  , stylus   = require('stylus')
  , fs       = require('fs')
  , path     = require('path')
  , jadevu   = require('jadevu')
  , clientjs = require('../client/js')
  , socketIO = require('./client-apis/socket.io-api');

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
  app.use(express.session({ secret: 'king-of-the-hill' }));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(stylus.middleware({ src: CLIENT_DIR, dest: STATIC_DIR }));
  app.use(express['static'](STATIC_DIR));

});

app.configure('development', function() {
  // Also expose client directory in develoment
  app.use('/js', express['static'](CLIENT_JS_DIR));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

/**
 * Application
 */

require('jadevu');

app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Game
 */

var gameAttrs = {
  radius    : 1000
, gravity   : 10
, time_step : 1/30
};

var playerAttrs = {
  position : { x: 0, y: 0 }
, radius   : 10
, weight   : 15
, movement : { friction: 0.9, force: 50, cutoff: 0.5 }
, score    : { scale: 10 }
};

clientjs.require(['js/lib/game'], function(Game) {

  // Create game
  var game = new Game(gameAttrs);

  // Trigger update of game according to time_step
  var ticks = 0, start = Date.now();
  setInterval(function() {
    game.tick();
    ticks++;
  }, gameAttrs.time_step * 1000);

  // setInterval(function() {
  //   console.log('tps = %s', (ticks / (Date.now() - start) * 1000).toFixed(2));
  // }, 1000);

  // Startup SocketIO interface
  socketIO.listen(app, game, playerAttrs);

});