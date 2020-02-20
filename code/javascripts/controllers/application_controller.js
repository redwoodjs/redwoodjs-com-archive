import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["nav", "year"];
  }

  connect() {
    this.yearTarget.textContent = new Date().getFullYear();
  }

  toggleNav() {
    this.navTarget.classList.toggle("hidden");
    document.body.classList.toggle("fixed");
  }
}
