const chalk = require('chalk')
const { log, padStart } = require('./utils')

class LotteryDowser {
  constructor(name, data) {
    this.name = name
    this.data = data
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

    log(chalk`{whiteBright # By Number:}`)
    log(chalk` - statistics: {cyanBright %j}`, numberStatistics.stats())

    if (verbose === true) {
      numberStatistics.iterate((number, total) => {
        const relations = this.data.getNumberRelations().get(number)
        const sortedRelations = relations.keys()
        const relationToString = (n) => `${padStart(n, 2)}(${padStart(numberStatistics.get(n), 3)})`

        log(` * Number(%s), total: %s, relations: %s <...> %s`,
          padStart(number, 2),
          padStart(total, 3),
          sortedRelations.splice(0, 3).map(relationToString).join(','),
          sortedRelations.splice(-3).map(relationToString).join(',')
        )
      })
    }

    log(chalk`{whiteBright # By Row:}`)
    log(chalk` - statistics : {yellow %j}`, rowStatistics.stats())
    log(chalk` - ocurrencies: {yellow %j}`, rowOcurrencyStatistics.values())

    if (verbose === true) {
      rowStatistics.iterate((row, total) => {
        log(chalk` * Row(%s), total: {blueBright %s}, ocurrencies: {greenBright %j}`,
          padStart(Number(row) + 1, 4),
          padStart(total, 4),
          this.data.getRowOcurrencies().get(row).values()
        )
      })
    }
  }

  suggestNumbers({ size }) {

    const suggestedNumbers = this.data.getNumbersItercalatedByRelation().splice(0, size)

    log(chalk`{whiteBright # Suggestions:}`)
    log(chalk` - numbers     : {cyanBright %j}`, suggestedNumbers)
    log(chalk` - occurrencies: {magentaBright %j}`, this.data.getOcurrencyCount(suggestedNumbers).values())
  }

  generateCombinations({ generate, size, limit }) {

    if (!generate) {
      return
    }

    const numbersToCombine = this.data.getNumbersItercalatedByRelation()
    const generationState = { count: 0 }

    log(chalk`{whiteBright # Combinations:} limit(%s)`, limit)

    this.data.combineNumbers(numbersToCombine, size, (numbers, count) => {
      // stop it
      if (limit && generationState.count >= limit) {
        return false
      }

      const ocurrencies = this.data.getOcurrencyCount(numbers)

      if (this.validateCombination(numbers, ocurrencies)) {
        log(chalk`* Combination: {whiteBright %s}, numbers: {yellowBright %j}, ocurrency: {blueBright %j}`,
          count,
          numbers,
          ocurrencies.values()
        )
        generationState.count += 1
      } else if (count % 10000 === 0) {
        log(` - working...`, count)
      }
    })
  }

  validateCombination(numbers, ocurrencies) {
    if (this.name === `megasena`) {
      return ocurrencies.get(3) <= 3 &&
          ocurrencies.get(4) === 0 &&
          ocurrencies.get(5) === 0 &&
          ocurrencies.get(6) === 0
    }
    // TODO add other validators
    return true
  }
}

module.exports = { LotteryDowser }
