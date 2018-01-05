// tests/part1/cart-summary-test.js
const chai = require('chai')
const { expect } = require('chai')

const {
  Statistics,
  StatisticsArray
} = require('../src/statistics')

describe('statistics', function() {
  it('must initialize with 0', function() {

    const statistics = new Statistics()
    const one = statistics.get(1)

    expect(one).to.be.equal(0)
  })
  it('stats must count', function() {

    const statistics = new Statistics()
    
    let start = 1, end = 10, count = 0
    for (let i = start; i <= end; i++, count++) {
      statistics.count(i)
    }

    expect(statistics.stats()).to.be.deep.equal({
      size: count,
      total: count,
      max: 1,
      min: 1,
      avg: 1,
      p75: 1,
      p90: 1,
      p95: 1
    })
  })
  it('stats must comput statistics', function() {

    const statistics = new Statistics()
    
    let start = 1, end = 10, count = 0, sum = 0
    for (let i = start; i <= end; i++) {
      statistics.set(i, i)
      count += 1
      sum += i
    }

    expect(statistics.stats()).to.be.deep.equal({
      size: count,
      total: sum,
      max: end,
      min: start,
      avg: sum / count,
      p75: statistics.keys()[~~(count * (0.75))],
      p90: statistics.keys()[~~(count * (0.90))],
      p95: statistics.keys()[~~(count * (0.95))]
    })
  })
  it('stats must be cached', function() {

    const statistics = new Statistics()
    
    let start = 1, end = 10, count = 0, sum = 0
    for (let i = start; i <= end; i++) {
      statistics.set(i, i)
    }

    expect(statistics.stats()).to.be.equal(statistics.stats())
  })

  it('clear must reset stats', function() {

    const statistics = new Statistics()
    
    let start = 1, end = 10, count = 0, sum = 0
    for (let i = start; i <= end; i++) {
      statistics.set(i, i)
    }

    const firstStats = statistics.stats()
    statistics.clear()

    expect(firstStats).to.not.be.equal(statistics.stats())
  })
})
