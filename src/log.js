const chalk = require(`chalk`)

const log = console.log

function formatObject(obj) {
  return Object
    .entries(obj)
    .map(([ key, val ]) => chalk`{whiteBright ${key}}: {redBright ${val}}`)
    .join(`, `)
}
function formatArray(obj) {
  return obj.map((val) => chalk`{greenBright ${val}}`).join(`, `)
}
function format(obj) {
  if (obj instanceof Array) {
    return `[ ${formatArray(obj)} ]`
  } else if (obj instanceof Object) {
    return `{ ${formatObject(obj)} }`
  }
  return obj
}

module.exports = {
  log,
  format
}
