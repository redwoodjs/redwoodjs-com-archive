const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const template = require("lodash.template");
const { paramCase } = require("param-case");
const { Octokit } = require("@octokit/rest");
const octokit = Octokit({
  auth: process.env.GITHUB_AUTH,
  userAgent: "RedwoodJS Builder; @octokit/rest"
});
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

const NAV_TEMPLATE_PATH = path.join("lib", "templates", "_nav.html.template");
const NAV_OUTPUT_PATH = path.join("code", "html", "_nav.html");
const TUTORIAL_TEMPLATE_PATH = path.join("lib", "templates", "tutorial_page.html.template");
const TUTORIAL_OUTPUT_PATH = path.join("code", "html");
const navTemplate = template(fs.readFileSync(NAV_TEMPLATE_PATH).toString());
const tutorialTemplate = template(fs.readFileSync(TUTORIAL_TEMPLATE_PATH).toString());

const getReadme = async () => {
  const response = await octokit.repos.getContents({
    owner: "redwoodjs",
    repo: "tutorial",
    path: "README.md"
  });
  const url = response.data.download_url;
  const readme = await fetch(url);
  console.log("Fetched README");

  return await readme.text();
};

const buildTutorial = sections => {
  sections.forEach(section => {
    const content = marked(section.text);
    const output = tutorialTemplate({ content, links: [] });

    fs.writeFileSync(path.join(TUTORIAL_OUTPUT_PATH, section.href), output);
  });
  console.log(`Created ${sections.length} tutorial pages`);
};

const extractSections = markdown => {
  const sections = [];
  let buffer = [];

  markdown.split("\n").forEach(line => {
    if (line.match(/^##? /m) && buffer.length) {
      sections.push(buffer.join("\n"));
      buffer = [];
    }
    buffer.push(line);
  });

  const groups = sections.map(section => {
    const title = section.match(/^##? (.*)$/m)[1];

    return { href: `/tutorial/${paramCase(title)}.html`, title, text: section };
  });

  return groups;
};

const buildNav = sections => {
  const output = navTemplate({ links: sections });

  fs.writeFileSync(NAV_OUTPUT_PATH, output);
  console.log(`Created _nav.html`);
};

const main = async () => {
  const readme = await getReadme();
  const sections = extractSections(readme);

  buildTutorial(sections);
  buildNav(sections);
};

main();
