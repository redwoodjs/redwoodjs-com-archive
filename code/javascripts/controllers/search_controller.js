import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["results"];
  }

  connect() {
    // create a handler bound to `this` that we can add and remove
    this.documentClickHandler = () => {
      this.close();
    };
  }

  // Highlight nav items if the URL matches the `href` on the link, or if the link has a
  // `data-match` attribute and location.href matches that value
  search(event) {
    console.info(event);
    if (event.key === "Escape") {
      this.close();
    } else {
      this.resultsTarget.classList.remove("hidden");
      document.addEventListener("click", this.documentClickHandler);
    }
  }

  close() {
    this.resultsTarget.classList.add("hidden");
    document.removeEventListener("click", this.documentClickHandler);
  }
}
