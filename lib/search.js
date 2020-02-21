const { paramCase } = require("param-case");
const md5 = require("blueimp-md5");
const algoliasearch = require("algoliasearch");
const searchClient = algoliasearch(process.env["ALGOLIA_APP_ID"], process.env["ALGOLIA_API_KEY"]);
const searchIndex = searchClient.initIndex(process.env["ALGOLIA_INDEX_NAME"]);
const marked = require("marked");
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, language) {
    const hljs = require("highlight.js");
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    return hljs.highlight(validLanguage, code).value;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

const IGNORE_TOKENS = [
  "blockquote_start",
  "blockquote_end",
  "hr",
  "html",
  "list_start",
  "list_end",
  "list_item_start",
  "list_item_end",
  "loose_item_start",
  "space"
];

const tokenToSearchRecord = (book, chapter, section, token) => {
  const id = md5(`${book}:${chapter}:${section}:${token.type}:${token.text}`);
  const href = `/${book}/${paramCase(chapter.toLowerCase())}.html#${paramCase(
    section.toLowerCase()
  )}`;

  return {
    objectID: id,
    href,
    book: book,
    chapter,
    section,
    type: token.type,
    text: token.text
  };
};

const publish = (markdown, book) => {
  const tokens = marked.lexer(markdown);
  const records = [];
  let chapter = null;
  let section = null;

  tokens.forEach(token => {
    if (IGNORE_TOKENS.indexOf(token.type) !== -1) {
      return;
    }

    if (token.type === "heading") {
      // start a new heading section
      if (token.depth === 1 || token.depth === 2) {
        chapter = token.text;
        section = token.text;
      } else {
        section = token.text;
      }
    } else {
      // create a new record based on this token
      records.push(tokenToSearchRecord(book, chapter, section, token));
    }
  });

  console.info(`\nSending ${records.length} records to search...\n`);
  searchIndex.saveObjects(records, { autoGenerateObjectIDIfNotExist: true });
};

module.exports = { publish };
