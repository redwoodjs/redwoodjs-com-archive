import { Controller } from 'stimulus'
import hljs from 'highlight.js'
import ClipboardJS from 'clipboard'

export default class extends Controller {
  static get targets() {
    return ['header', 'logo', 'search', 'nav', 'innerNav', 'body', 'code', 'year']
  }

  connect() {
    // set the year in the footer
    this.yearTarget.textContent = new Date().getFullYear()

    // code highlighting
    this.codeTargets.forEach((target) => {
      hljs.highlightBlock(target)
    })

    // show the header logo unless we're on the homepage
    if (!this.isHomePage) {
      this.logoTarget.classList.remove('lg:hidden')
    }

    // add copy buttons to code blocks
    this._enableCopy()
  }

  focusSearch(event) {
    if (event.key === '/' && !this.someInputHasFocus) {
      this.searchTarget.focus()
      event.preventDefault()
    }
  }

  toggleNav() {
    this.navTarget.classList.toggle('hidden')
    this.bodyTarget.classList.toggle('hidden')
  }

  closeNav() {
    this.navTarget.classList.add('hidden')
    this.bodyTarget.classList.remove('hidden')
  }

  saveScrollPosition() {
    window.navScrollPosition = this.innerNavTarget.scrollTop
    if (window.scrollY > this.headerTarget.offsetHeight) {
      window.windowScrollPosition = this.headerTarget.offsetHeight
    } else {
      window.windowScrollPosition = window.scrollY
    }
  }

  restoreScrollPosition() {
    if (window.navScrollPosition !== 0 || window.windowScrollPosition !== 0) {
      this.innerNavTarget.scrollTop = window.navScrollPosition || 0
      window.scrollTo(null, window.windowScrollPosition || 0)
    }
  }

  _enableCopy() {
    const COPY_BUTTON_CSS = [
      'copy-button',
      'absolute',
      'right-0',
      'bottom-0',
      'm-2',
      'text-xs',
      'text-gray-500',
      'hover:text-gray-400',
      'bg-gray-800',
      'hover:bg-gray-700',
      'px-1',
      'rounded',
      'focus:outline-none',
      'transition',
      'duration-100',
      'focus:outline-none',
      'focus:shadow-outline',
    ]
    const codeBlocks = document.getElementsByTagName('code')
    for (let block of codeBlocks) {
      const parent = block.parentElement

      // is this is a copyable code block <pre><code>...</code></pre>
      if (parent.tagName === 'PRE') {
        parent.classList.add('relative')
        var button = document.createElement('button')
        button.classList.add(...COPY_BUTTON_CSS)
        button.textContent = 'Copy'
        block.parentElement.appendChild(button)

        new ClipboardJS('.copy-button', {
          text: (trigger) => {
            this._copiedMessage(trigger)
            return this._stripComments(trigger.previousElementSibling.innerText)
          },
        })
      }
    }
  }

  _copiedMessage(trigger) {
    trigger.focus()
    trigger.textContent = 'Copied'
    setTimeout(() => {
      trigger.textContent = 'Copy'
    }, 750)
  }

  // strips any leading comments out of a chunk of text
  _stripComments(content) {
    let lines = content.split('\n')

    if (lines[0].match(/^\/\/|\*/)) {
      lines.shift()
      // remove empty lines after comments
      while (lines[0].trim() === '') {
        lines.shift()
      }
    }

    return lines.join('\n')
  }

  get isHomePage() {
    return location.pathname === '/'
  }

  get someInputHasFocus() {
    return ['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) !== -1
  }
}
