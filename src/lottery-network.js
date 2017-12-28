const { loadData } = require('./data')
const { LotteryData } = require('./lottery-data')
const { Architect, Trainer } = require('synaptic')

class LotteryNetwork {
  constructor({
    data,
    saved,
    input,
    hidden,
    output
  }) {
    this.data = data
    this.input = input
    this.hidden = hidden
    this.output = output
    if (saved) {
      this.net = Network.fromJSON(exported)
    } else {
      this.net = new Architect.LSTM(input, hidden, output)
    }
  }

  toJson() {
    return this.net.toJSON()
  }

  normalize(value) {
    const stats = this.data.getRowStatistics().stats()
    return (value - stats.min) / (stats.max - stats.min)
  }

  denormalize(value) {
    const stats = this.data.getRowStatistics().stats()
    return stats.min + (value * (stats.max - stats.min))
  }

  getTrainingSet() {
    if (this._trainingSet) {
      return this._trainingSet
    }
    const row = []
    return this._trainingSet = this.data.getRowStatistics().map(this.normalize.bind(this)).reduce((trainingSet, value) => {
      row.push(value)
      if (row.length >= (this.input + this.output)) {
        trainingSet.push({
          input: row.slice(0, this.input),
          output: row.slice(this.input, this.input + this.output)
        })
        // remove the first
        row.shift()
      }
      return trainingSet
    }, [])
  }

  train() {
    const trainingSet = this.getTrainingSet()
    new Trainer(this.net).train(trainingSet, {
      rate: .1,
      error: .00001,
      iterations: trainingSet.length,
      cost: Trainer.cost.MSE,
      schedule: {
        every: ~~(trainingSet.length / 100), // repeat this task every 500 iterations
        do(data) {
          console.log(`%j`, data)
        }
      }
    })
  }

  activate(input) {
    return this.net.activate(input)
  }

  predict(input) {

    const normalizedInput = (input || this.data.getRowStatistics().array())
      .slice(-this.input.input)
      .map(this.normalize.bind(this))

    return this.activate(normalizedInput)
      .map(this.denormalize.bind(this))
  }
}

const net = new LotteryNetwork({
  data: new LotteryData(loadData(`megasena`)),
  input: 6,
  hidden: 12,
  output: 1
})

const stats = net.data.getRowStatistics().stats()
console.log(stats)
console.log(net.normalize(stats.min))
console.log(net.normalize(stats.avg))
console.log(net.normalize(stats.max))

net.train()

console.log(`--- net`)
console.log(net.toJson())

console.log(`--- test`)
console.log(`input: %j`, net.getTrainingSet()[0].input)
console.log(`output: %j`, net.activate(net.getTrainingSet()[0].input))
console.log(`expected: %j`, net.getTrainingSet()[0].output)

console.log(`--- prediction`)
console.log(`predict: %j`, net.predict())

