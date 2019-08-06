<template>
  <div>
    <h1>The room</h1>
    <div class="row">
      <div class="col-md-6">
        <p>Client</p>
      </div>
      <div class="col-md-3">
        <p>Local</p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <video id="remoteVideo" autoplay playsinline width="640" height="480"></video>
      </div>
      <div class="col-md-3">
        <video id="localVideo" autoplay playsinline width="320" height="240"></video>
      </div>
    </div>
    <div>
      <br/>
      <div>
        <button id="startButton" v-on:click.prevent="doStream" class="btn btn-primary">Ready</button>
        <button id="callButton" class="btn btn-primary">Call</button>
        <button id="hangupButton" class="btn btn-danger">Hang Up</button>
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
  methods: {
    doStream () {
      const callLogic = require('../rtc/rtc')
      callLogic.prepareRtcRoom()
    },
    snapPhoto () {
      var videoSnapsh = document.getElementById('localVideo')
      var photo = document.getElementById('snapshot')
      var photoContext = photo.getContext('2d')
      photoContext.drawImage(videoSnapsh, 0, 0, photo.width, photo.height)
    }
  }
}
</script>

<style scoped>

</style>
