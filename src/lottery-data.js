const { Statistics, StatisticMap } = require('./statistics')
const { countIntersection, generateCombinations } = require('./utils/array')

const ASC = 1, DESC = 2

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

  getRowSize() {
    return this.dataset[0].length
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
        stats.set(row, this.getRowOccurrencyTotal(numbers))
        return stats
      }, new Statistics())
    })
  }

  getRowOccurrencyTotal(numbers) {
    const stats = this.getNumberStatistics()
    return numbers.reduce((total, number) => total + stats.get(number), 0)
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

  getRowOccurrencyStatistics() {
    return this._field(`rowOccurrencyStatistics`, () => {
      const occurrences = new Statistics()
      const rowOccurrences = this.getRowOccurrences()
      rowOccurrences.iterate((row, statistics) => {
        statistics.iterate((occurrency, total) => {
          occurrences.add(occurrency, total)
        })
      })
      return occurrences
    })
  }

  getNumberRelations(key) {
    return this._field(`numberRelations`, () => {
      return this.dataset.reduce((relations, numbers) => {
        return numbers.reduce((relations, number) => {
          const relation = relations.get(number)
          numbers.filter(n => n !== number).forEach(n => relation.count(n))
          return relations
        }, relations)
      }, new StatisticMap())
    }).get(key)
  }

  countOccurrences(numbers) {
    const keys = numbers.map(Number)
    return this.dataset.reduce((stats, other) => {
      stats.count(countIntersection(keys, other))
      return stats
    }, new Statistics())
  }

  getNumbersByRelation({ freq }) {
    const keys = this.getNumberStatistics().keys()
    const reverse = (freq === `more`)
    return (reverse ? keys.reverse() : keys)
      .reduce((numbers, number) => {
        return this.mergeRelations(numbers, number, reverse)
      }, [])
  }

  mergeRelations(numbers, number, reverse) {
    if (!numbers.includes(number)) {
      const relations = this.getNumberRelations(number).keys()
      // add number
      numbers.push(number)
      // select the next number  
      return this.mergeRelations(numbers, relations[reverse ? relations.length - 1 : 0], reverse)
    }
    return numbers
  }

  combineNumbers(numbers, size, fn) {
    generateCombinations(numbers, size, fn)
  }
}

module.exports = { LotteryData }
