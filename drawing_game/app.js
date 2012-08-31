var express = require('express')
  , http    = require('http')
  , app     = express()
  , server  = http.createServer(app)
  , io      = require('socket.io').listen(server)
  , jade    = require('jade')
  , jadevu  = require('jadevu')
  , Game    = require('./models/game')
  , imagedata
  
// TODO: Split conf. into dev and prod.
app.configure(function(){
  app.use(express.methodOverride())
  app.use(express.bodyParser())
  app.use(express.static(__dirname + '/static'))
  app.use(express.errorHandler({ dumpExceptions: true, showStacktrace: true }))
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(app.router)
  
  app.locals.pretty = true
})

io.set('log level', 1);

app.get('/', function(req, res, next){
  res.render('index')
})

server.listen(parseInt(process.argv[2], 10) || 3000)

var players = []
  , rooms   = []
  
io.sockets.on('connection', function(socket){
  socket.emit('ready')
  
  socket.on('player:create', function(player){
    console.log('Player data:', player)
    var game = Game.findGame()
    game.add({
      name: player.name
    , socket: socket
    })
    console.log('player created', player, game)
  })
  
  /*if(imagedata)
    io.sockets.emit('data', imagedata)*/
  
  /*socket.on('session', function(id){
    console.log('session received', id)
    socket.set('session', id)
  })*/  
  
  
  // Use broadcast instead of session ids.
  
  /*socket.on('data', function(data){
    console.log('received data')
    socket.get('session', function(err, sid){
      console.log('Got session w/ data', sid)
      imagedata = { image: data, id: sid }
      io.sockets.emit('data', imagedata)
    })
  })*/
})
