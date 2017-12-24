const packageJson = require('../package.json')

const chalk = require('chalk')
const yargs = require('yargs')

const { padStart } = require('./utils')
const { LotteryDowser } = require('./lottery-dowser')

const log = console.log

function executeStatistics({ verbose }, lottery) {

  const rowStatistics = lottery.getRowStatistics()
  const numberStatistics = lottery.getNumberStatistics()
  const rowOcurrencyStatistics = lottery.getRowOcurrencyStatistics()

  log(chalk`{whiteBright # By Number:}`)
  log(chalk` - statistics: {cyanBright %j}`, numberStatistics.stats())

  if (verbose === true) {
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

  if (verbose === true) {
    rowStatistics.iterate((row, total) => {
      log(chalk` * Row(%s), total: {blueBright %s}, ocurrencies: {greenBright %j}`,
        padStart(Number(row) + 1, 4),
        padStart(total, 4),
        lottery.getRowOcurrencies().get(row).values()
      )
    })
  }
}

function suggestNumbers({ generate, size }, lottery) {

  const numbersByRelation = lottery.getNumbersItercalatedByRelation()
  const suggestedNumbers = numbersByRelation.splice(0, size)

  log(chalk`{whiteBright # Suggestions:}`)
  log(chalk` - numbers     : {cyanBright %j}`, suggestedNumbers)
  log(chalk` - occurrencies: {magentaBright %j}`, lottery.getOcurrencyCount(suggestedNumbers).values())

  if (generate === true) {
    log(chalk`{whiteBright # Combinations:}`)

    lottery.combineNumbers(numbersByRelation, size, (numbers, i) => {
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

function lottery(argv, name) {
  const lottery = new LotteryDowser(require(`./data/${name}`))
  executeStatistics(argv, lottery)
  suggestNumbers(argv, lottery)
}

require(`yargs`)
  .option(`generate`, {
    alias: `g`,
    describe: `Generate combinations after the statistics`,
    type: `boolean`
  })
  .option(`verbose`, {
    alias: `v`,
    describe: `Show detailed information about statistics`,
    type: `boolean`
  })
  .option(`size`, {
    alias: `s`,
    describe: `Quantity of numbers that should be generated`,
    type: `number`
  })
  .command({
    command: `megasena`,
    describe: `Generate MEGASENA statistics`,
    handler: (argv) => lottery(argv, `megasena`),
    builder: (yargs) => yargs.default({ size: 6 }),
  })
  .command({
    command: `lotomania`,
    describe: `Generate LOTOMANIA statistics`,
    handler: (argv) => lottery(argv, `lotomania`),
    builder: (yargs) => yargs.default({ size: 20 }),
  })
  .command({
    command: `lotofacil`,
    describe: `Generate LOTOFACIL statistics`,
    handler: (argv) => lottery(argv, `lotofacil`),
    builder: (yargs) => yargs.default({ size: 15 }),
  })
  .demandCommand(1, `You need at least one command`)
  .help()
  .argv
