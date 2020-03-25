import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["logo", "search", "nav", "code", "year"];
  }

  connect() {
    // set the year in the footer
    this.yearTarget.textContent = new Date().getFullYear();

    // code highlighting
    if (document.querySelector('code')) {
      import('highlight.js').then(hljs => {
        this.codeTargets.forEach(target => {
          hljs.highlightBlock(target);
        });
      });
    }

    // show the header logo unless we're on the homepage
    if (!this.isHomePage) {
      this.logoTarget.classList.remove("lg:hidden");
    }

    // add copy buttons to code blocks
    this._enableCopy();
  }

  focusSearch(event) {
    if (event.key === "/") {
      this.searchTarget.focus();
      event.preventDefault();
    }
  }

  toggleNav() {
    this.navTarget.classList.toggle("hidden");
    document.body.classList.toggle("fixed");
  }

  _enableCopy() {
    const COPY_BUTTON_CSS = [
      "copy-button",
      "absolute",
      "right-0",
      "bottom-0",
      "m-2",
      "text-xs",
      "text-gray-500",
      "hover:text-gray-400",
      "bg-gray-800",
      "hover:bg-gray-700",
      "px-1",
      "rounded",
      "focus:outline-none",
      "transition",
      "duration-100"
    ];
    const codeBlocks = document.getElementsByTagName("code");
    for (let block of codeBlocks) {
      const parent = block.parentElement;

      // is this is a copyable code block <pre><code>...</code></pre>
      if (parent.tagName === "PRE") {
        parent.classList.add("relative");
        var button = document.createElement("button");
        button.classList.add(...COPY_BUTTON_CSS);
        button.textContent = "Copy";
        block.parentElement.appendChild(button);

        new ClipboardJS(".copy-button", {
          text: trigger => {
            return this._stripComments(trigger.previousElementSibling.textContent);
          }
        });
      }
    }
  }

  // strips any leading comments out of a chunk of text
  _stripComments(content) {
    let lines = content.split("\n");

    if (lines[0].match(/^\/\//)) {
      lines.shift();
      if (lines[0].trim() === "") {
        lines.shift();
      }
    }

    return lines.join("\n");
  }

  get isHomePage() {
    return location.pathname === "/";
  }
}
