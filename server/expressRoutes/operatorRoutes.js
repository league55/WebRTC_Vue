var express = require('express')
var io = require('socket.io')(80)
var itemRoutes = express.Router()
const operators = require('../data/operators')

// Defined store route
itemRoutes.route('/').post(function (req, res) {
  const operator = req.body
  operator.isFree = true
  operators.addOperator(operator)
  res.status(200).json({'item': 'Item added successfully'})
})

itemRoutes.route('/count').get(function (req, res) {
  res.status(200).json({'count': operators.getOperators().length})
})

itemRoutes.route('/').get(function (req, res) {
  res.status(200).json({operators: operators.getOperators()})
})

itemRoutes.route('/delete/:name').get(function (req, res) {
  operators.removeOperator(req.params)
  res.json('Successfully removed')
})

io.on('connection', function (socket) {
  console.log('contect operator')
})

io.of('operator', function (socket) {
  socket.on('conn', function (data) {
    console.log('connected operator ' + data.name)
    const operator = data
    operator.isFree = true
    operators.addOperator(operator)
  })

  socket.on('disconnect', function (data) {
    console.log('disconnected operator')
    operators.removeOperator(data)
  })
})

module.exports = itemRoutes
