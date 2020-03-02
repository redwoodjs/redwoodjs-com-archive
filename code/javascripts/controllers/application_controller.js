import { Controller } from "stimulus";
import hljs from "highlight.js";

export default class extends Controller {
  static get targets() {
    return ["logo", "search", "nav", "code", "year"];
  }

  connect() {
    this.yearTarget.textContent = new Date().getFullYear();
    this.codeTargets.forEach(target => {
      hljs.highlightBlock(target);
    });
    if (!this.isHomePage) {
      this.logoTarget.classList.remove("lg:hidden");
    }
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

  get isHomePage() {
    return location.pathname === "/";
  }
}
