const yargs = require('yargs')
const { log } = require('./log')
const { dataset } = require('./data')
const { LotteryData } = require('./lottery/data')
const { LotteryDowser } = require('./lottery/dowser')

function execute(name, options) {
  const data = new LotteryData(dataset(name))
  const dowser = new LotteryDowser(name, data)
  dowser.run(options)
}

function main(argv) {
  const [ name ] = argv._
  if (name) {
    execute(name, argv)
  } else {
    log(`no command selected`)
  }
}

yargs
  .option(`generate`, {
    alias: `g`,
    describe: `Generate combinations after the statistics`,
    type: `boolean`
  })
  .option(`showNumbers`, {
    alias: `n`,
    describe: `Show detailed information about each number`,
    type: `boolean`
  })
  .option(`showRows`, {
    alias: `r`,
    describe: `Show detailed information about each row`,
    type: `boolean`
  })
  .option(`debug`, {
    describe: `Show debug information`,
    type: `boolean`,
    default: false
  })
  .option(`verbose`, {
    alias: `v`,
    describe: `Show detailed information about statistics`,
    type: `boolean`
  })
  .option(`size`, {
    describe: `Quantity of numbers at each combination`,
    type: `number`
  })
  .option(`offset`, {
    describe: `Combination offset`,
    type: `number`
  })
  .option(`offsetLimit`, {
    describe: `Combination limit to offset`,
    type: `number`
  })
  .option(`validateStats`, {
    describe: `Validate the combination using the row statistics`,
    type: `boolean`,
    default: true
  })
  .option(`limit`, {
    describe: `Limit the combinations that should be generated`,
    type: `number`
  })
  .option(`numbers`, {
    describe: `Numbers to be comparated aginst the current statistics`,
    type: `string`
  })
  .command({
    command: `megasena`,
    describe: `Generate MEGASENA statistics`,
    builder: (yargs) => yargs.default({ size: 6 }),
    handler: main
  })
  .command({
    command: `lotomania`,
    describe: `Generate LOTOMANIA statistics`,
    builder: (yargs) => yargs.default({ size: 20 }),
    handler: main
  })
  .command({
    command: `lotofacil`,
    describe: `Generate LOTOFACIL statistics`,
    builder: (yargs) => yargs.default({ size: 15 }),
    handler: main
  })
  .demandCommand(1, `You need at least one command`)
  .help()
  .argv
