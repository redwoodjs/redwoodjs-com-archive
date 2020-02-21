import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["search", "nav", "year"];
  }

  connect() {
    this.yearTarget.textContent = new Date().getFullYear();
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
