var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var os = require('os')
var nodeStatic = require('node-static')
var socketIO = require('socket.io')
var http = require('http')

const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())
const port = process.env.PORT || 4000

var fileServer = new (nodeStatic.Server)()
var fileApp = http.createServer(function (req, res) {
  fileServer.serve(req, res)
}).listen(8090)

app.listen(port, function () {
  console.log('Listening on port ' + port)
})

const operatorRoutes = require('./expressRoutes/operatorRoutes')
const userRoutes = require('./expressRoutes/userRoutes')

app.use('/operators', operatorRoutes)
app.use('/users', userRoutes)
var io = socketIO.listen(fileApp)

let rooms = []

io.sockets.on('connection', function (socket) {
  // convenience function to log server messages on the client
  function log () {
    var array = ['Message from server:']
    array.push.apply(array, arguments)
    socket.emit('log', array)
  }

  socket.on('message', function (message) {
    if (message.room) {
      log('Client said to roommates: ', message)
      io.sockets.in(message.room).emit('message', message.message)
    } else {
      log('Client said to everyone: ', message)
      // for a real app, would be room-only (not broadcast)
      socket.broadcast.emit('message', message)
    }
  })

  socket.on('create', function () {
    let roomId = socket.id + 'R'
    log('Received request to create room ' + roomId)
    rooms.push({id: roomId, inWork: false})
    socket.join(roomId)
    log('Client ' + roomId + ' created room ')
    socket.emit('created', roomId)
    socket.broadcast.emit('all_rooms', rooms)
  })

  socket.on('get_rooms', function () {
    log('Received request to retrieve rooms list ')
    socket.emit('all_rooms', rooms)
  })

  socket.on('ask_join', function (roomId) {
    log('Received request to join room ', roomId)
    let found = rooms.find(r => r.id === roomId && !r.inWork)
    if (found) {
      found.inWork = true
      found.opId = socket.id
      log(rooms)
      socket.emit('allow_join', roomId)
    } else {
      socket.emit('room_busy', roomId)
    }
  })

  socket.on('do_join', function (roomId) {
    log('Received request to join room ', roomId)
    let found = rooms.find(r => r.id === roomId && r.opId === socket.id)
    if (found) {
      found.inWork = true
      log(rooms)
      socket.join(roomId)
      io.sockets.in(roomId).emit('operator_joined')
    } else {
      socket.emit('room_busy', roomId)
    }
  })

  socket.on('ipaddr', function () {
    var ifaces = os.networkInterfaces()
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address)
        }
      })
    }
  })
})
