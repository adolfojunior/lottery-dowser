
class LazyArray {
  constructor({ initValue, sorter }) {
    this._array = []
    this._initValue = initValue
    this._sorter = sorter || ((a, b) => a - b)
    this._obj = null
    this._keys = null
  }
  keys() {
    if (this._keys === null) {
      this._keys = []
      this.forEach((value, key) => {
        this._keys.push(key)
      })
      this._keys.sort((a, b) => this._sorter(this.get(a), this.get(b)))
    }
    return this._keys
  }
  object(fn) {
    if (this._obj === null) {
      this._obj = {}
      this.forEach((value, key) => {
        this._obj[key] = value
      })
    }
    return this._obj
  }
  sortedForEach(fn) {
    this.keys().forEach((key) => fn(this.get(key), key, this._array))
  }
  forEach(fn) {
    this._array.forEach(fn)
  }
  set(key, value) {
    this.clear()
    return this._array[key] = value
  }
  get(key) {
    return this._array[key] || (this._array[key] = this._initValue(key))
  }
  clear() {
    this._obj = null
    this._keys = null
  }
}

class Statistics extends LazyArray {
  constructor(sorter) {
    super({
      initValue: () => 0,
      sorter
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
      p95: this.get(keys[~~(size * (0.95))])
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
  clear() {
    super.clear()
    this._stats = null
  }
}

class StatisticsArray extends LazyArray {
  constructor(sorter) {
    super({
      initValue: () => new Statistics(sorter),
      sorter: (a, b) => a.stats().total - b.stats().total
    })
  }
}

module.exports = {
  Statistics,
  StatisticsArray
}
