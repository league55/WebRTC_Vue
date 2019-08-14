'use strict'
const io = require('socket.io-client')

function prepareRtcRoom () {
  var isChannelReady = false
  var isInitiator = false
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
  var room = 'foo'
  // Could prompt for room name:
  // room = prompt('Enter room name:');

  var socket = io.connect('http://localhost:8090')

  if (room !== '') {
    socket.emit('create or join', room)
    console.log('Attempted to create or  join room', room)
  }

  socket.on('created', function (room) {
    console.log('Created room ' + room)
    isInitiator = true
  })

  socket.on('full', function (room) {
    console.log('Room ' + room + ' is full')
  })

  socket.on('join', function (room) {
    console.log('Another peer made a request to join room ' + room)
    console.log('This peer is the initiator of room ' + room + '!')
    isChannelReady = true
  })

  socket.on('joined', function (room) {
    console.log('joined: ' + room)
    isChannelReady = true
  })

  socket.on('log', function (array) {
    console.log.apply(console, array)
  })

  /// /////////////////////////////////////////////

  function sendMessage (message) {
    console.log('Client sending message: ', message)
    socket.emit('message', message)
  }

  // This client receives a message
  socket.on('message', function (message) {
    console.log('Client received message:', message)
    if (message === 'got user media') {
      console.log('User: got user media')
      maybeStart()
    } else if (message.type === 'offer') {
      console.log('User: offer')
      if (isInitiator && !isStarted) {
        maybeStart()
      }
      pc.setRemoteDescription(new RTCSessionDescription(message))
      doAnswer()
    } else if (message.type === 'answer' && isStarted) {
      console.log('User: answer')
      pc.setRemoteDescription(new RTCSessionDescription(message))
    } else if (message.type === 'candidate' && isStarted) {
      console.log('User: candidate')
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

  let remoteVideo

  function ready (localVideo, remVideo) {
    remoteVideo = remVideo
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
      .then((stream) => gotStream(stream, localVideo))
      .catch(function (e) {
        alert('getUserMedia() error: ' + e)
      })
  }

  function gotStream (stream, localVideo) {
    console.log('Adding local stream.')
    localStream = stream
    localVideo.srcObject = stream
    sendMessage('got user media')
    if (!isInitiator) {
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

  function maybeStart () {
    console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady)
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
      console.log('>>>>>> creating peer connection')
      createPeerConnection()
      pc.addStream(localStream)
      isStarted = true
      console.log('isInitiator', isInitiator)
      // if (isInitiator) {
      //   doCall()
      // }
    }
  }

  window.onbeforeunload = function () {
    sendMessage('bye')
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
    trace('Failed to create session description: ' + error.toString())
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
    stop()
    sendMessage('bye')
  }

  function handleRemoteHangup () {
    console.log('Session terminated.')
    stop()
    isInitiator = false
  }

  function stop () {
    isStarted = false
    pc.close()
    pc = null
  }

  return {
    hangup,
    ready,
    doCall
  }
}

module.exports = {
  prepareRtcRoom
}
