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

const NAV_PATH = path.join("code", "html", "_nav.html");
const navTemplate = template(fs.readFileSync(NAV_PATH).toString());

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
  const sections = [
    {
      name: "tutorial",
      path: "redwoodjs/tutorial/README.md"
    }
  ];
  const navLinks = { tutorial: [], docs: [], cookbook: [] };

  await asyncForEach(sections, async section => {
    const markdown = await get(section.path);
    publishSearch(markdown, section.name);
    const pages = createDocs(markdown, section.name);
    // get the nav links for all pages
    navLinks[section.name] = buildNav(pages).join("\n");
  });

  // put page nav links into _nav.html
  const newNavContent = navTemplate(navLinks);
  fs.writeFileSync(NAV_PATH, newNavContent);
  console.info("+ Wrote _nav.html");
};

main();
