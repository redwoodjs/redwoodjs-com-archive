const fs = require('fs')
const path = require('path')

const { create: createDocs } = require('./docutron.js')

const HTML_ROOT = path.join('code', 'html')

const run = () => {
  console.info(`\nROADMAP...`)

  const markdown = fs.readFileSync('./ROADMAP.md').toString()
  const styles = {
    Accessibility: 1,
    Auth: 3,
    Core: 3,
    Deployment: 2,
    Docs: 3,
    Generators: 1,
    Logging: 1,
    Performance: 0,
    Prerender: 1,
    Router: 1,
    Storybook: 3,
    Structure: 3,
    ['Testing (App)']: 3,
    TypeScript: 3,
  }
  const [page] = createDocs(
    markdown, 
    '', 
    { pageBreakAtHeadingDepth: [1], file: './ROADMAP.md', styles }
  )
  fs.writeFileSync(path.join(HTML_ROOT, page.href), page.html)
}

module.exports = { run }