
function intercalate(array) {
  const a = []
  const m = ~~(array.length / 2)
  for (let i = 0; i < m; i++) {
    a.push(array[i])
    a.push(array[m + i])
  }
  if (array.length % 2 === 1) {
    a.push(array[array.length - 1])
  }
  return a
}

function intersectionCount(a, b) {
  return a.reduce((c, n) => (b.includes(n) ? c + 1 : c), 0)
}

function arrayCombinations(array, size, fn) {
  function generate(deep, begin, end, state) {
    for (let n = begin; n <= end; n++) {
      state.result[deep] = array[n]
      if ((deep + 1) < size) {
        generate(deep + 1, n + 1, end + 1, state)
      } else {
        fn(state.result, state.count++)
      }
    }
  }
  generate(0, 0, array.length - size, {
    count: 0,
    result: []
  })
}

function padStart(value, s) {
  return String(value).padStart(s)
}

module.exports = {
  intercalate,
  intersectionCount,
  arrayCombinations,
  padStart
}
