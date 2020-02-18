// I'm used on the built-in CameronJS welcome page code/html/index.html
// Feel free to delete me once you start changing that page.

import { Controller } from "stimulus";

export default class extends Controller {
  toggleScreenshot(event) {
    event.target.nextElementSibling.classList.toggle("hidden");
    event.preventDefault();
  }
}
