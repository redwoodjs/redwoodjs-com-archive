require("dotenv").config();

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/rest");
const octokit = Octokit({
  auth: process.env.GITHUB_AUTH,
  userAgent: "RedwoodJS Builder; @octokit/rest"
});
const template = require("lodash.template");

const { create: createDocs, buildNav } = require("./docutron.js");
const { publish: publishSearch } = require("./search.js");

const NAV_PATH = path.join("code", "html");
const SECTIONS = [
  {
    name: "tutorial",
    files: [{ pageBreakAtHeadingDepth: [1, 2], url: "redwoodjs/tutorial/README.md" }]
  },
  {
    name: "docs",
    files: [
      {
        pageBreakAtHeadingDepth: [1],
        url: "redwoodjs/redwood/README.md",
        title: "Introduction",
        skipLines: 4
      },
      { pageBreakAtHeadingDepth: [1], url: "redwoodjs/redwood/docs/assets.md" },
      { pageBreakAtHeadingDepth: [1], url: "redwoodjs/redwood/packages/dev-server/README.md" },
      { pageBreakAtHeadingDepth: [1], url: "redwoodjs/redwood/packages/cli/README.md" },
      { pageBreakAtHeadingDepth: [1], url: "redwoodjs/redwood/packages/web/src/README.md" },
      { pageBreakAtHeadingDepth: [1], url: "redwoodjs/redwood/packages/router/README.md" }
    ]
  }
];

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const get = async path => {
  const pathParts = path.split("/");
  const response = await octokit.repos.getContents({
    owner: pathParts.shift(),
    repo: pathParts.shift(),
    path: pathParts.join("/")
  });
  const url = response.data.download_url;
  const readme = await fetch(url);
  console.log("Fetched README");

  return await readme.text();
};

const main = async () => {
  await asyncForEach(SECTIONS, async section => {
    const navPath = path.join(NAV_PATH, `_${section.name}_nav.html`);
    let navLinks = "";

    await asyncForEach(section.files, async file => {
      const markdown = await get(file.url);
      const pages = createDocs(markdown, section.name, file);

      navLinks += buildNav(pages).join("\n");
      publishSearch(markdown, section.name, file);
    });

    fs.writeFileSync(navPath, navLinks);
    console.info(`+ Wrote _${section.name}_nav.html`);
  });
};

main();
