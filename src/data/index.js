const { sortNumbers } = require('../utils/array')

function dataset(name, sort) {
  const dataset = require(`./${name}`)
  if (sort !== false) {
    for (let i = 0; i < dataset.length; i++) {
      dataset[i] = sortNumbers(dataset[i])
    }
  }
  return dataset
}

module.exports = {
  dataset
}
