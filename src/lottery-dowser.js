const chalk = require('chalk')
const { log } = require('./log')
const { pad } = require('./utils/string')
const { Counter } = require('./utils/counter')

class LotteryDowser {
  constructor(name, data) {
    this.name = name
    this.data = data
    // register combination validators
    this.validators = {
      megasena: this.validateMegasena.bind(this),
      lotofacil: this.validateLotofacil.bind(this),
      lotomania: this.validateLotomania.bind(this)
    }
  }

  run(options) {
    this.executeStatistics(options)
    this.suggestNumbers(options)
    this.generateCombinations(options)
  }

  executeStatistics({ verbose, showNumbers, showRows }) {

    const rowStatistics = this.data.getRowStatistics()
    const numberStatistics = this.data.getNumberStatistics()
    const rowOcurrencyStatistics = this.data.getRowOccurrencyStatistics()

    log(chalk`{whiteBright.underline # By Number:}`)
    log(chalk` - stats: {blueBright %j}`, numberStatistics.stats())

    if (verbose || showNumbers) {
      numberStatistics.iterate((number, total) => {
        const relations = this.data.getNumberRelations(number)
        const relationKeys = relations.keys()
        const relationToString = (number) => {
          const relationOccur = relations.get(number)
          const numberOccur = numberStatistics.get(number)
          return `${pad(number, 2)}(${relationOccur}, ${numberOccur})`
        }
        log(chalk` * NUM {magentaBright %s}, total: {blueBright %s}, rel: {greenBright %s ... %s}`,
          pad(number, 2),
          pad(total, 3),
          relationKeys.slice(0, 3).map(relationToString).join(' ,'),
          relationKeys.slice(-3).map(relationToString).join(' ,'),
        )
      })
    }

    log(chalk`{whiteBright.underline # By Row:}`)
    log(chalk` - stats: {blueBright %j}`, rowStatistics.stats())
    log(chalk` - occur: {yellowBright %j}`, rowOcurrencyStatistics.values())

    if (verbose || showRows) {
      rowStatistics.iterate((row, total) => {
        log(chalk` * ROW {magentaBright %s}, total: {blueBright %s}, occur: {yellowBright %j}`,
          pad(Number(row) + 1, 4),
          pad(total, 4),
          this.data.getRowOccurrences().get(row).values()
        )
      })
    }
  }

  suggestNumbers({ size }) {

    const moreFrequently = this.data.getNumbersByRelation({ freq: `more` }).slice(0, size)
    const lessFrequently = this.data.getNumbersByRelation({ freq: `less` }).slice(0, size)

    const moreFrequentlyTotal = this.data.getRowOccurrencyTotal(moreFrequently)
    const lessFrequentlyTotal = this.data.getRowOccurrencyTotal(lessFrequently)

    log(chalk`{whiteBright.underline # Suggestions:}`)
    log(chalk` - numbers: {greenBright %j}, total: {blueBright %s} (freq. hight to low)`,
      moreFrequently,
      moreFrequentlyTotal
    )
    log(chalk` - occur  : {yellowBright %j}`, this.data.countOccurrences(moreFrequently).values())
    log(chalk` - numbers: {greenBright %j}, total: {blueBright %s} (freq. hight to low)`,
      lessFrequently,
      lessFrequentlyTotal
    )
    log(chalk` - occur  : {yellowBright %j}`, this.data.countOccurrences(lessFrequently).values())
  }

  generateCombinations({ generate, size, limit }) {

    if (!generate) {
      return
    }

    const counter = new Counter()
    const seedNumbers = this.data.getNumbersByRelation({ freq: `less` })

    log(chalk`{whiteBright.underline # Combinations:} %s`, limit ? `(limit of ${limit})` : `(no limit)` )

    this.data.combineNumbers(seedNumbers, size, (numbers, i) => {
      // stop it
      if (counter.greaterOrEqual(limit)) {
        return false
      }

      const occurrences = this.data.countOccurrences(numbers)

      if (this.validateCombination(numbers, occurrences)) {
        log(chalk`* COM {magentaBright %s}, numbers: {greenBright %j}, ocurrency: {yellowBright %j}`,
          i,
          numbers,
          occurrences.values()
        )
        counter.increment()
      } else if (i % 10000 === 0) {
        log(chalk`{yellowBright working...}`, i)
      }
    })
  }

  validateCombination(combination, occurrences) {
    const validator = this.validators[this.name]
    if (validator) {
      return validator(combination, occurrences)
    }
    return true
  }

  validateMegasena(combination, occurrences) {
    const validOccur =
      occurrences.get(3) <= 5 &&
      occurrences.get(4) === 0 &&
      occurrences.get(5) === 0 &&
      occurrences.get(6) === 0
    return validOccur && this.validateRowTotal(combination)
  }

  validateLotofacil(combination, occurrences) {
    return this.validateRowTotal(combination)
  }

  validateLotomania(combination, occurrences) {
    return this.validateRowTotal(combination)
  }

  validateRowTotal(numbers) {
    const rowStats = this.data.getRowStatistics().stats()
    const rowTotal = this.data.getRowOccurrencyTotal(numbers)
    return rowTotal > rowStats.min && rowTotal < rowStats.max
  }
}

module.exports = { LotteryDowser }
