const fs = require('fs')
const path = require('path')
const marked = require('marked')
marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
})
const template = require('lodash.template')

const HTML_ROOT = path.join('code', 'html')
const TEMPLATE_ROOT = path.join('lib', 'templates')
const OUTPUT_PATH = path.join(HTML_ROOT, '_testimonials.html')
const TESTIMONIALS_MARKDOWN = fs.readFileSync('TESTIMONIALS.md').toString()

const testimonialTemplate = template(fs.readFileSync(path.join(TEMPLATE_ROOT, 'testimonial.html.template')).toString())

const parseTestimonial = (markdown) => {
  const tokens = marked.lexer(markdown)
  let substitutions = { body: '' }

  tokens.forEach((token) => {
    switch (token.type) {
      case 'heading':
        substitutions = Object.assign(substitutions, parseHeading(token))
        return
      default:
        if (token.text) {
          substitutions.body += token.text
        } else {
          substitutions.body += '\n\n'
        }
        return
    }
  })

  substitutions.body = marked(substitutions.body)
  substitutions.body = substitutions.body.replace(/\<p\>/g, '<p class="mt-4">')

  return substitutions
}

const parseHeading = (token) => {
  let output = {}

  switch (token.depth) {
    case 1:
      output.name = token.text
    case 2:
      output.avatar = token.text
    case 3:
      output.link = token.text
    case 4:
      output.provider = token.text
  }

  return output
}

const build = () => {
  const testimonials = TESTIMONIALS_MARKDOWN.split('---')
  console.info(`Building ${testimonials.length} testimonials...`)

  const html = testimonials.map((test) => {
    const substitutions = parseTestimonial(test)
    return testimonialTemplate(substitutions)
  })

  fs.writeFileSync(OUTPUT_PATH, html.join('\n'))
}

module.exports = { build }
