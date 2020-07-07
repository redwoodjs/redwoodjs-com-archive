# Testing

The current state of Webpack, Babel, ESLint, and React makes testing hard. But testing shouldn’t be a remote “nice to have”. It should be an accessible “must have”.

The Redwood experience lets developers run meaningful, informative tests out of the box:

- Test template files included in generators and scaffolding
- No additional config or setup required out of the box
- If additional config is needed, capability for simple config extension managed from either App root or specific to App sides (e.g. web/, api/, etc.).
- New app sides included automatically by test runners
- Identical DX to development in Redwood at large, e.g. auto-imports, ESLint settings, etc.
- Opinionated about library and best practices, (which, in our case, means React Testing Library)
- Bootstrapped CI using GHActions running lint and jest

In Redwood, Jest tests are first-class citizens, built into the CLI, templates with your generated code, and (soon) a GH Action for CI you can add. Out of the box you generate code, run yarn rw test, and have CI. Boom!

## Generators

If you use generators, you're kind of testing your app already. Most of generators create test files:

```plaintext{6}
~/redwood-app$ yarn rw g page home /
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g page home /
  ✔ Generating page files...
    ✔ Writing `./web/src/pages/HomePage/HomePage.stories.js`...
    ✔ Writing `./web/src/pages/HomePage/HomePage.test.js`...
    ✔ Writing `./web/src/pages/HomePage/HomePage.js`...
  ✔ Updating routes file...
Done in 1.26s.
```

