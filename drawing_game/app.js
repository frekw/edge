var express = require('express')
  , app     = require('express').createServer()
  , io      = require('socket.io')
  
  
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

app.listen(3000)