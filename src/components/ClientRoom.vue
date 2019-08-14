<template>
  <div>
    <h1>The room</h1>
    <div class="row">
      <div class="col-md-6">
        <p>Client</p>
      </div>
      <div class="col-md-6">
        <p>Local</p>
      </div>
    </div>
    <div class="row" v-show="operatorIsCalling">
      <video id="remoteVideo" autoplay playsinline width="640" height="480" v-on:click.prevent="toggleSize"></video>
      <video id="localVideo" autoplay playsinline width="320" height="240" v-on:click.prevent="toggleSize"></video>
    </div>
    <div class="row" v-show="!operatorIsCalling">
      Waiting for operator to connect
    </div>
    <div>
      <br/>
      <div v-show="operatorIsCalling">
        <button id="hangupButton" v-on:click.prevent="rtc.hangup" class="btn btn-danger" ref="hangUp">Hang Up</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Room',
  beforeCreate () {
    this.operatorIsCalling = false
  },
  mounted () {
    const callLogic = require('../rtc/rtc_host')
    const toogleRemote = (operatorIsCalling) => {
      this.operatorIsCalling = operatorIsCalling
    }

    var localVideo = document.querySelector('#localVideo')
    var remoteVideo = document.querySelector('#remoteVideo')
    this.rtc = callLogic.prepareRtcRoom(localVideo, remoteVideo, () => toogleRemote(true))
  },
  methods: {
    snapPhoto () {
      var videoSnapsh = document.getElementById('localVideo')
      var photo = document.getElementById('snapshot')
      var photoContext = photo.getContext('2d')
      photoContext.drawImage(videoSnapsh, 0, 0, photo.width, photo.height)
    },
    toggleSize () {
      const localVideo = document.querySelector('#localVideo')
      const remoteVideo = document.querySelector('#remoteVideo')
      const temp = {width: localVideo.width, height: localVideo.height}
      localVideo.setAttribute('width', remoteVideo.width)
      localVideo.setAttribute('height', remoteVideo.height)
      remoteVideo.setAttribute('width', temp.width)
      remoteVideo.setAttribute('height', temp.height)
    }
  },
  props: {
    operatorIsCalling: {
      type: Boolean,
      default: false
    }
  }

}
</script>

<style scoped>

</style>
