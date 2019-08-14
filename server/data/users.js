class UserRepo {
  constructor () {
    this.users = []
  }

  getUsers () {
    return this.users
  }

  addUser (usr) {
    this.users.push(usr)
  }

  removeUser (usr) {
    this.users = this.users.filter(user => user.name !== usr.name)
  }
}

module.exports = new UserRepo()
