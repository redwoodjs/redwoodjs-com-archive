import { Controller } from "stimulus";
import hljs from "highlight.js";

export default class extends Controller {
  static get targets() {
    return ["search", "nav", "code", "year"];
  }

  connect() {
    this.yearTarget.textContent = new Date().getFullYear();
    this.codeTargets.forEach(target => {
      hljs.highlightBlock(target);
    });
  }

  focusSearch(event) {
    if (event.key === "/") {
      this.searchTarget.focus();
    }
  }

  toggleNav() {
    this.navTarget.classList.toggle("hidden");
    document.body.classList.toggle("fixed");
  }
}
