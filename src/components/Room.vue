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
    <div class="row">
        <video id="remoteVideo" autoplay playsinline width="640" height="480" v-on:click.prevent="toggleSize"></video>
        <video id="localVideo" autoplay playsinline width="320" height="240" v-on:click.prevent="toggleSize"></video>
    </div>
    <div>
      <br/>
      <div>
        <button id="callButton" v-on:click.prevent="rtc.doCall" class="btn btn-primary" v-if="isUser">Call</button>
        <button id="startButton" v-on:click.prevent="doStream" class="btn btn-primary" v-else>Ready</button>
        <button id="hangupButton" v-on:click.prevent="rtc.hangup" class="btn btn-danger" ref="hangUp">Hang Up</button>
        <button id="snapshotBtn" v-on:click.prevent="snapPhoto" class="btn">Snapshot</button>
      </div>
    </div>
    <div class="row">
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
    const callLogic = require('../rtc/rtc')
    const toogleRemote = (mode) => {
      document.getElementById('remoteVideo').style.display = mode
    }
    toogleRemote('none')
    var localVideo = document.querySelector('#localVideo')
    var remoteVideo = document.querySelector('#remoteVideo')
    this.rtc = callLogic.prepareRtcRoom(localVideo, remoteVideo, this.isUser, this.$route.params.operatorId, () => toogleRemote('inline'))
    this.rtc.ready()
  },
  methods: {
    doStream () {
      this.rtc.readyOnceMore()
    },
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
    isUser: {
      type: Boolean,
      default: false
    }
  }

}
</script>

<style scoped>

</style>
