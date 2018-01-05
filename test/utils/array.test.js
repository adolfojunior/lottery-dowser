// tests/part1/cart-summary-test.js
const chai = require('chai')
const { expect } = require('chai')

const {
  countSortedIntersection,
  generateCombinations
} = require('../../src/utils/array')

const ARRAY_A = [1, 2, 3, 4, 5]
const ARRAY_B = [2, 3, 4, 5, 6, 7]
const ARRAY_C = [8, 9, 10, 11]
const ARRAY_D = [1, 2, 3]

describe('utils/array countSortedIntersection', function() {
  it('A and B should be 4', function() {
    expect(countSortedIntersection(ARRAY_A, ARRAY_B)).to.be.equal(4)
  })
  it('B and A should be 4', function() {
    expect(countSortedIntersection(ARRAY_B, ARRAY_A)).to.be.equal(4)
  })
  it('A and C should be 0', function() {
    expect(countSortedIntersection(ARRAY_B, ARRAY_C)).to.be.equal(0)
  })
  it('A and EmptyArray should be 0', function() {
    expect(countSortedIntersection(ARRAY_A, [])).to.be.equal(0)
  })
  it('EmptyArray and B should be 0', function() {
    expect(countSortedIntersection([], ARRAY_B)).to.be.equal(0)
  })
  it('EmptyArray and EmptyArray should be 0', function() {
    expect(countSortedIntersection([], [])).to.be.equal(0)
  })
})
