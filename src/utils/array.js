
function sortNumbers(array) {
  return array.sort((a, b) => a - b)
}

function countSortedIntersection(a, b) {
  let count = 0, i = 0, j = 0
  let si = a.length, sj = b.length
  while (i < si && j < sj) {
    if (a[i] < b[j]) {
      i += 1
    } else if (b[j] < a[i]) {
      j += 1
    } else {
      i += 1; j += 1; count += 1
    }
  }
  return count
}

function countIntersection(a, b) {
  let count = 0
  for (let i = 0; i < a.length; i++) {
    if (b.includes(a[i])) {
      count++
    }
  }
  return count
}

class ArrayCombination {
  constructor(array) {
    this.array = array
  }
  generate(size, fn) {
    this.count = 0
    this.current = []
    this.run(0, 0, this.array.length - size, size, fn)
    return this.count
  }
  run(deep, begin, end, size, fn) {
    let next = true
    for (let n = begin; n <= end; n++) {
      this.current[deep] = this.array[n]
      if ((deep + 1) < size) {
        next = this.run(deep + 1, n + 1, end + 1, size, fn)
      } else {
        next = fn([].concat(this.current), this.count++)
      }
      if (next === false) {
        break
      }
    }
    return next
  }
}

function generateCombinations(array, size, fn) {
  return new ArrayCombination(array).generate(size, fn)
}

module.exports = {
  sortNumbers,
  countIntersection,
  countSortedIntersection,
  generateCombinations
}
