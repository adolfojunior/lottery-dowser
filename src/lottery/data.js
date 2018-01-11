const { Statistics, StatisticsArray } = require('../statistics')
const { countSortedIntersection, generateCombinations } = require('../utils/array')

class CachedFields {
  constructor(dataset) {
    this.fields = {}
  }

  field(field, fn) {
    if (this.fields.hasOwnProperty(field)) {
      return this.fields[field]
    }
    if (fn) {
      return this.fields[field] = fn()
    }
    return null
  }

  clear() {
    Object.keys(this.fields).map(field => delete this.fields[field])
  }
}

class LotteryData extends CachedFields {
  constructor(dataset) {
    super()
    this._dataset = dataset
  }

  rows() {
    return this._dataset
  }

  rowSize() {
    return this._dataset[0].length
  }

  numberStatistics() {
    return this.field(`numberStatistics`, () => {
      const dataset = this._dataset
      const statistics = new Statistics()
      for (let row = 0; row < dataset.length; row++) {
        const numbers = dataset[row]
        for (let n = 0; n < numbers.length; n++) {
          statistics.count(numbers[n])
        }
      }
      return statistics
    })
  }

  rowStatistics() {
    return this.field(`rowStatistics`, () => {
      const dataset = this._dataset
      const statistics = new Statistics()
      for (let row = 0; row < dataset.length; row++) {
        statistics.set(row, this.rowOccurrencyTotal(dataset[row]))
      }
      return statistics
    })
  }

  rowOccurrencyTotal(numbers) {
    let total = 0
    const statistics = this.numberStatistics()
    for (let n = 0, len = numbers.length; n < len; n++) {
      total += statistics.get(numbers[n])
    }
    return total
  }

  rowOccurrences() {
    return this.field(`rowOccurrences`, () => {
      const dataset = this._dataset
      const statistics = new StatisticsArray()
      for (let i = 0; i < dataset.length; i++) {
        for (let j = 0; j < dataset.length; j++) {
          statistics.get(i).count(countSortedIntersection(dataset[i], dataset[j]))
        }
      }
      return statistics
    })
  }

  rowOccurrencesBeforeMatch() {
    return this.field(`rowStatisticsOccurrencyBefore`, () => {
      const dataset = this._dataset
      const occurrences = new StatisticsArray()
      for (let row = 0; row < dataset.length; row++) {
        const rowStatistics = this.rowStatisticsBeforeMatch(row)
        rowStatistics.forEach((total, ocurrency) => {
          occurrences.get(ocurrency).set(row, total)
        })
      }
      return occurrences
    })
  }

  rowStatisticsBeforeMatch(row) {
    return this.field(`rowStatisticsBeforeMatch`, () => {
      const dataset = this._dataset
      const statistics = new StatisticsArray()
      for (let row = 0; row < dataset.length; row++) {
        const numbers = dataset[row]
        const rowStatistics = statistics.get(row)
        // compute untill it match
        for (let i = 0; i < row; i++) {
          rowStatistics.count(countSortedIntersection(numbers, dataset[i]))
        }
      }
      return statistics
    }).get(row)
  }

  rowOccurrencyStatistics() {
    return this.field(`rowOccurrencyStatistics`, () => {
      const occurrences = new Statistics()
      this.rowOccurrences().forEach((statistics, row) => {
        statistics.forEach((total, occurrency) => {
          occurrences.add(occurrency, total)
        })
      })
      return occurrences
    })
  }

  numberRelations(key) {
    return this.field(`numberRelations`, () => {
      const dataset = this._dataset
      const relations = new StatisticsArray()
      for (let row = 0; row < dataset.length; row++) {
        const numbers = dataset[row]
        for (let n = 0; n < numbers.length; n++) {
          const relation = relations.get(numbers[n])
          for (let ns = 0; ns < numbers.length; ns++) {
            if (n !== ns) {
              relation.count(numbers[ns])
            }
          }
        }
      }
      return relations
    }).get(key)
  }

  countOccurrences(numbers) {
    const dataset = this._dataset
    const statistics = new Statistics()
    const sorted = numbers.sort((a, b) => a - b)
    for (let row = 0, len = dataset.length; row < len; row++) {
      statistics.count(countSortedIntersection(sorted, dataset[row]))
    }
    return statistics
  }

  numbersByRelation(sort = `asc`) {
    const result = []
    const reverse = (sort !== `asc`)
    const numbers = reverse ? this.numberStatistics().keys().reverse() : this.numberStatistics().keys()
    for (let n = 0, len = numbers.length; n < len; n++) {
      this.mergeRelations(result, numbers[n], reverse)
    }
    return result
  }

  mergeRelations(numbers, number, reverse) {
    if (!numbers.includes(number)) {
      const relations = this.numberRelations(number).keys()
      // add number
      numbers.push(number)
      // select the next number  
      return this.mergeRelations(numbers, relations[reverse ? relations.length - 1 : 0], reverse)
    }
    return numbers
  }

  combineNumbers(numbers, size, fn) {
    return generateCombinations(numbers, size, fn)
  }
}

module.exports = { LotteryData }
