const express = require('express')
const itemRoutes = express.Router()
const users = require('../data/users')

// Defined store route
itemRoutes.route('/').post(function (req, res) {
  const user = req.body
  user.isFree = true
  users.addUser(user)
  res.status(200).json({'item': 'Item added successfully'})
})

itemRoutes.route('/count').get(function (req, res) {
  res.status(200).json({'count': users.getUsers().length})
})

itemRoutes.route('/').get(function (req, res) {
  res.status(200).json({users: users.getUsers()})
})

itemRoutes.route('/delete/:name').get(function (req, res) {
  users.removeUser(req.params)
  res.json('Successfully removed')
})

module.exports = itemRoutes
