const { Statistics, StatisticMap } = require('./statistics')
const { intercalate, intersectionCount, arrayCombinations } = require('./utils')

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
      const all = this.dataset
      const stats = new Statistics()
      all.forEach(numbers => {
        numbers.forEach(n => stats.count(n))
      })
      return stats
    })
  }
  
  getRowStatistics() {
    return this._field(`rowStatistics`, () => {
      const all = this.dataset
      const stats = new Statistics()
      const numberStatistics = this.getNumberStatistics()
      all.forEach((numbers, row) => {
        const total = numbers.reduce((t, n) => t + numberStatistics.get(n), 0)
        stats.set(row, total)
      })
      return stats
    })
  }
  
  getRowOcurrencies() {
    return this._field(`rowOcurrencies`, () => {
      const all = this.dataset
      const ocurrencies = new StatisticMap()
      all.forEach((numbers, row) => {
        all.forEach(other => {
          ocurrencies.get(row).count(intersectionCount(numbers, other))
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
      const all = this.dataset
      const relations = new StatisticMap()
      all.forEach(numbers => {
        numbers.forEach(number => {
          const relation = relations.get(number)
          numbers.filter(n => n !== number).forEach(n => relation.count(n))
        })
      })
      return relations
    })
  }

  getOcurrencyCount(numbers) {
    const all = this.dataset
    const stats = new Statistics()
    const keys = numbers.map(Number)
    all.forEach((other) => stats.count(intersectionCount(keys, other)))
    return stats
  }

  getNumbersItercalatedByRelation() {
    return intercalate(this.mergeRelations(this.getNumberStatistics().keys()))
  }

  combineNumbers(numbers, size, fn) {
    arrayCombinations(numbers, size, fn)
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
