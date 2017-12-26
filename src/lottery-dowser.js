const chalk = require('chalk')
const { log } = require('./log')
const { pad } = require('./utils/string')
const { Counter } = require('./utils/counter')

class CombinationValidator {
  constructor() {
    this.validators = {
      megasena: this.validateMegasena.bind(this),
      lotofacil: this.validateLotofacil.bind(this),
      lotomania: this.validateLotomania.bind(this)
    }
  }

  validate(name, combination, occcurrences) {
    const validator = this.validators[name]
    if (validator) {
      return validator(combination, occcurrences)
    }
    // otherwise, it's valid
    return true
  }

  validateMegasena(combination, occcurrences) {
    return
      occurrences.get(3) <= 3 &&
      occurrences.get(4) === 0 &&
      occurrences.get(5) === 0 &&
      occurrences.get(6) === 0
  }

  validateLotofacil(combination, occurrences) {
    return true
  }

  validateLotomania(combination, occurrences) {
    return true
  }
}

class LotteryDowser {
  constructor(name, data) {
    this.name = name
    this.data = data
    // register combination validators
    this.validator = new CombinationValidator()
  }

  run(options) {
    this.executeStatistics(options)
    this.suggestNumbers(options)
    this.generateCombinations(options)
  }

  executeStatistics({ verbose }) {

    const rowStatistics = this.data.getRowStatistics()
    const numberStatistics = this.data.getNumberStatistics()
    const rowOcurrencyStatistics = this.data.getRowOcurrencyStatistics()

    log(chalk`{whiteBright.inverse # By Number:}`)
    log(chalk` - statistics: {blueBright %j}`, numberStatistics.stats())

    if (verbose === true) {
      numberStatistics.iterate((number, total) => {
        const relations = this.data.getNumberRelations().get(number)
        const sortedRelations = relations.keys()
        const relationToString = (n) => `${pad(n, 2)}(${pad(numberStatistics.get(n), 3)})`

        log(chalk` * NUM {magentaBright %s}, total: {blueBright %s}, relations: {greenBright %s ... %s}`,
          pad(number, 2),
          pad(total, 3),
          sortedRelations.splice(0, 3).map(relationToString).join(','),
          sortedRelations.splice(-3).map(relationToString).join(',')
        )
      })
    }

    log(chalk`{whiteBright.inverse # By Row:}`)
    log(chalk` - statistics : {blueBright %j}`, rowStatistics.stats())
    log(chalk` - occurrences: {yellowBright %j}`, rowOcurrencyStatistics.values())

    if (verbose === true) {
      rowStatistics.iterate((row, total) => {
        log(chalk` * ROW {magentaBright %s}, total: {blueBright %s}, occurrences: {yellowBright %j}`,
          pad(Number(row) + 1, 4),
          pad(total, 4),
          this.data.getRowOccurrences().get(row).values()
        )
      })
    }
  }

  suggestNumbers({ size }) {

    const suggestedNumbers = this.data.getNumbersItercalatedByRelation().splice(0, size)

    log(chalk`{whiteBright.inverse # Suggestions:}`)
    log(chalk` - numbers     : {greenBright %j}`, suggestedNumbers)
    log(chalk` - occcurrences: {yellowBright %j}`, this.data.countOccurrences(suggestedNumbers).values())
  }

  generateCombinations({ generate, size, limit }) {

    if (!generate) {
      return
    }

    const counter = new Counter()
    const seedNumbers = this.data.getNumbersItercalatedByRelation()

    log(chalk`{whiteBright.inverse # Combinations:} %s`, limit ? `(limit of ${limit})` : `(no limit)` )

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

  validateCombination(numbers, occurrences) {
    return this.validator.validate(this.name, numbers, occurrences)
  }
}

module.exports = { LotteryDowser }
