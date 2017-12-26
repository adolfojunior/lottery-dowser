
function countIntersection(a, b) {
  return a.reduce((c, n) => (b.includes(n) ? c + 1 : c), 0)
}

function generateCombinations(array, size, fn) {
  function generate(deep, begin, end, state) {
    let next = true
    for (let n = begin; n <= end; n++) {
      state.result[deep] = array[n]
      if ((deep + 1) < size) {
        next = generate(deep + 1, n + 1, end + 1, state)
      } else {
        next = fn(state.result, state.count++)
      }
      if (next === false) {
        break
      }
    }
    return next
  }
  generate(0, 0, array.length - size, {
    count: 0,
    result: []
  })
}

module.exports = {
  countIntersection,
  generateCombinations
}
