const chalk = require('chalk')
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
    this.suggestNumbers(options)
    this.generateCombinations(options)
  }

  executeStatistics({ verbose, showNumbers, showRows }) {

    const rowStatistics = this.data.getRowStatistics()
    const numberStatistics = this.data.getNumberStatistics()
    const rowOccurrencyStatistics = this.data.getRowOccurrencyStatistics()

    log(chalk`{whiteBright.underline # By Number:}`)
    log(` - stats: %s`, format(numberStatistics.stats()))

    if (verbose || showNumbers) {
      numberStatistics.iterate((number, total) => {
        const relations = this.data.getNumberRelations(number)
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

    log(chalk`{whiteBright.underline # By Row:}`)
    log(` - stats: %s`, format(rowStatistics.stats()))
    log(` - occur: %s`, format(rowOccurrencyStatistics.values()))

    if (verbose || showRows) {
      rowStatistics.iterate((row, total) => {
        log(chalk` * ROW {magentaBright %s}, total: {blueBright %s}, occur: %s`,
          pad(Number(row) + 1, 4),
          pad(total, 4),
          format(this.data.getRowOccurrences().get(row).values())
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
    log(chalk` - numbers: %s, total: {blueBright %s} (freq. hight to low)`,
      format(moreFrequently),
      moreFrequentlyTotal
    )
    log(` - occur  : %s`, format(this.data.countOccurrences(moreFrequently).values()))
    log(chalk` - numbers: %s, total: {blueBright %s} (freq. hight to low)`,
      format(lessFrequently),
      lessFrequentlyTotal
    )
    log(` - occur  : %s`, format(this.data.countOccurrences(lessFrequently).values()))
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
        log(chalk`* COM {magentaBright %s}, numbers: %s, occurrency: %s`,
          i,
          format(numbers),
          format(occurrences.values())
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
    const validOccur = this.validateOccurrences(occurrences,
      [3,5],[4,0],[5,0],[6,0]
    )
    return validOccur && this.validateRowTotal(combination)
  }

  validateLotofacil(combination, occurrences) {
    const validOccur = this.validateOccurrences(occurrences,
      [12,10],[13,0],[14,0],[15,0]
    )
    return validOccur && this.validateRowTotal(combination)
  }

  validateLotomania(combination, occurrences) {
    const validOccur = this.validateOccurrences(occurrences,
      [9,3],[10,0],[11,0],[12,0],[13,0],[14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0]
    )
    return validOccur && this.validateRowTotal(combination)
  }

  validateRowTotal(numbers) {
    const rowStats = this.data.getRowStatistics().stats()
    const rowTotal = this.data.getRowOccurrencyTotal(numbers)
    return rowTotal > rowStats.min && rowTotal < rowStats.max
  }

  validateOccurrences(occurrences, ...rules) {
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
