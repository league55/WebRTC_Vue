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

  socket.on('create', function (operatorId) {
    log('Received request to create or join operatorId ' + operatorId)
    rooms.push({id: operatorId, isFree: true, isReady: true})
    socket.join(operatorId)
    log('Client ID ' + socket.id + ' created operatorId ' + operatorId)
    socket.emit('created', operatorId, socket.id)
    socket.broadcast.emit('freeRoom', operatorId)
  })

  socket.on('getFreeRoom', function () {
    log('Received request to join room ')
    const room = rooms.find(room => room && room.isFree && room.isReady)
    if (room) {
      log('Room ' + room.id + ' is available')
      room.isFree = false
      socket.emit('freeRoom', room.id)
    } else {
      log('No rooms available')
      socket.emit('full', room)
    }
  })

  socket.on('join', function (roomId) {
    log('Received request to join room ')
    log(rooms)
    const room = rooms.find(room => room && room.id === roomId)
    if (room) {
      room.isFree = false
      log('Client ID ' + socket.id + ' joined room ' + room.id)
      io.sockets.in(room.id).emit('join', room.id)
      socket.join(room.id)
      socket.emit('joined', room.id, socket.id)
      io.sockets.in(room.id).emit('ready')
    } else {
      socket.emit('full', room.id)
    }
  })
  socket.on('operatorLeave', function (roomId) {
    log('Operator closing the room')
    rooms = rooms.filter(room => room.id !== roomId)
  })
  socket.on('operatorIsReady', function (roomId) {
    log('Operator is ready: ', roomId)
    if (roomId) {
      rooms = rooms.map(room => {
        if (room.id !== roomId) {
          room.isReady = true
        }
        return room
      })
    }
  })
  socket.on('userLeave', function (roomId) {
    log('User is leaving the room')
    if (roomId) {
      console.log(rooms)
      rooms = rooms.map(room => {
        if (room.id === roomId) {
          room.isFree = true
          room.isReady = true
        }
        socket.emit('freeRoom', room.id)
        return room;
      })
      console.log(rooms)
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
