import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["year"];
  }

  connect() {
    this.yearTarget.textContent = new Date().getFullYear();
  }
}
