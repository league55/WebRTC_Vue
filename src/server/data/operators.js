class OperatorRepo {
  constructor () {
    this.operators = []
  }

  getOperators () {
    return this.operators
  }

  addOperator (op) {
    this.operators.push(op)
  }

  removeOperator (op) {
    this.operators = this.operators.filter(operator => operator.name !== op.name)
  }

  changeStatus (id, status) {
    this.operators.forEach(operator => {
      if (operator.name === id) {
        operator.isFree = status
      }
    })
  }
}

module.exports = new OperatorRepo()
