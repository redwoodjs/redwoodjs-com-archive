/// <reference types="cypress" />

const STEP_2_PAGE_HOME = `
import { Link, routes } from '@redwoodjs/router'

const HomePage = () => {
  return (

    <>
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>Home</main>
    </>
  )
}

export default HomePage`

const STEP_2_PAGE_ABOUT = `
import { Link, routes } from '@redwoodjs/router'

const AboutPage = () => {
  return (

    <>
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <p>
          This site was created to demonstrate my mastery of Redwood: Look on my
          works, ye mighty, and despair!
        </p>
        <Link to={routes.home()}>Return home</Link>
      </main>
    </>
  )
}

export default AboutPage
`

const STEP_3_LAYOUT_BLOG = `
// web/src/layouts/BlogLayout/BlogLayout.js

import { Link, routes } from '@redwoodjs/router'

const BlogLayout = ({ children }) => {
  return (
    <>
      <header>
        <h1>
          <Link to={routes.home()}>Redwood Blog</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}

export default BlogLayout
`

const STEP_3_PAGE_HOME = `
// web/src/pages/HomePage/HomePage.js

import BlogLayout from 'src/layouts/BlogLayout'

const HomePage = () => {

  return <BlogLayout>Home</BlogLayout>
}

export default HomePage
`

const STEP_3_PAGE_ABOUT = `
// web/src/pages/AboutPage/AboutPage.js

import BlogLayout from 'src/layouts/BlogLayout'

const AboutPage = () => {
  return (
    <BlogLayout>
      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
    </BlogLayout>
  )
}

export default AboutPage
`

const STEP_4_DB_SCHEMA = `
// api/prisma/schema.prisma

datasource DS {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = env("BINARY_TARGET")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
`

const STEP_5_CELL_BLOG_POST = `
// web/src/components/BlogPostsCell/BlogPostsCell.js

export const QUERY = gql\`
query {
  posts {
    title
    body
  }
}
\`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => <div>Error: {error.message}</div>

export const Success = ({ posts }) => {
  return JSON.stringify(posts)
}
`

const STEP_5_PAGE_HOME = `
// web/src/pages/HomePage/HomePage.js

import BlogLayout from 'src/layouts/BlogLayout'
import BlogPostsCell from 'src/components/BlogPostsCell'

const HomePage = () => {
  return (
    <BlogLayout>
      <BlogPostsCell />
    </BlogLayout>
  )
}

export default HomePage
`

describe('Redwood Tutorial', () => {
  it('1. Our First Page', () => {
    cy.visit('http://localhost:8910')
    // https://redwoodjs.com/tutorial/our-first-page
    cy.exec('cd /tmp/test; yarn redwood generate page home / --force')
    cy.get('h1').should('contain', 'HomePage')
  })

  it('2. A Second Page and a Link', () => {
    // https://redwoodjs.com/tutorial/a-second-page-and-a-link
    cy.exec('cd /tmp/test; yarn redwood generate page about --force')
    cy.writeFile(
      '/tmp/test/web/src/pages/HomePage/HomePage.js',
      STEP_2_PAGE_HOME
    )
    cy.get('a').contains('About').click()
    cy.get('h1').should('contain', 'AboutPage')
    cy.writeFile(
      '/tmp/test/web/src/pages/AboutPage/AboutPage.js',
      STEP_2_PAGE_ABOUT
    )
    cy.get('h1').should('contain', 'AboutPage')
    cy.get('a').contains('Return home').click()
  })

  it('3. Layouts', () => {
    cy.exec('cd /tmp/test; yarn redwood generate layout blog --force')
    cy.writeFile(
      '/tmp/test/web/src/layouts/BlogLayout/BlogLayout.js',
      STEP_3_LAYOUT_BLOG
    )
    cy.writeFile(
      '/tmp/test/web/src/pages/HomePage/HomePage.js',
      STEP_3_PAGE_HOME
    )
    cy.get('h1 a').contains('Redwood Blog').click()
    cy.get('main').should('contain', 'Home')

    cy.writeFile(
      '/tmp/test/web/src/pages/AboutPage/AboutPage.js',
      STEP_3_PAGE_ABOUT
    )
    cy.get('a').contains('About').click()
    cy.get('p').should(
      'contain',
      'This site was created to demonstrate my mastery of Redwood: Look on my works, ye mighty, and despair!'
    )
  })

  it('4. Getting Dynamic', () => {
    cy.writeFile('/tmp/test/api/prisma/schema.prisma', STEP_4_DB_SCHEMA)

    // TODO: Change to our own command, we need to support `--create-db`
    cy.exec('rm /tmp/test/api/prisma/dev.db')
    cy.exec(
      'cd /tmp/test/api; yarn prisma migrate save --create-db --experimental --name ""',
      {
        env: {
          DATABASE_URL: 'file:./dev.db',
          BINARY_TARGET: 'native',
        },
      }
    )

    cy.exec('cd /tmp/test; yarn rw db up')
    cy.exec('cd /tmp/test; yarn rw g scaffold post')

    cy.visit('http://localhost:8910/posts')

    cy.get('h1').should('contain', 'Posts')
    cy.get('a').contains(' New Post').click()
    cy.get('h2').should('contain', 'New Post')

    // SAVE
    cy.get('input#title').type('First post')
    cy.get('input#body').type('Hello world!')
    cy.get('button').contains('Save').click()

    cy.get('td').contains('First post')

    // EDIT
    cy.get('a').contains('Edit').click()
    cy.get('input#body').clear().type('No, Margle the World!')
    cy.get('button').contains('Save').click()
    cy.get('td').contains('No, Margle the World!')

    // DELETE
    cy.get('a').contains('Delete').click()
    // No more posts, so it should be in the empty state.
    cy.get('a').contains('Create one?').click()
    cy.get('input#title').type('Second post')
    cy.get('input#body').type('Hello world!')
    cy.get('button').contains('Save').click()
  })

  it('5. Cells', () => {
    cy.visit('http://localhost:8910/')

    cy.exec('cd /tmp/test; yarn rw g cell BlogPosts --force')
    cy.writeFile(
      '/tmp/test/web/src/components/BlogPostsCell/BlogPostsCell.js',
      STEP_5_CELL_BLOG_POST
    )
    cy.writeFile(
      '/tmp/test/web/src/pages/HomePage/HomePage.js',
      STEP_5_PAGE_HOME
    )
    cy.get('main').should(
      'contain',
      '[{"title":"Second post","body":"Hello world!","__typename":"Post"}]'
    )
  })
})
