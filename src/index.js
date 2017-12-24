const yargs = require('yargs')
const { log } = require('./utils')
const { LotteryData } = require('./lottery-data')
const { LotteryDowser } = require('./lottery-dowser')

function execute(name, options) {
  const data = new LotteryData(require(`./data/${name}`))
  const dowser = new LotteryDowser(data)
  dowser.run(options)
}

function main(argv) {
  const name = argv._[0]
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
  .option(`verbose`, {
    alias: `v`,
    describe: `Show detailed information about statistics`,
    type: `boolean`
  })
  .option(`size`, {
    describe: `Quantity of numbers at each combination`,
    type: `number`
  })
  .option(`limit`, {
    describe: `Limit the combinations that should be generated`,
    type: `number`
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
