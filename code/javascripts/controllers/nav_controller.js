import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["link"];
  }

  connect() {
    this._highlightNav();
  }

  // Highlight nav items if the URL matches the `href` on the link, or if the link has a
  // `data-match` attribute and location.href matches that value
  _highlightNav() {
    this.linkTargets.forEach(link => {
      if (
        link.href === location.href ||
        (link.dataset.match && location.href.match(link.dataset.match))
      ) {
        link.classList.add(...this.data.get("active").split(" "));
        if (this.data.get("remove")) {
          link.classList.remove(...this.data.get("remove").split(" "));
        }
      } else {
        link.classList.remove(...this.data.get("active").split(" "));
      }
    });
  }
}