On the web side, the tests that come with the [component](https://github.com/redwoodjs/redwood/blob/main/packages/cli/src/commands/generate/component/templates/test.tsx.template),
[page](https://github.com/redwoodjs/redwood/blob/main/packages/cli/src/commands/generate/page/templates/test.js.template),
and [layout](https://github.com/redwoodjs/redwood/blob/main/packages/cli/src/commands/generate/layout/templates/test.js.template) generators just check to see that they render successfully.
The test that comes with the [cell](https://github.com/redwoodjs/redwood/blob/main/packages/cli/src/commands/generate/cell/templates/test.js.template) generator is a little more complicated since a Cell is really four components in one.

> **NOTE:** The test file that the cell generator creates currently doesn't pass. We're thinking about what this file should look like. If you have ideas, [tell us](https://github.com/redwoodjs/redwood/issues/629)!

On the api side, the test that comes with the [service](https://github.com/redwoodjs/redwood/blob/main/packages/cli/src/commands/generate/service/templates/test.ts.template) generator checks to see that `true` equals to `true`. As you can imagine, this one is very much a work in progress. But unlike the test that comes with the cell generator, it passes.

As with all generators, the idea here remains the same&mdash;they're to get you going. The hard implementation details are up to you. But redwood makes it easy for you to get started and keep going.

## Running tests

You can run all of a Redwood app's tests with `yarn rw test`. To only run the tests for a specific side, just specify the side (e.g. `yarn rw test web`). See also [CLI commands](https://redwoodjs.com/reference/command-line-interface#test).

## api

Testing your api side usually means testing your Services. And testing your Services usually means testing CRUD operations on a database. But not your real database.

When you run `yarn rw test api`, you'll notice that the first thing that happens is a Prisma migration&mdash;you see the same output that you'd see if you ran `yarn rw db up`. And that's because `yarn rw test api` _is_ running `yarn rw db up`, but with `DATABASE_URL` (an environment variable that tells Prisma Client where your database is) set to the location of your test database. So anything you do in your test database stays in your test database.

> My test database? Yes, Redwood apps have a test database now. You can set the location of your test database yourself in one of your dotenv files: `TEST_DATABASE_URL=...`. But you don't have to. By default, Redwood will put your test database in `node_modules/.redwood/test.db`.

Let's walk through an example. Say we have a user service:

```javascript
// api/src/services/user/user.js

import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}
```

and we want to test `users`. We're a bit skeptical: does it actually return all the users in our database?

If you used a generator, there's already a `user.test.js` file in the same directory. Let's write our test for `users` there:

```javascript
// api/src/services/user/user.test.js

import { db } from 'src/lib/db'

import { users } from './users'

describe('Users Service', () => {
  it('users returns all users', async () => {
    const newUser = await db.user.create({
      data: {
        email: 'sarah@prisma.io'
      }
    })

    expect(await users()).toEqual([newUser])
  })
})
```

Here we create a new user in our test database and check to see that `users()` retrieves it. Let's see if it does by running `yarn rw test api`:

```terminal
 PASS  src/services/users/users.test.js
  Users Service
    ✓ users returns all users (502ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.265s
Ran all test suites.
[00:07:34] Running 'api' jest tests [completed]
```

Before each test, all the models in the test database get wiped. So `sarah@prisma.io`, our test database's only user (which `users()` successfully retrieved) won't be around for our next test.

Note that while `db` is the same as what your used to using in your Services, since we changed `DATABASE_URL`, this Prisma Client's subtly different&mdash;it's auto-generated from the same schema, and has all the same CRUD operations, but it's connected to a different database: your test database.

<!-- TODO -->
<!-- What if we want to seed it per se? -->
<!-- I.e. shouldn't have to keep creating new users... -->
<!-- What if we want to test against our real data? -->
<!-- Some more best practices.. -->

## web

To test the web side, `@redwoodjs/testing` integrates [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) so that it works out-of-the-box with Redwood's other packages.
You can import anything you'd normally import from `@testing-library/react` from `@redwoodjs/testing`:

<!-- Source: https://github.com/redwoodjs/redwoodjs.com/issues/162#issue-627989417 -->
```javascript{3}
// ./web/src/layouts/HomePage/HomePage.test.js

import { render, screen } from '@redwoodjs/testing'

import HomePage from './HomePage'

test('HomePage renders successfully', () => {
  // Where <HomePage /> renders
  // <div>
  //   <h1>HomePage</h1>
  //   <p>Find me in ./web/src/pages/HomePage/HomePage.js</p>
  // </div>
  render(<HomePage />)

  expect(screen.getByText('HomePage')).toBeInTheDocument()
})
```

> Note that `render` is a [custom render](https://github.com/redwoodjs/redwood/blob/main/packages/testing/src/customRender.tsx) implemented by `@redwoodjs/testing` and not simply a re-export of `render` from `@testing-library/react`.

`toBeInTheDocument` in the example above is a custom matcher from [jest-dom](https://testing-library.com/docs/ecosystem-jest-dom), a companion library for React Testing Library. You can find the full list of custom matchers [here](https://github.com/testing-library/jest-dom#custom-matchers).

To effectively test the web side, you should be familiar with [Jest](https://jestjs.io/docs/en/getting-started), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro), and [jest-dom](https://testing-library.com/docs/ecosystem-jest-dom). Kent C. Dodd's [blog](https://kentcdodds.com/blog/?q=testing) is also an excellent resource.

<!-- TODO -->
<!-- Handled later in routes? -->
<!-- Why do we have a custom render? -->

<!-- TODO -->
<!-- More "tables of imports..." -->

### Mocking API Calls with Mock Service Worker

<!-- This mostly for testing cells (right?) -->

[todo]

We use [Mock Service Worker](https://mswjs.io/) (MSW) to mock api calls. Mock Service Worker is unique in that it intercepts requests on the network level instead of on the application level.

> This is also how storybook works too...

<!-- TODO -->
<!-- Do we have any guidelines on storing mocks in a... -->

One abstraction Redwood provides when using MSW is, to add a [runtime request handler](https://mswjs.io/docs/api/setup-server/use) (a handler added after server setup), you don't have to call `server.use`&mdash;Redwood's `rest` and `graphql` functions are already wrapped in it:

<!-- Server use https://mswjs.io/docs/api/setup-server/use -->

<!-- Unless you set the handlers up front, which you most likely won't be doing/isn't the intended user-flow, you'll be adding "runtime" handlers. -->

```javascript
// https://github.com/redwoodjs/redwood/blob/main/packages/testing/src/index.ts#L17-L20

export const graphql: GraphQLMock = {
  query: (...args) => server.use(originalGraphql.query(...args)),
  mutation: (...args) => server.use(originalGraphql.mutation(...args)),
}

export const rest: RestMock = {
  get: (...args) => server.use(originalRest.get(...args)),
  post: (...args) => server.use(originalRest.post(...args)),
  delete: (...args) => server.use(originalRest.delete(...args)),
  put: (...args) => server.use(originalRest.put(...args)),
  patch: (...args) => server.use(originalRest.patch(...args)),
  options: (...args) => server.use(originalRest.options(...args)),
}
```

<!-- TODO -->
<!-- ## Customizing Jest -->
<!-- Source: https://github.com/redwoodjs/redwood/issues/564 -->

<!-- You can customize Jest by importing Redwood's config from '@redwoodjs/core' and merging it with your own. See [Configuring Jest](https://jestjs.io/docs/en/configuration.html). -->

<!-- TODO -->
<!-- e2e test were attempted -->
<!-- Source: https://github.com/redwoodjs/redwood/pull/731 -->

<!-- TODO -->
<!-- Mocking media/assets -->

<!-- Source: https://github.com/redwoodjs/redwood/issues/265#issuecomment-633942902 -->
<!-- Source: https://github.com/redwoodjs/redwood/pull/521 -->
