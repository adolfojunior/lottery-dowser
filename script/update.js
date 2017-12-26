const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const yargs = require('yargs')

function readFile(name) {
  const file = path.resolve(__dirname, name)
  return fs.readFileSync(file, `utf8`)
}

function writeFile(name, content) {
  const file = path.resolve(process.cwd(), `src`, `data`, name)
  fs.writeFileSync(file, content);
}

function saveToJs(name, lines) {
  const text = lines
    .map(line => line.join(`,`))
    .map(s => `[${s}]`)
    .join(`,\n`)
  writeFile(name, `module.exports = [${text}\n]`)
}

function getLines($, startColumn, endColumn) {
  const lines = []
  $(`tr`).each((lineNum, lineElem) => {
    // skip header
    if (lineNum > 0) {
      const columns = $(lineElem)
        .find(`td`)
        .slice(startColumn, endColumn)
        .map((colNum, colElem) => parseInt($(colElem).text()))
        .get()
      
      if (columns.length === (endColumn - startColumn)) {
        lines.push(columns)
      }
    }
  })
  return lines
}

function parseAndSave(src, dest, startColumn, endColumn) {
  const content = readFile(src)
  const html = cheerio.load(content)
  const lines = getLines(html, startColumn, endColumn)
  saveToJs(dest, lines)
  console.log(`done!`)
}

require(`yargs`)
  .option(`html`, {
    alias: `h`,
    describe: `html file`,
    type: `string`
  })
  .command({
    command: `megasena`,
    describe: `Parse MEGASENA html`,
    builder: (yargs) => yargs.default(`html`, `D_MEGA.HTM`),
    handler: ({ html }) => parseAndSave(html, `megasena.js`, 2, 8)
  })
  .command({
    command: `lotomania`,
    describe: `Parse LOTOMANIA html`,
    builder: (yargs) => yargs.default(`html`, `D_LOTMAN.HTM`),
    handler: ({ html }) => parseAndSave(html, `lotomania.js`, 2, 22),
  })
  .command({
    command: `lotofacil`,
    describe: `Parse LOTOFACIL html`,
    builder: (yargs) => yargs.default(`html`, `D_LOTFAC.HTM`),
    handler: ({ html }) => parseAndSave(html, `lotofacil.js`, 2, 17)
  })
  .demandCommand(1, `You need at least one command`)
  .help()
  .argv

