var Express = require('express')
var app = Express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

server.listen(3000, function(){
  console.log('listening on localhost 3000')
})

io.on('connection', function(socket){
  console.log('someone has entered the room')
})

io.on('connection', function(socket){
  socket.on('post event', function(message){
    console.log(message)
    io.emit('post event', message)
  })
})
