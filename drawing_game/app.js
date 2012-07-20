var express = require('express')
  , http    = require('http')
  , app     = express()
  , server  = http.createServer(app)
  , io      = require('socket.io').listen(server)
  , imagedata
  
// TODO: Split conf. into dev and prod.
app.configure(function(){
  app.use(express.methodOverride())
  app.use(express.bodyParser())
  app.use(express.static(__dirname + '/static'))
  app.use(express.errorHandler({ dumpExceptions: true, showStacktrace: true }))
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.set('view options', { layout: true })
  app.use(app.router)
})

app.get('/', function(req, res, next){
  res.render('index')
})

server.listen(3000)

io.sockets.on('connection', function(socket){
  if(imagedata)
    io.sockets.emit('data', imagedata)
  
  socket.on('session', function(id){
    console.log('session received', id)
    socket.set('session', id)
    socket.emit('ready')
  })
  
  socket.on('data', function(data){
    console.log('received data')
    socket.get('session', function(err, sid){
      console.log('Got session w/ data', sid)
      imagedata = { image: data, id: sid }
      io.sockets.emit('data', imagedata)
    })
  })
})
