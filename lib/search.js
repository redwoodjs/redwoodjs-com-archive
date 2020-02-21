const { paramCase } = require("param-case");
const { titleCase } = require("title-case");
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
    book: titleCase(book),
    chapter,
    section,
    type: token.type,
    text: token.text
  };
};

const publish = (markdown, book, options = {}) => {
  const tokens = marked.lexer(markdown);
  const records = [];
  let chapter = null;
  let section = null;

  const shouldPageBreak = depth => {
    return options.pageBreakAtHeadingDepth.indexOf(depth) !== -1;
  };

  const shouldIgnoreToken = type => {
    return IGNORE_TOKENS.indexOf(type) !== -1;
  };

  const isHeader = type => {
    return type === "heading";
  };

  tokens.forEach(token => {
    if (shouldIgnoreToken(token.type)) {
      return;
    }

    if (isHeader(token.type)) {
      if (shouldPageBreak(token.depth)) {
        // start a new page
        chapter = token.text;
        section = token.text;
      } else {
        // keep the same page, but change the section's name
        section = token.text;
      }
    } else {
      records.push(tokenToSearchRecord(book, chapter, section, token));
    }
  });

  console.info(`\nSending ${records.length} records to search...\n`);
  searchIndex.saveObjects(records, { autoGenerateObjectIDIfNotExist: true });
};

module.exports = { publish };
