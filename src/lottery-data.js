const { Statistics, StatisticMap } = require('./statistics')
const { intercalate, countIntersection, generateCombinations } = require('./utils/array')

class LotteryData {

  constructor(dataset) {
    this._fields = {}
    this.dataset = dataset
  }

  _field(field, fn) {
    if (this._fields.hasOwnProperty(field)) {
      return this._fields[field]
    }
    if (fn) {
      return this._fields[field] = fn()
    }
    return null
  }

  _clear() {
    Object.keys(this._fields).map(field => delete this._fields[field])
  }

  getNumberStatistics() {
    return this._field(`numberStatistics`, () => {
      const { dataset } = this
      const stats = new Statistics()
      dataset.forEach(numbers => {
        numbers.forEach(n => stats.count(n))
      })
      return stats
    })
  }
  
  getRowStatistics() {
    return this._field(`rowStatistics`, () => {
      const { dataset } = this
      const stats = new Statistics()
      const numberStatistics = this.getNumberStatistics()
      dataset.forEach((numbers, row) => {
        const total = numbers.reduce((t, n) => t + numberStatistics.get(n), 0)
        stats.set(row, total)
      })
      return stats
    })
  }
  
  getRowOcurrencies() {
    return this._field(`rowOcurrencies`, () => {
      const { dataset } = this
      const ocurrencies = new StatisticMap()
      dataset.forEach((numbers, row) => {
        dataset.forEach(other => {
          ocurrencies.get(row).count(countIntersection(numbers, other))
        })
      })
      return ocurrencies
    })
  }

  getRowOcurrencyStatistics() {
    return this._field(`rowOcurrencyStatistics`, () => {
      const ocurrencies = new Statistics()
      const rowOcurrencies = this.getRowOcurrencies()
      rowOcurrencies.iterate((row, statistics) => {
        statistics.iterate((ocurrency, total) => {
          ocurrencies.add(ocurrency, total)
        })
      })
      return ocurrencies
    })
  }

  getNumberRelations() {
    return this._field(`numberRelations`, () => {
      const { dataset } = this
      const relations = new StatisticMap()
      dataset.forEach(numbers => {
        numbers.forEach(number => {
          const relation = relations.get(number)
          numbers.filter(n => n !== number).forEach(n => relation.count(n))
        })
      })
      return relations
    })
  }

  getOcurrencyCount(numbers) {
    const { dataset } = this
    const stats = new Statistics()
    const keys = numbers.map(Number)
    dataset.forEach((other) => stats.count(countIntersection(keys, other)))
    return stats
  }

  getNumbersItercalatedByRelation() {
    return intercalate(this.mergeRelations(this.getNumberStatistics().keys()))
  }

  combineNumbers(numbers, size, fn) {
    generateCombinations(numbers, size, fn)
  }

  mergeRelations(relations, numbers = []) {
    const numberRelations = this.getNumberRelations()
    for (let left = 0, right = relations.length - 1; left <= right;) {

      let leftNumber = relations[left++]
      let rightNumber = relations[right--]

      if (!numbers.includes(leftNumber)) {
        numbers.push(leftNumber)
        this.mergeRelations(numberRelations.get(leftNumber).keys(), numbers)
      }
      if (leftNumber !== rightNumber && !numbers.includes(rightNumber)) {
        numbers.push(rightNumber)
        this.mergeRelations(numberRelations.get(rightNumber).keys(), numbers)
      }
    }
    return numbers
  }
}

module.exports = { LotteryData }
