const { Statistics, StatisticMap } = require('./statistics')
const { intercalate, intersectionCount, arrayCombinations, padStart } = require('./utils')

function getNumberStatistics(all) {
  const stats = new Statistics()
  all.forEach(numbers => {
    numbers.forEach(n => stats.count(n))
  })
  return stats
}

function getRowStatistics(all, numberStatistics) {
  const stats = new Statistics()
  all.forEach((numbers, row) => {
    const total = numbers.reduce((t, n) => t + numberStatistics.get(n), 0)
    stats.set(row, total)
  })
  return stats
}

function getRowOcurrencies(all) {
  const ocurrencies = new StatisticMap()
  all.forEach((numbers, row) => {
    all.forEach(other => {
      ocurrencies.get(row).count(intersectionCount(numbers, other))
    })
  })
  return ocurrencies
}

function getRowOcurrencyStatistics(rowOcurrencies) {
  const ocurrencies = new Statistics()
  rowOcurrencies.iterate((row, statistics) => {
    statistics.iterate((ocurrency, total) => {
      ocurrencies.add(ocurrency, total)
    })
  })
  return ocurrencies
}

function getOcurrencyCount(all, numbers) {
  const stats = new Statistics()
  const keys = numbers.map(Number)
  all.forEach((other) => stats.count(intersectionCount(keys, other)))
  return stats
}

function getNumberRelations(all) {
  const relations = new StatisticMap()
  all.forEach(numbers => {
    numbers.forEach(number => {
      const relation = relations.get(number)
      numbers.filter(n => n !== number).forEach(n => relation.count(n))
    })
  })
  return relations
}

function getNumbersItercalatedByRelation(numberStatistics, numberRelations) {
  function walk(relations, numbers = []) {
    for (let left = 0, right = relations.length - 1; left <= right;) {

      let leftNumber = relations[left++]
      let rightNumber = relations[right--]

      if (!numbers.includes(leftNumber)) {
        numbers.push(leftNumber)
        walk(numberRelations.get(leftNumber).keys(), numbers)
      }
      if (leftNumber !== rightNumber && !numbers.includes(rightNumber)) {
        numbers.push(rightNumber)
        walk(numberRelations.get(rightNumber).keys(), numbers)
      }
    }
    return numbers
  }
  return intercalate(walk(numberStatistics.keys()))
}

function main() {

  const allNumbers = require('./data/megasena')

  const numberStatistics = getNumberStatistics(allNumbers)
  const numberRelations = getNumberRelations(allNumbers)
  const rowOcurrencies = getRowOcurrencies(allNumbers)
  const rowStatistics = getRowStatistics(allNumbers, numberStatistics)
  const rowOcurrencyStatistics = getRowOcurrencyStatistics(rowOcurrencies)
  const numbersByRelation = getNumbersItercalatedByRelation(numberStatistics, numberRelations)

  console.log(`# Statistics by Number: %o`, numberStatistics.stats())

  numberStatistics.iterate((number, total) => {
    const relations = numberRelations.get(number)
    const sortedRelations = relations.keys()
    const relationToString = (n) => `${padStart(n, 2)}(${padStart(numberStatistics.get(n), 3)})`

    console.log(`# Number(%s), total: %s, relations: %s <...> %s`,
      padStart(number, 2),
      padStart(total, 3),
      sortedRelations.splice(0, 3).map(relationToString).join(','),
      sortedRelations.splice(-3).map(relationToString).join(',')
    )
  })

  console.log(`# Statistics by Row:`)
  console.log(` - statistics : %O`, rowStatistics.stats())
  console.log(` - ocurrencies: %O`, rowOcurrencyStatistics.values())

  rowStatistics.iterate((row, total) => {
    console.log(`# Row(%s), total: %s, ocurrencies: %O`,
      padStart(Number(row) + 1, 4),
      padStart(total, 4),
      rowOcurrencies.get(row).values()
    )
  })

  const suggestedNumbers = numbersByRelation.splice(0, 7)

  console.log(`Sugested number: %O, occurrencies: %O`,
    suggestedNumbers,
    getOcurrencyCount(allNumbers, suggestedNumbers).values()
  )

  arrayCombinations(numbersByRelation, 6, (numbers, i) => {
    const ocurrencies = getOcurrencyCount(allNumbers, numbers)
    if (
      // ocurrencies.get(3) < 3 &&
      // ocurrencies.get(4) === 0 &&
      ocurrencies.get(5) === 0 &&
      ocurrencies.get(6) === 0
    ) {
      console.log(`## Combination: %s, numbers: %O, ocurrency: %O`,
        padStart(i, 9),
        numbers,
        ocurrencies.values()
      )
    } else if (i % 10000 === 0) {
      console.log(`## working...`, i)
    }
  })
}

main()
