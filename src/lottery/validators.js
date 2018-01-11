
class CustomOccurrencyRules {
  constructor(rules) {
    this.rules = rules.split(`,`).map(rule => this.create(rule))
  }
  create(rule) {
    const values = /(\d+)\s*([=><])\s*(\d+)/.exec(rule.trim())
    if (values) {
      const [_, key, type, value] = values
      if (type === `>`) {
        return ({ occurrences }) => (occurrences.get(key) > value)
      } else if (type === `<`) {
        return ({ occurrences }) => (occurrences.get(key) < value)
      } else if (type === `=`) {
        return ({ occurrences }) => (occurrences.get(key) === value)
      }
    }
    throw new Error(`Invalid rule: ${rule}`)
  }
  validate(combination) {
    for (let i = 0; i < this.rules.length; i++) {
      if (!this.rules[i].validate(combination)) {
        return false
      }
    }
    return true
  }
}

class ZeroOcurrencesValidator {
  constructor(name, data) {
    this.name = name
    this.data = data
    this.keys = []
    if (name === `megasena`) {
      this.keys = [5, 6]
    } else if (name === `lotofacil`) {
      this.keys = [14, 15, 16]
    } else if (name === `lotomania`) {
      this.keys = [18, 19, 20]
    } else {
      throw new Error(`Unsupported type ${name}`)
    }
  }
  validate({ occurrences }) {
    
    const { keys }  = this
    
    for (let i = 0; i < keys.length; i++) {
      const occurrency = keys[i]
      const rowOccurrency = occurrences.get(occurrency)
      if (rowOccurrency !== 0) {
        return false
      }
    }
    return true
  }
}

class BeforeMatchValidator {
  constructor(name, data) {
    this.name = name
    this.data = data
    this.keys = []
    this.field = `p95`
    if (name === `megasena`) {
      this.keys = [3, 4]
    } else if (name === `lotofacil`) {
      this.keys = [10, 11, 12, 13]
    } else if (name === `lotomania`) {
      this.keys = [10, 11, 12, 13, 14, 15, 16, 17]
    } else {
      throw new Error(`Unsupported type ${name}`)
    }
  }
  validate({ occurrences }) {
    
    const { field, keys }  = this
    const rowOccurrences = this.data.rowOccurrencesBeforeMatch()
    
    for (let i = 0; i < keys.length; i++) {
      const occurrency = keys[i]
      const rowOccurrency = occurrences.get(occurrency)
      const stats = rowOccurrences.get(occurrency).stats()
      const value = stats[field]
      // log(`%j = %j > %j ?`, occurrency, rowOccurrency, value)
      if (rowOccurrency < value) {
        return false
      }
    }
    return true
  }
}

class TotalValidator {
  constructor(name, data) {
    this.name = name
    this.data = data
  }
  validate({ numbers, total }) {
    const size = this.data.rowSize()
    const stats = this.data.rowStatistics().stats()
    const exceed = numbers.length - size
    const avg = stats.avg + (exceed * (stats.avg / size))
    const max = stats.max + (exceed * (stats.max / size))
    return total >= avg && total <= max
  }
}

module.exports = {
  TotalValidator,
  BeforeMatchValidator,
  CustomOccurrencyRules,
  ZeroOcurrencesValidator
}
