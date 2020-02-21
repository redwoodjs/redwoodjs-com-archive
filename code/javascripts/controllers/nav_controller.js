import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["link"];
  }

  connect() {
    this._highlightNav();
  }

  // opens/closes a nav section
  toggle(event) {
    event.preventDefault();
    event.currentTarget.nextSibling.nextSibling.classList.toggle("hidden");
  }

  // Highlight nav items if the URL matches the `href` on the link, or if the link has a
  // `data-match` attribute and location.href matches that value
  _highlightNav() {
    this.linkTargets.forEach(link => {
      console.info(link.href, location.href);
      if (
        location.href.indexOf(link.href) !== -1 ||
        (link.dataset.match && location.href.match(link.dataset.match))
      ) {
        link.classList.add(...this.data.get("active").split(" "));
        if (this.data.get("remove")) {
          link.classList.remove(...this.data.get("remove").split(" "));
        }
        // make sure whole parent list is visible
        link.closest("ul").classList.remove("hidden");
      } else {
        link.classList.remove(...this.data.get("active").split(" "));
      }
    });
  }
}
