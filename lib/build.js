require('dotenv').config()

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const { Octokit } = require('@octokit/rest')
const octokit = Octokit({
  auth: process.env.GITHUB_AUTH,
  userAgent: 'RedwoodJS Builder; @octokit/rest',
})

const { create: createDocs, buildNav } = require('./docutron.js')
const { publish: publishSearch, getObjectIDs } = require('./search.js')
const { run: buildNews } = require('./news.js')

const HTML_ROOT = path.join('code', 'html')
const SECTIONS = [
  {
    name: 'tutorial',
    files: [{ pageBreakAtHeadingDepth: [1, 2], file: './TUTORIAL.md' }],
  },
  {
    name: 'docs',
    files: [
      {
        pageBreakAtHeadingDepth: [1],
        url: 'redwoodjs/redwood/README.md',
        title: 'Introduction',
        skipLines: 4,
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/appConfiguration.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/assetsAndFiles.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/authentication.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/builds.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/cliCommands.md',
        title: 'CLI Commands',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/connectionPooling.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/contributing.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/dataMigrations.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/environmentVariables.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/flashMessaging.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/form.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/localPostgresSetup.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: 'redwoodjs/redwood/packages/router/README.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/serverlessFunctions.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/mockGraphQLRequests.md',
      },
      {
        pageBreakAtHeadingDepth: [1],
        url: './docs/webpackConfiguration.md',
      },
    ],
  },
  {
    name: 'cookbook',
    files: [
      { pageBreakAtHeadingDepth: [1], file: './cookbook/Custom_Function.md' },
      { pageBreakAtHeadingDepth: [1], file: './cookbook/File_Upload.md' },
      { pageBreakAtHeadingDepth: [1], file: './cookbook/Mocking_GraphQL_Storybook.md' },
      { pageBreakAtHeadingDepth: [1], file: './cookbook/No_API.md' },
      { pageBreakAtHeadingDepth: [1], file: './cookbook/Third_Party_API.md' },
      { pageBreakAtHeadingDepth: [1], file: './cookbook/GoTrue_Auth.md' },
    ],
  },
  {
    name: 'videos',
    files: [
      { pageBreakAtHeadingDepth: [1], file: './videos/tutorial.md' },
      { pageBreakAtHeadingDepth: [1], file: './videos/authentication.md' },
      { pageBreakAtHeadingDepth: [1], file: './videos/router.md' },
    ],
  },
]

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

// gets the contents of a file
const get = async (pathToFile) => {
  const pathParts = pathToFile.split('/')

  if (pathParts[0] === '.') {
    return fs.readFileSync(path.join(...pathParts)).toString()
  } else {
    const response = await octokit.repos.getContents({
      owner: pathParts.shift(),
      repo: pathParts.shift(),
      path: pathParts.join('/'),
    })
    const url = response.data.download_url
    const readme = await fetch(url)
    console.log(`Fetched ${url}`)
    return await readme.text()
  }
}

// gets latest released version from GitHub
const getLatestVersion = async () => {
  const response = await octokit.repos.listReleases({
    owner: 'redwoodjs',
    repo: 'redwood',
  })
  const version = response.data[0].tag_name
  console.info(`For version ${version}`)
  return version
}

// sets version variable on static pages in code/html
const setPageVersions = (version) => {
  // get only regular html files
  const files = fs.readdirSync(HTML_ROOT).filter((file) => {
    return path.basename(file).match(/^[^_].*?\.html$/)
  })
  files.forEach((file) => {
    const filePath = path.join(HTML_ROOT, file)
    const content = fs.readFileSync(filePath).toString()
    fs.writeFileSync(
      filePath,
      content.replace(/^@@layout(.*?)"version": "(.*?)"(.*?)$/m, `@@layout$1"version": "${version}"$3`)
    )
  })
}

const main = async () => {
  const objectIDs = await getObjectIDs()
  const version = await getLatestVersion()

  buildNews()
  setPageVersions(version)

  await asyncForEach(SECTIONS, async (section) => {
    const navPath = path.join(HTML_ROOT, `_${section.name}_nav.html`)
    let navLinks = ''

    console.info(`\nWorking on ${section.name}...`)
    console.group()
    await asyncForEach(section.files, async (file, index) => {
      const markdown = await get(file.url || file.file)
      const pages = createDocs(markdown, section.name, { ...file, version })

      navLinks += buildNav(pages, section.name, index).join('\n')
      await publishSearch(markdown, section.name, { ...file, objectIDs })
      console.info('')
    })
    fs.writeFileSync(navPath, navLinks)
    console.info(`(nav) Wrote _${section.name}_nav.html`)
    console.groupEnd()
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
