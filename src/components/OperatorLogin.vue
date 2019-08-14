<template>
  <div>
    <form v-on:submit.prevent="login">
      <br/>
      <div v-if="rooms">
        <table class="table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Is in work</th>
            <th>Join</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row of rooms" v-bind:key="row.id">
            <td>{{row.id}}</td>
            <td>{{row.inWork}}</td>
            <td><button v-on:click.prevent="()=>joinRoom(row.id)">X</button></td>
          </tr>
          </tbody>
        </table>
      </div>
    </form>
  </div>
</template>
<script>
const io = require('socket.io-client')
const socket = io.connect('http://localhost:' + ((process.env.PORT || 8090) + 100))
export default {
  mounted () {
    let self = this
    console.log(self.rooms)
    socket.emit('get_rooms')
    socket.on('all_rooms', (rooms) => {
      console.log(this.rooms)
      this.rooms = rooms
      console.log(this.rooms)
    })

    socket.on('room_busy', (rooms) => {
      console.log('desired room was busy')
      this.rooms = rooms
    })
    socket.on('allow_join', (roomId) => {
      console.log('was allowed to join: ' + roomId)
      this.$router.push({ name: 'OperatorRoom', params: { roomId, socket }, props: {socket} })
    })
  },
  methods: {
    joinRoom (roomId) {
      socket.emit('ask_join', roomId)
    }
  },
  props: {
    rooms: []
  }
}
</script>
