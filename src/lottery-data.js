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
      return this.dataset.reduce((stats, numbers) => {
        numbers.forEach(n => stats.count(n))
        return stats
      }, new Statistics())
    })
  }
  
  getRowStatistics() {
    return this._field(`rowStatistics`, () => {
      return this.dataset.reduce((stats, numbers, row) => {
        const numStats = this.getNumberStatistics()
        stats.set(row, numbers.reduce((t, n) => t + numStats.get(n), 0))
        return stats
      }, new Statistics())
    })
  }
  
  getRowOccurrences() {
    return this._field(`rowOccurrences`, () => {
      return this.dataset.reduce((occurrences, numbers, row) => {
        return this.dataset.reduce((occurrences, other) => {
          occurrences.get(row).count(countIntersection(numbers, other))
          return occurrences
        }, occurrences)
      }, new StatisticMap())
    })
  }

  getRowOcurrencyStatistics() {
    return this._field(`rowOcurrencyStatistics`, () => {
      const occurrences = new Statistics()
      const rowOccurrences = this.getRowOccurrences()
      rowOccurrences.iterate((row, statistics) => {
        statistics.iterate((ocurrency, total) => {
          occurrences.add(ocurrency, total)
        })
      })
      return occurrences
    })
  }

  getNumberRelations() {
    return this._field(`numberRelations`, () => {
      return this.dataset.reduce((relations, numbers) => {
        return numbers.reduce((relations, number) => {
          const relation = relations.get(number)
          numbers.filter(n => n !== number).forEach(n => relation.count(n))
          return relations
        }, relations)
      }, new StatisticMap())
    })
  }

  countOccurrences(numbers) {
    const keys = numbers.map(Number)
    return this.dataset.reduce((stats, other) => {
      stats.count(countIntersection(keys, other))
      return stats
    }, new Statistics())
  }

  getNumbersItercalatedByRelation() {
    return intercalate(this.mergeRelations(this.getNumberStatistics().keys()))
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

  combineNumbers(numbers, size, fn) {
    generateCombinations(numbers, size, fn)
  }
}

module.exports = { LotteryData }
