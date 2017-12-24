
function pad(value, s) {
  return String(value).padStart(s)
}

function padEnd(value, s) {
  return String(value).padEnd(s)
}

module.exports = {
  pad,
  padEnd
}
