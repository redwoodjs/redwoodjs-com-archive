const fs = require('fs')
const path = require('path')

const { create: createDocs } = require('./docutron.js')

const HTML_ROOT = path.join('code', 'html')

const run = () => {
  console.info(`\nROADMAP...`)

  const markdown = fs.readFileSync('./ROADMAP.md').toString()
  const [page] = createDocs(
    markdown, 
    '', 
    { pageBreakAtHeadingDepth: [1], file: './ROADMAP.md' }
  )
  fs.writeFileSync(path.join(HTML_ROOT, page.href), page.html)
}

module.exports = { run }