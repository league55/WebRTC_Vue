<template>
  <div>
    <h1>Create a room</h1>
    <form v-on:submit.prevent="login">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Displayed name</label>
            <input type="text" class="form-control" v-model="form.name">
          </div>
        </div>
      </div>
      <br/>
      <div class="form-group">
        <router-link :to="{name: 'Room'}">
          <button class="btn btn-primary">Ready</button>
        </router-link>
      </div>
    </form>
  </div>
</template>
<script>
export default {
  data () {
    return {
      form: {}
    }
  },
  methods: {
    login () {
      // const io = require('socket.io-client')
      // var connect = io.connect('http://localhost:80/operator')
      // connect.emit('conn', this.form)
    }
  }
}
</script>
