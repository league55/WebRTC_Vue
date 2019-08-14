<template>
  <div>
    <h1>Enter Video App</h1>

    <div class="row">
      <div class="col-md-4">
        <router-link :to="{ name: 'OperatorLogin' }" class="btn btn-primary">Enter as operator</router-link>
      </div>
      <div class="col-md-4">
        <router-link :to="{ name: 'UserLogin' }" class="btn btn-primary">Enter as user</router-link>
      </div>
    </div><br />

    <div class="row">
      <div class="col-md-4">
        <h2>Operators</h2>
        <ul id="opers-list">
          <li v-for="operator in operators" v-bind:key="operator.name">
            {{ operator.name }}
          </li>
        </ul>      </div>
      <div class="col-md-4">
        <h2>Users</h2>
        <ul id="users-list">
          <li v-for="user in users" v-bind:key="user.name">
            {{ user.name }}
          </li>
        </ul>      </div>
    </div><br />
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
.btn-primary {
  color: #fff;
  background-color: #42b983;
  border-color: #1ab980;

}
</style>
