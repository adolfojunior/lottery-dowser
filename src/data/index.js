
function loadData(name) {
  return require(`./${name}`)
}

module.exports = {
  loadData
}
