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

  validate(name, combination, occurrencies) {
    const validator = this.validators[name]
    if (validator) {
      return validator(combination, occurrencies)
    }
    // otherwise, it's valid
    return true
  }

  validateMegasena(combination, occurrencies) {
    return
      ocurrencies.get(3) <= 3 &&
      ocurrencies.get(4) === 0 &&
      ocurrencies.get(5) === 0 &&
      ocurrencies.get(6) === 0
  }

  validateLotofacil(combination, ocurrencies) {
    return true
  }

  validateLotomania(combination, ocurrencies) {
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
    log(chalk` - ocurrencies: {yellowBright %j}`, rowOcurrencyStatistics.values())

    if (verbose === true) {
      rowStatistics.iterate((row, total) => {
        log(chalk` * ROW {magentaBright %s}, total: {blueBright %s}, ocurrencies: {yellowBright %j}`,
          pad(Number(row) + 1, 4),
          pad(total, 4),
          this.data.getRowOcurrencies().get(row).values()
        )
      })
    }
  }

  suggestNumbers({ size }) {

    const suggestedNumbers = this.data.getNumbersItercalatedByRelation().splice(0, size)

    log(chalk`{whiteBright.inverse # Suggestions:}`)
    log(chalk` - numbers     : {greenBright %j}`, suggestedNumbers)
    log(chalk` - occurrencies: {yellowBright %j}`, this.data.getOcurrencyCount(suggestedNumbers).values())
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

      const ocurrencies = this.data.getOcurrencyCount(numbers)

      if (this.validateCombination(numbers, ocurrencies)) {
        log(chalk`* COM {magentaBright %s}, numbers: {greenBright %j}, ocurrency: {yellowBright %j}`,
          i,
          numbers,
          ocurrencies.values()
        )
        counter.increment()
      } else if (i % 10000 === 0) {
        log(chalk`{yellowBright working...}`, i)
      }
    })
  }

  validateCombination(numbers, ocurrencies) {
    return this.validator.validate(this.name, numbers, ocurrencies)
  }
}

module.exports = { LotteryDowser }
