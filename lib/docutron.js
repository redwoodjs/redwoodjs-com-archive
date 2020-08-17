require('dotenv').config()

const fs = require('fs')
const path = require('path')
const template = require('lodash.template')
const { paramCase } = require('param-case')
const { titleCase } = require('title-case')
const highlightLines = require('markdown-it-highlight-lines')
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default
const markdownItCollapsible = require('markdown-it-collapsible')
const hljs = require('highlight.js')
const md = require('markdown-it')({
  html: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (__) {}
    }

    return '' // use external default escaping
  },
})
md.use(highlightLines)
md.use(markdownItTocAndAnchor, {
  toc: false,
  anchorLink: true,
})
md.use(markdownItCollapsible)

const HTML_ROOT = path.join('code', 'html')
const TEMPLATE_ROOT = path.join('lib', 'templates')

const PAGE_TEMPLATE_PATH = path.join(TEMPLATE_ROOT, 'page.html.template')
const NAV_ITEM_TEMPLATE_PATH = path.join(TEMPLATE_ROOT, 'nav_item.html.template')
const TEMPLATES = {
  page: template(fs.readFileSync(PAGE_TEMPLATE_PATH).toString()),
  navItem: template(fs.readFileSync(NAV_ITEM_TEMPLATE_PATH).toString()),
}

// Converts an array of pages in markdown to HTML
const convertToHtml = (pages, book, version) => {
  return pages.map((page, index) => {
    const content = md.render(page.text)
    const output = TEMPLATES.page({
      content,
      // Remove any top-level headers (i.e. #) b/c they're redundant
      links: subNav(page.text).filter((header) => header.level > 1),
      nextPage: pages[index + 1],
      pageTitle: `${titleCase(book)} - ${page.title}`,
      version: version,
    })

    return Object.assign(page, { html: output })
  })
}

// splits a markdown document by h1 and h2 into "pages"
const splitToPages = (markdown, book, options = {}) => {
  const sections = []
  let buffer = []

  const shouldPageBreak = (line) => {
    const matches = line.match(/^(#+) /m)

    if (matches && options.pageBreakAtHeadingDepth.indexOf(matches[1].length) !== -1) {
      return true
    } else {
      return false
    }
  }

  markdown.split('\n').forEach((line, index) => {
    if (options.skipLines && index < options.skipLines) {
      return
    }

    if (shouldPageBreak(line) && buffer.length) {
      sections.push(buffer.join('\n'))
      buffer = []
    }
    buffer.push(line)
  })
  sections.push(buffer.join('\n'))

  const groups = sections.map((section, index) => {
    let title = section.match(/^#+ (.*)$/m)[1]

    if (index === 0 && options.title) {
      title = options.title
    }

    return { href: `/${book}/${paramCase(title)}.html`, title, text: section }
  })

  return groups
}

// give an array of pages, builds a nav link for each
const buildNav = (pages, book, index) => {
  return pages.map((page) => {
    const vars = Object.assign(page, { book, first: index === 0 })

    return TEMPLATES.navItem(vars)
  })
}

// creates the "on this page" nav links
const subNav = (markdown) => {
  return markdown.match(/^#{1,3} (.*?)$/gm).map((header) => {
    const headerLevelIndex = header.indexOf(' ')
    const title = header
      .substring(headerLevelIndex + 1)
      .replace(/`/g, '')
      .replace('<', '&lt;')
      .replace('>', '&gt;')

    return {
      href: `#${paramCase(title.toLowerCase().replace(/&.*?;/g, ''))}`,
      level: headerLevelIndex,
      title: title,
      // To indent headers according to the number of # they have.
      // But since we remove #, which equal 1, we want to consider ## as 1 and indent from there.
      ml: (headerLevelIndex - 2) * 0.75,
    }
  })
}

const create = (markdown, book, options = {}) => {
  console.info('create book', book)
  const markdownPages = splitToPages(markdown, book, options)
  const htmlPages = convertToHtml(markdownPages, book, options.version)
  // buildNav(markdownPages, book)

  htmlPages.forEach((page) => {
    fs.writeFileSync(path.join(HTML_ROOT, page.href), page.html)
    console.info(`+ Wrote ${book}:${page.title}`)
  })

  return markdownPages
}

module.exports = { create, buildNav }
