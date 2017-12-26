
class SortedKeyMap {
  constructor({ factory, sorter }) {
    this._values = {}
    this._factory = factory
    this._sorter = sorter
    this._cachedKeys = null
  }
  keys() {
    if (this._cachedKeys !== null) {
      return Array.from(this._cachedKeys)
    }
    const keys = Object.keys(this._values)
    this._sorter && keys.sort((a, b) => this._sorter(this.get(a), this.get(b)))
    return Array.from(this._cachedKeys = keys)
  }
  values() {
    return this._values
  }
  set(key, value) {
    this.clearCache()
    return this._values[key] = value
  }
  get(key) {
    return this._values[key] || (this._values[key] = this._factory())
  }
  iterate(fn) {
    this.keys().forEach(key => fn(key, this.get(key)))
  }
  clearCache() {
    this._cachedKeys = null
  }
}

class Statistics extends SortedKeyMap {
  constructor() {
    super({
      factory: () => (0),
      sorter: (a, b) => (a - b)
    })
    this._stats = null
  }
  add(key, value) {
    return this.set(key, this.get(key) + value)
  }
  count(key) {
    return this.add(key, 1)
  }
  stats(update) {
    if (update === true || this._stats === null) {
      this._stats = this.compute()
    }
    return this._stats
  }
  compute() {
    const keys = this.keys()
    const size = keys.length
    const stats = {
      size,
      total: 0,
      max: Number.MIN_VALUE,
      min: Number.MAX_VALUE,
      avg: 0,
      p75: this.get(keys[~~(size * (0.75))]),
      p90: this.get(keys[~~(size * (0.90))]),
      p95: this.get(keys[~~(size * (0.95))]),
      p99: this.get(keys[~~(size * (0.99))])
    }
    keys.forEach(key => {
      const value = this.get(key)
      stats.max = Math.max(stats.max, value)
      stats.min = Math.min(stats.min, value)
      stats.avg += value
      stats.total += value
    })
    stats.avg = stats.avg / size
    return stats
  }
  clearCache() {
    super.clearCache()
    this._stats = null
  }
}

class StatisticMap extends SortedKeyMap {
  constructor() {
    super({
      factory: () => new Statistics(),
      sorter: (a, b) => (a.stats().total - b.stats().total)
    })
  }
}

module.exports = {
  Statistics,
  StatisticMap,
  SortedKeyMap
}
