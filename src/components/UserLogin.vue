<template>
  <div>
    <h1>Enter a room</h1>
    <form v-on:submit.prevent="login">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Your name</label>
            <input type="text" class="form-control" v-model="form.name">
          </div>
        </div>
      </div>
      <br/>
      <div class="form-group">
        <router-link :to="{name: 'UserRoom'}">
          <button class="btn btn-primary">Enter room</button>
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
      let uri = 'http://localhost:4000/users'
      this.axios.post(uri, this.form).then((response) => {
        console.log(response)
      })
    }
  }
}
</script>
