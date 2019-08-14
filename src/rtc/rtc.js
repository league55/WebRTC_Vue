'use strict'

function prepareRtcRoom (localVideo, remoteVideo, roomId, socket) {
  var isChannelReady = false
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

  console.log('Joining to ' + roomId)
  socket.emit('do_join', roomId)

  socket.on('operator_joined', function (room) {
    isChannelReady = true
    ready()
      .then(doCall)
  })

  socket.on('log', function (array) {
    console.log.apply(console, array)
  })

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
    if (message.type === 'offer') {
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
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
      .then(gotStream)
      .catch(function (e) {
        alert('getUserMedia() error: ' + e)
      })
  }

  function gotStream (stream) {
    console.log('Adding local stream.')
    localStream = stream
    localVideo.srcObject = stream
    sendMessage('got user media')
    maybeStart()
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
    }
  }

  window.onbeforeunload = function () {
    if (roomId) {
      sendMessage('bye', roomId)
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

  function setLocalAndSendMessage (sessionDescription) {
    pc.setLocalDescription(sessionDescription)
    console.log('setLocalAndSendMessage sending message', sessionDescription)
    sendMessage(sessionDescription)
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

  function doAnswer () {
    console.log('Sending answer to peer.')
    pc.createAnswer().then(
      setLocalAndSendMessage,
      onCreateSessionDescriptionError
    )
  }

  function onCreateSessionDescriptionError (error) {
    console.trace('Failed to create session description: ' + error.toString())
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
    if (roomId) {
      sendMessage('bye', roomId)
      stop()
    }
  }

  function handleRemoteHangup () {
    console.log('Session terminated.')
    sendMessage('bye', roomId)
    stop()
  }

  function stop () {
    isStarted = false
    pc.close()
    pc = null
  }

  return {
    hangup
  }
}

module.exports = {
  prepareRtcRoom
}
