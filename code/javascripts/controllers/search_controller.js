import { Controller } from "stimulus";
import template from "lodash.template";

export default class extends Controller {
  static get targets() {
    return ["results"];
  }

  initialize() {
    // create a handler bound to `this` that we can add and remove
    this.documentClickHandler = () => {
      this.close();
    };

    this.client = algoliasearch("FK1BZ27LVA", "7529991044069660797050dc19e7bebd");
    this.index = this.client.initIndex("redwoodjs");
    this.searchOptions = {
      hitsPerPage: 3,
      attributesToRetrieve: "*",
      attributesToSnippet: "text:20,section:20",
      attributesToHighlight: null,
      snippetEllipsisText: "…",
      analytics: true
    };

    this.searchResultTemplate = template(`
      <a href="\${href}" class="p-2 block hover:bg-red-100 rounded searchresult">
        <div class="flex items-center">
          <h3 class="w-1/3 text-sm text-red-700 leading-5">\${chapter}</h3>
          <div class="w-2/3 ml-2">
            <h4 class="text-sm text-red-500">\${section}</h3>
            <p class="text-xs text-gray-500 \${
              type == "code" ? "font-mono bg-red-200 text-red-500 p-1 rounded" : ""
            }">\${text}</p>
          </div>
        </div>
      </a>`);
  }

  connect() {}

  // Highlight nav items if the URL matches the `href` on the link, or if the link has a
  // `data-match` attribute and location.href matches that value
  search(event) {
    if (event.key === "Escape") {
      this.close();
      return;
    } else {
      this.index.search(event.currentTarget.value, this.searchOptions).then(data => {
        console.info(data);
        this._parseResults(data);
      });
    }
  }

  close() {
    this.resultsTarget.classList.add("hidden");
    document.removeEventListener("click", this.documentClickHandler);
  }

  _parseResults(data) {
    if (data.hits.length === 0) {
      return this._show(
        `<p class="text-sm font-semibold">No docs found for <span class="text-red-700">${data.query}</span></p>`
      );
    }

    const sections = [];
    data.hits.map(hit => {
      if (sections.indexOf(hit.book) === -1) {
        sections.push(hit.book);
      }
    });

    const items = {};
    data.hits.forEach(hit => {
      let attributes = Object.assign(hit, {
        text: hit._snippetResult.text.value,
        section: hit._snippetResult.section.value
      });
      let html = this.searchResultTemplate(attributes);

      if (items[hit.book]) {
        items[hit.book].push(html);
      } else {
        items[hit.book] = [html];
      }
    });

    let output = "";
    for (let item in items) {
      output += `<h2 class="border-b">${item}</h2>`;
      output += items[item].join("");
    }

    this._show(output);
  }

  _show(html) {
    this.resultsTarget.classList.remove("hidden");
    this.resultsTarget.innerHTML = html;
    document.addEventListener("click", this.documentClickHandler);
  }
}
