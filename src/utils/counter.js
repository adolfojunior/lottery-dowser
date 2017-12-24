class Counter {
  constructor() {
    this.count = 0
  }
  increment() {
    return this.count++
  }
  get() {
    return this.count
  }
  greaterOrEqual(value) {
    return Number.isFinite(value) && this.count >= value
  }
  lessOrEqual(value) {
    return Number.isFinite(value) && this.count >= value
  }
  greater(value) {
    return Number.isFinite(value) && this.count > value
  }
  less(value) {
    return Number.isFinite(value) && this.count < value
  }
  equal(value) {
    return this.count === value
  }
}

module.exports = {
  Counter
}
