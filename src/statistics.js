
class SortedKeyMap {
  constructor({ factory, sorter }) {
    this._values = {}
    this._factory = factory
    this._sorter = sorter
    this._cache = null
  }
  sorter() {
    return this._sorter
  }
  keys(sorter = this.sorter()) {
    if (this._cache && this._cache.sorter === sorter) {
      return this._cache.keys
    }
    const keys = Object.keys(this._values)
    keys.sort((a, b) => sorter(this.get(a), this.get(b)))
    this._cache = { sorter, keys }
    return this._cache.keys
  }
  values() {
    return this._values
  }
  set(key, value) {
    this._clear()
    return this._values[key] = value
  }
  get(key) {
    return this._values[key] || (this._values[key] = this._factory())
  }
  iterate(fn, sorter) {
    this.keys(sorter).forEach(key => fn(key, this.get(key)))
  }
  _clear() {
    this._cache = null
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
    if (update || this._stats === null) {
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
