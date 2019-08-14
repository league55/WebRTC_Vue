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
    <div class="row" >
        <video id="remoteVideo" autoplay playsinline width="640" height="480" v-on:click.prevent="toggleSize"></video>
        <video id="localVideo" autoplay playsinline width="320" height="240" v-on:click.prevent="toggleSize"></video>
    </div>
    <div>
      <br/>
      <div >
        <button id="hangupButton" v-on:click.prevent="rtc.hangup" class="btn btn-danger" ref="hangUp">Hang Up</button>
        <button id="snapshotBtn" v-on:click.prevent="snapPhoto" class="btn">Snapshot</button>
      </div>
    </div>
    <div class="row" >
      <div class="col-md-3">
        <canvas id="snapshot" width="640" height="480"></canvas>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Room',
  mounted () {
    this.roomId = this.$route.params.roomId
    const callLogic = require('../rtc/rtc')

    var localVideo = document.querySelector('#localVideo')
    var remoteVideo = document.querySelector('#remoteVideo')
    this.rtc = callLogic.prepareRtcRoom(localVideo, remoteVideo, this.roomId, this.$props.socket)
  },
  methods: {
    snapPhoto () {
      var videoSnapsh = document.getElementById('remoteVideo')
      var photo = document.getElementById('snapshot')
      var photoContext = photo.getContext('2d')
      photoContext.drawImage(videoSnapsh, 0, 0, photo.width, photo.height)
    },
    toggleSize () {
      const localVideo = document.getElementById('localVideo')
      const remoteVideo = document.getElementById('remoteVideo')
      const temp = {width: localVideo.width, height: localVideo.height}
      localVideo.setAttribute('width', remoteVideo.width)
      localVideo.setAttribute('height', remoteVideo.height)
      remoteVideo.setAttribute('width', temp.width)
      remoteVideo.setAttribute('height', temp.height)
    }
  },
  props: {
    socket: {
    }
  }

}
</script>

<style scoped>

</style>
