const chalk = require('chalk')
const { log, padStart } = require('./utils')

class LotteryDowser {
  constructor(data) {
    this.data = data
  }

  run(options) {
    this.executeStatistics(options)
    this.suggestNumbers(options)
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

  suggestNumbers({ generate, size, limit }) {
  
    const numbersByRelation = this.data.getNumbersItercalatedByRelation()
    const suggestedNumbers = numbersByRelation.splice(0, size)
  
    log(chalk`{whiteBright # Suggestions:}`)
    log(chalk` - numbers     : {cyanBright %j}`, suggestedNumbers)
    log(chalk` - occurrencies: {magentaBright %j}`, this.data.getOcurrencyCount(suggestedNumbers).values())
  
    if (generate === true) {
      log(chalk`{whiteBright # Combinations:} limit(%s)`, limit)
  
      let generated = 0

      this.data.combineNumbers(numbersByRelation, size, (numbers, count) => {  
        // stop it
        if (limit && generated >= limit) {
          return false
        }

        const ocurrencies = this.data.getOcurrencyCount(numbers)
        if (
          ocurrencies.get(3) <= 3 &&
          ocurrencies.get(4) === 0 &&
          ocurrencies.get(5) === 0 &&
          ocurrencies.get(6) === 0
        ) {
          generated++
          log(chalk`* Combination: %s, numbers: %j, ocurrency: %j`,
            padStart(count, 9),
            numbers,
            ocurrencies.values()
          )
        } else if (count % 10000 === 0) {
          log(` - working...`, count)
        }
      })
    }
  }
}

module.exports = { LotteryDowser }
