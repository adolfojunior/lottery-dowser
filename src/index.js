const packageJson = require('../package.json')

const chalk = require('chalk')
const program = require('commander')

const { padStart } = require('./utils')
const { LotteryDowser } = require('./lottery-dowser')

const log = console.log

function executeStatistics(program, lottery) {

  const rowStatistics = lottery.getRowStatistics()
  const numberStatistics = lottery.getNumberStatistics()
  const rowOcurrencyStatistics = lottery.getRowOcurrencyStatistics()

  log(chalk`{whiteBright # By Number:}`)
  log(chalk` - statistics: {cyanBright %j}`, numberStatistics.stats())

  if (program.verbose === true) {
    numberStatistics.iterate((number, total) => {
      const relations = lottery.getNumberRelations().get(number)
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

  if (program.verbose === true) {
    rowStatistics.iterate((row, total) => {
      log(chalk` * Row(%s), total: {blueBright %s}, ocurrencies: {greenBright %j}`,
        padStart(Number(row) + 1, 4),
        padStart(total, 4),
        lottery.getRowOcurrencies().get(row).values()
      )
    })
  }
}

function suggestNumbers(program, lottery) {

  const numbersByRelation = lottery.getNumbersItercalatedByRelation()
  const suggestedNumbers = numbersByRelation.splice(0, 7)

  log(chalk`{whiteBright # Suggestions:}`)
  log(chalk` - numbers     : {cyanBright %j}`, suggestedNumbers)
  log(chalk` - occurrencies: {magentaBright %j}`, lottery.getOcurrencyCount(suggestedNumbers).values())

  if (program.generate === true) {
    log(chalk`{whiteBright # Combinations:}`)

    lottery.combineNumbers(numbersByRelation, 6, (numbers, i) => {
      const ocurrencies = lottery.getOcurrencyCount(numbers)
      if (
        ocurrencies.get(3) <= 3 &&
        ocurrencies.get(4) === 0 &&
        ocurrencies.get(5) === 0 &&
        ocurrencies.get(6) === 0
      ) {
        log(chalk`* Combination: %s, numbers: %j, ocurrency: %j`,
          padStart(i, 9),
          numbers,
          ocurrencies.values()
        )
      } else if (i % 10000 === 0) {
        log(` - working...`, i)
      }
    })
  }
}

function main(program) {

  const lottery = new LotteryDowser(require('./data/megasena'))

  executeStatistics(program, lottery)
  suggestNumbers(program, lottery)
}

main(
  program
    .version(packageJson.version)
    .option('-g, --generate', 'Generate Combinations')
    .option('-v, --verbose', 'Verbose at showing information')
    .parse(process.argv)
)
