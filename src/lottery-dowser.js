const chalk = require('chalk')
const moment = require('moment')
const { log } = require('./log')
const { pad } = require('./utils/string')
const { Counter } = require('./utils/counter')

function format(obj) {
  function obj2str(obj) {
    return Object
      .entries(obj)
      .map(([ key, val ]) => chalk`{whiteBright ${key}}: {redBright ${val}}`)
      .join(`, `)
  }
  function array2str(obj) {
    return obj.map((val) => chalk`{greenBright ${val}}`).join(`, `)
  }
  if (obj instanceof Array) {
    return `[ ${array2str(obj)} ]`
  } else if (obj instanceof Object) {
    return `{ ${obj2str(obj)} }`
  }
  return obj
}

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
    this.checkNumbers(options)
    this.suggestNumbers(options)
    this.generateCombinations(options)
  }

  executeStatistics({ verbose, showNumbers, showRows }) {

    const rowStatistics = this.data.rowStatistics()
    const numberStatistics = this.data.numberStatistics()
    const rowOccurrencyStatistics = this.data.rowOccurrencyStatistics()

    log(chalk`{whiteBright.underline # By Number:}`)
    if (verbose || showNumbers) {
      numberStatistics.sortedForEach((total, number) => {
        const relations = this.data.numberRelations(number)
        const relationKeys = relations.keys()
        const relationToString = (number) => {
          const relationOccur = relations.get(number)
          const numberOccur = numberStatistics.get(number)
          return chalk`{whiteBright ${pad(number, 2)}} ({greenBright ${relationOccur}, ${numberOccur}})`
        }
        log(chalk` * NUM {magentaBright %s}, total: {blueBright %s}, rel: %s ... %s`,
          pad(number, 2),
          pad(total, 3),
          relationKeys.slice(0, 3).map(relationToString).join(' ,'),
          relationKeys.slice(-3).map(relationToString).join(' ,'),
        )
      })
    }
    log(` - stats: %s`, format(numberStatistics.stats()))

    log(chalk`{whiteBright.underline # By Row:}`)
    if (verbose || showRows) {
      rowStatistics.sortedForEach((total, row) => {
        log(chalk` * ROW {magentaBright %s}, total: {blueBright %s}, occur: %s`,
          pad(Number(row) + 1, 4),
          pad(total, 4),
          format(this.data.rowOccurrences().get(row).object())
        )
      })
    }
    log(` - stats: %s`, format(rowStatistics.stats()))
    log(` - occur: %s`, format(rowOccurrencyStatistics.object()))
  }

  checkNumbers({ numbers }) {
    if (!numbers) {
      return
    }

    log(chalk`{whiteBright.underline # Check numbers}`)

    numbers.split(`|`).forEach(line => {

      const numbers = line.split(`,`).map(Number)

      const total = this.data.rowOccurrencyTotal(numbers)
      const occurrences = this.data.countOccurrences(numbers)
  
      log(chalk`* CHECK total: {blueBright %s}, numbers: %s, occurrency: %s`,
        total,
        format(numbers),
        format(occurrences.object())
      )
    })
  }

  suggestNumbers({ numbers, size }) {

    if (numbers) {
      return
    }

    const moreFrequently = this.data.numbersByRelation(`asc`).slice(0, size)
    const lessFrequently = this.data.numbersByRelation(`desc`).slice(0, size)

    const moreFrequentlyTotal = this.data.rowOccurrencyTotal(moreFrequently)
    const lessFrequentlyTotal = this.data.rowOccurrencyTotal(lessFrequently)

    log(chalk`{whiteBright.underline # Suggestions:}`)
    log(chalk` - numbers: %s, total: {blueBright %s} (freq. hight to low)`,
      format(moreFrequently),
      moreFrequentlyTotal
    )
    log(` - occur  : %s`, format(this.data.countOccurrences(moreFrequently).object()))
    log(chalk` - numbers: %s, total: {blueBright %s} (freq. low to hight)`,
      format(lessFrequently),
      lessFrequentlyTotal
    )
    log(` - occur  : %s`, format(this.data.countOccurrences(lessFrequently).object()))
  }

  generateCombinations({ generate, size, limit, offset = 0, offsetLimit = 0, validateStats = true }) {

    if (!generate) {
      return
    }

    const counter = new Counter()
    const seedNumbers = this.data.numbersByRelation(`asc`)

    log(chalk`{whiteBright.underline # Combinations:} %s`, limit ? `(limit of ${limit})` : `(no limit)` )

    log(` - seed numbers:`, format(seedNumbers))

    const startTime = moment()
    const totalCombinations = this.data.combineNumbers(seedNumbers, size, (numbers, count) => {
      // mote to offset
      if (count < offset) {
        return true
      }
      // offset limit
      if (offsetLimit > 0 && count > offsetLimit) {
        return false
      }
      // stop it
      if (counter.greaterOrEqual(limit)) {
        return false
      }

      const total = this.data.rowOccurrencyTotal(numbers)
      const occurrences = this.data.countOccurrences(numbers)

      if (this.validateCombination({ numbers, total, occurrences }, validateStats)) {
        log(chalk`* COM {magentaBright %s}, total: {blueBright %s}, numbers: %s, occurrency: %s`,
          count,
          total,
          format(numbers),
          format(occurrences.object())
        )
        counter.increment()
      } else if (count % 10000 === 0) {
        log(chalk`{yellowBright working...} [%s] %s`, moment().format(`HH:mm:ss`), count)
      }
    })
    log(`Generated %s in %s`, totalCombinations, moment().diff(startTime) / 1000)
  }

  validateCombination(combination, validateStats) {
    const validator = this.validators[this.name]
    if (validator && !validator(combination)) {
      return false
    }
    if (validateStats) {
      return this.validateTotal(combination)
    }
    return true
  }

  validateMegasena(combination) {
    const rules = [ [3,5], [4,0],[5,0],[6,0] ]
    return this.validateOccurrences(combination, rules)
  }

  validateLotofacil(combination) {
    const rules = [ [12,15],[13,0],[14,0],[15,0] ]
    return this.validateOccurrences(combination, rules)
  }

  validateLotomania(combination) {
    const rules = [ [17,1], [18,0],[19,0],[20,0] ]
    return this.validateOccurrences(combination, rules)
  }

  validateTotal({ numbers, total }) {
    const size = this.data.rowSize()
    const stats = this.data.rowStatistics().stats()
    const exceed = numbers.length - size
    const min = stats.min + (exceed * (stats.min / size))
    const max = stats.max + (exceed * (stats.max / size))
    return total >= min && total <= max
  }

  validateOccurrences({ occurrences }, rules) {
    for (let i = 0; i < rules.length; i++) {
      const [entry, value] = rules[i]
      const occur = occurrences.get(entry)
      if (occur > value) {
        return false
      }
    }
    return true
  }
}

module.exports = { LotteryDowser }
