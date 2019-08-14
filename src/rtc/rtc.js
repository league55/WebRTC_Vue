'use strict'
const io = require('socket.io-client')

function prepareRtcRoom (localVideo, remoteVideo, isUser, adminId, foundRoomsCallBack) {
  var isChannelReady = false
  var isAdmin = false
  var isStarted = false
  var localStream
  var pc
  var remoteStream
  var turnReady

  var pcConfig = {
    'iceServers': [{
      'urls': 'stun:stun.l.google.com:19302'
    }]
  }
  var room = adminId
  // Could prompt for room name:
  // room = prompt('Enter room name:');

  var socket = io.connect('http://localhost:8090')

  if (!isUser) {
    socket.emit('create', room)
    console.log('Attempted to create room: ', room)
  } else {
    socket.emit('getFreeRoom')
  }

  socket.on('created', function (room) {
    console.log('Created room ' + room)
    isAdmin = true
  })

  socket.on('full', function (room) {
    console.log('No free rooms')
  })

  if (isUser) {
    socket.on('freeRoom', function (freeRoom) {
      if (!room) {
        socket.emit('join', freeRoom)
        console.log('Joining to ' + freeRoom)
        foundRoomsCallBack()
      }
    })
  }

  socket.on('join', function (room) {
    console.log('Another peer made a request to join room ' + room)
    console.log('This peer is the admin of room ' + room + '!')
    foundRoomsCallBack()
    isChannelReady = true
  })

  socket.on('joined', function (roomId) {
    console.log('joined: ' + roomId)
    isChannelReady = true
    room = roomId
    ready()
  })

  socket.on('log', function (array) {
    console.log.apply(console, array)
  })

  /// /////////////////////////////////////////////

  function sendMessage (message, room) {
    if (room) {
      console.log('Client sending message to room mates: ', message)
      socket.emit('message', {message, room})
    } else {
      console.log('Client sending message: ', message)
      socket.emit('message', message)
    }
  }

  // This client receives a message
  socket.on('message', function (message) {
    console.log('Client received message:', message)
    if (message === 'got user media') {
      // maybeStart()
    } else if (message.type === 'offer') {
      if (isAdmin && !isStarted) {
        maybeStart()
      }
      pc.setRemoteDescription(new RTCSessionDescription(message))
      doAnswer()
    } else if (message.type === 'answer' && isStarted) {
      pc.setRemoteDescription(new RTCSessionDescription(message))
    } else if (message.type === 'candidate' && isStarted) {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
      })
      pc.addIceCandidate(candidate)
    } else if (message === 'bye' && isStarted) {
      handleRemoteHangup()
    }
  })

  /// /////////////////////////////////////////////////

  function ready () {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
      .then(gotStream)
      .catch(function (e) {
        alert('getUserMedia() error: ' + e)
      })
  }

  function readyOnceMore () {
    socket.emit('operatorIsReady', room)
  }

  function gotStream (stream) {
    console.log('Adding local stream.')
    localStream = stream
    localVideo.srcObject = stream
    sendMessage('got user media')
    if (!isAdmin) {
      maybeStart()
    }
  }

  var constraints = {
    video: true
  }

  console.log('Getting user media with constraints', constraints)

  if (location.hostname !== 'localhost') {
    requestTurn(
      'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    )
  }
  if (turnReady) {
    console.log(turnReady)
  }

  function maybeStart () {
    console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady)
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
      console.log('>>>>>> creating peer connection')
      createPeerConnection()
      pc.addStream(localStream)
      isStarted = true
      console.log('isAdmin', isAdmin)
    // if (isAdmin) {
    //   doCall()
    // }
    }
  }

  window.onbeforeunload = function () {
    if (room) {
      sendMessage('bye', room)
    }
  }

  /// //////////////////////////////////////////////////////

  function createPeerConnection () {
    try {
      pc = new RTCPeerConnection(null)
      pc.onicecandidate = handleIceCandidate
      pc.onaddstream = (event) => handleRemoteStreamAdded(event, remoteStream)
      pc.onremovestream = handleRemoteStreamRemoved
      console.log('Created RTCPeerConnnection')
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message)
      alert('Cannot create RTCPeerConnection object.')
    }
  }

  function handleIceCandidate (event) {
    console.log('icecandidate event: ', event)
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      })
    } else {
      console.log('End of candidates.')
    }
  }

  function handleCreateOfferError (event) {
    console.log('createOffer() error: ', event)
  }

  function doCall () {
    console.log('Sending offer to peer')
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError)
  }

  function doAnswer () {
    console.log('Sending answer to peer.')
    pc.createAnswer().then(
      setLocalAndSendMessage,
      onCreateSessionDescriptionError
    )
  }

  function setLocalAndSendMessage (sessionDescription) {
    pc.setLocalDescription(sessionDescription)
    console.log('setLocalAndSendMessage sending message', sessionDescription)
    sendMessage(sessionDescription)
  }

  function onCreateSessionDescriptionError (error) {
    console.trace('Failed to create session description: ' + error.toString())
  }

  function requestTurn (turnURL) {
    var turnExists = false
    for (var i in pcConfig.iceServers) {
      if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
        turnExists = true
        turnReady = true
        break
      }
    }
    if (!turnExists) {
      console.log('Getting TURN server from ', turnURL)
      // No TURN server. Get one from computeengineondemand.appspot.com:
      var xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var turnServer = JSON.parse(xhr.responseText)
          console.log('Got TURN server: ', turnServer)
          pcConfig.iceServers.push({
            'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
            'credential': turnServer.password
          })
          turnReady = true
        }
      }
      xhr.open('GET', turnURL, true)
      xhr.send()
    }
  }

  function handleRemoteStreamAdded (event, remoteStream) {
    console.log('Remote stream added.')
    remoteStream = event.stream
    remoteVideo.srcObject = remoteStream
  }

  function handleRemoteStreamRemoved (event) {
    console.log('Remote stream removed. Event: ', event)
  }

  function hangup () {
    console.log('Hanging up.')
    if (room) {
      sendMessage('bye', room)
      stop()
    }
  }

  function handleRemoteHangup () {
    console.log('Session terminated.')
    socket.emit('userLeave', room)
    stop()
    isAdmin = false
  }

  function stop () {
    isStarted = false
    pc.close()
    pc = null
  }

  return {
    hangup,
    ready,
    readyOnceMore,
    doCall
  }
}

module.exports = {
  prepareRtcRoom
}
