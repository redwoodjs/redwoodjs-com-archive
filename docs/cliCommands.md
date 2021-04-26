# Command Line Interface

The following is a comprehensive reference of the Redwood CLI. You can get a glimpse of all the commands by scrolling the aside to the right.

The Redwood CLI has two entry-point commands:

1. **redwood** (alias `rw`), which is for developing an application, and
2. **redwood-tools** (alias `rwt`), which is for contributing to the framework.

This document covers the `redwood` command . For `redwood-tools`, see [Contributing](https://github.com/redwoodjs/redwood/blob/main/CONTRIBUTING.md#cli-reference-redwood-tools) in the Redwood repo.

**A Quick Note on Syntax**

We use [yargs](http://yargs.js.org/) and borrow its syntax here:

```
yarn redwood generate page <name> [path] --option
```

</br>

- `redwood g page` is the command.
- `<name>` and `[path]` are positional arguments.
  - `<>` denotes a required argument.
  - `[]` denotes an optional argument.
- `--option` is an option.

Every argument and option has a type. Here `<name>` and `[path]` are strings and `--option` is a boolean.

You'll also sometimes see arguments with trailing `..` like:

```
yarn redwood build [side..]
```

The `..` operator indicates that the argument accepts an array of values. See [Variadic Positional Arguments](https://github.com/yargs/yargs/blob/master/docs/advanced.md#variadic-positional-arguments).

## build

Build for production.

```terminal
yarn redwood build [side..]
```

We use Babel to transpile the api side into `./api/dist` and Webpack to package the web side into `./web/dist`.

| Arguments & Options | Description                                                                                                                                                                 |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`              | Which side(s) to build. Choices are `api` and `web`. Defaults to `api` and `web`                                                                                            |
| `--stats`           | Use [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) to visualize the size of Webpack output files via an interactive zoomable treemap |
| `--verbose, -v`     | Print more information while building                                                                                                                                       |

**Usage**

See [Builds](https://redwoodjs.com/docs/builds).

**Example**

Running `yarn redwood build` without any arguments generates the Prisma client and builds both sides of your project:

```terminal
~/redwood-app$ yarn redwood build
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood build
  ✔ Generating the Prisma client...
  ✔ Building "api"...
  ✔ Building "web"...
Done in 17.37s.
```

Files are output to each side's `dist` directory:

```plaintext{2,6}
├── api
│   ├── dist
│   ├── prisma
│   └── src
└── web
    ├── dist
    ├── public
    └── src
```

## check (alias diagnostics)

Get structural diagnostics for a Redwood project (experimental).

```
yarn redwood check
```

**Example**

```terminal
~/redwood-app$ yarn redwood check
yarn run v1.22.4
web/src/Routes.js:14:5: error: You must specify a 'notfound' page
web/src/Routes.js:14:19: error: Duplicate Path
web/src/Routes.js:15:19: error: Duplicate Path
web/src/Routes.js:17:40: error: Page component not found
web/src/Routes.js:17:19: error (INVALID_ROUTE_PATH_SYNTAX): Error: Route path contains duplicate parameter: "/{id}/{id}"
```

## console (alias c)

Launch an interactive Redwood shell (experimental):

- This has not yet been tested on Windows.
- The Prisma Client must be generated _prior_ to running this command, e.g. `yarn redwood prisma generate`. This is a known issue.

```
yarn redwood console
```

Right now, you can only use the Redwood console to interact with your database:

**Example**

```terminal
~/redwood-app$ yarn redwood console
yarn run v1.22.4
> await db.user.findMany()
> [ { id: 1, email: 'tom@redwoodjs.com', name: 'Tom'  } ]
```

## dataMigrate

Data migration tools.

```
yarn redwood dataMigrate <command>
```

<br/>

| Command   | Description                                                                                 |
| :-------- | :------------------------------------------------------------------------------------------ |
| `install` | Appends `DataMigration` model to `schema.prisma`, creates `api/db/dataMigrations` directory |
| `up`      | Executes outstanding data migrations                                                        |

### install

- Appends a `DataMigration` model to `schema.prisma` for tracking which data migrations have already run.
- Creates a DB migration using `yarn redwood prisma migrate dev --create-only create_data_migrations`.
- Creates `api/db/dataMigrations` directory to contain data migration scripts

```terminal
yarn redwood dataMigrate install
```

### up

Executes outstanding data migrations against the database. Compares the list of files in `api/db/dataMigrations` to the records in the `DataMigration` table in the database and executes any files not present.

If an error occurs during script execution, any remaining scripts are skipped and console output will let you know the error and how many subsequent scripts were skipped.

```terminal
yarn redwood dataMigrate up
```

## db

Database tools.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```
yarn redwood db <command>
```

<br/>

<!-- new command? link? deprecated b4... -->

| Command            | Description                                                                                           |
| :----------------- | :---------------------------------------------------------------------------------------------------- |
| `down [decrement]` | Migrate your database down                                                                            |
| `generate`         | Generate the Prisma client                                                                            |
| `introspect`       | Introspect your database and generate models in `./api/db/schema.prisma`, overwriting existing models |
| `save [name..]`    | Create a new migration                                                                                |
| `seed`             | Seed your database with test data                                                                     |
| `studio`           | Start Prisma Studio                                                                                   |
| `up [increment]`   | Generate the Prisma client and apply migrations                                                       |

### down

Migrate your database down.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood db down [decrement]
```

<br/>

| Argument    | Description                                              |
| :---------- | :------------------------------------------------------- |
| `decrement` | Number of backwards migrations to apply. Defaults to `1` |

**Example**

Given the following migrations,

```plaintext{2,4}
api/db/migrations/
├── 20200518160457-create-users  <-- desired
├── 20200518160621-add-profiles
├── 20200518160811-add-posts     <-- current
└── migrate.lock
```

we could get to `20200518160457-create-users` by running:

```terminal
~/redwood-app$ yarn redwood db down 2
```

### generate

Generate the Prisma client.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood db generate
```

The Prisma client is auto-generated and tailored to your `schema.prisma`.
This means that `yarn redwood db generate` needs to be run after every change to your `schema.prisma` for your Prisma client to be up to date. But you usually won't have to do this manually as other Redwood commands run this behind the scenes.

### introspect

Introspect your database and generate models in `./api/db/schema.prisma`, overwriting existing models.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood db introspect
```

### save

Create a new migration.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood db save [name..]
```

A migration defines the steps necessary to update your current schema.

| Argument | Description           |
| :------- | :-------------------- |
| `name`   | Name of the migration |

Running `yarn redwood db save` generates the following directories and files as necessary:

```terminal
api/db/migrations
├── 20200516162516-create-users
│   ├── README.md
│   ├── schema.prisma
│   └── steps.json
└── migrate.lock
```

<br/>

- `migrations`: A directory to store migrations.
- `migrations/<migration>`: A directory for a specific migration. The name (`<migration>`) is composed of a timestamp of when it was created and the name given during `yarn redwood db save`.
- `migrations/<migration>/README.md`: A human-readable description of the migration, including metadata like when the migration was created and by who, a list of the actual migration changes, and a diff of the changes made to `schema.prisma`.
- `migrations/<migration>/schema.prisma`: The schema that will be created if the migration is applied.
- `migrations/<migration>/steps.json`: An alternate representation of the migration steps that will be applied.
- `migrate.lock`: A lock file specifying the current migration.

### seed

Seed your database with test data.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood prisma db seed
```

Runs `seed.js` in `./api/db`. `seed.js` instantiates the Prisma client and provides an async main function where you can put any seed data&mdash;data that needs to exist for your app to run. See the [example blog's seed.js file](https://github.com/redwoodjs/example-blog/blob/master/api/db/seed.js).

### studio

Start <a href="https://github.com/prisma/studio">Prisma Studio</a>, a visual editor for your database.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood db studio
```

### up

Generate the Prisma client and apply migrations.

> **WARNING**
>
> As of `v0.25`, `yarn redwood db <command>` has been deprecated in favor of `yarn redwood prisma <command>`. Click [here](#prisma) to skip to the prisma section below.

```terminal
yarn redwood db up [increment]
```

<br/>

| Arguments & Options | Description                                                   |
| :------------------ | :------------------------------------------------------------ |
| `increment`         | Number of forward migrations to apply. Defaults to the latest |
| `--autoApprove`     | Skip interactive approval before migrating                    |
| `--dbClient`        | Generate the Prisma client                                    |
| `--verbose`         | Print more                                                    |

**Example**

Given the following migrations

```plaintext{2,4}
api/db/migrations/
├── 20200518160457-create-users  <-- current
├── 20200518160621-add-profiles
├── 20200518160811-add-posts     <-- desired
└── migrate.lock
```

we could get to `20200518160811-add-posts` by running:

```terminal
~/redwood-app$ yarn redwood db up 2
```

## dev

Start development servers for api and web.

```terminal
yarn redwood dev [side..]
```

`yarn redwood dev api` starts the Redwood dev server and `yarn redwood dev web` starts the Webpack dev server with Redwood's config.

| Argument           | Description                                                                                                                                                                                                         |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `side`             | Which dev server(s) to start. Choices are `api` and `web`. Defaults to `api` and `web`                                                                                                                              |
| `--forward, --fwd` | String of one or more Webpack Dev Server config options. See example usage below. See the [Redwood Webpack Doc](https://redwoodjs.com/docs/webpack-configuration#webpack-dev-server) for more details and examples. |

**Usage**

If you're only working on your sdl and services, you can run just the api server to get GraphQL Playground on port 8911:

```bash
~/redwood-app$ yarn redwood dev api
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood dev api
$ /redwood-app/node_modules/.bin/dev-server
15:04:51 api | Listening on http://localhost:8911
15:04:51 api | Watching /home/dominic/projects/redwood/redwood-app/api
15:04:51 api |
15:04:51 api | Now serving
15:04:51 api |
15:04:51 api | ► http://localhost:8911/graphql/
```

Using `--forward` (alias `--fwd`), you can pass one or more Webpack Dev Server [config options](https://webpack.js.org/configuration/dev-server/). The following will run the dev server, set the port to `1234`, and disable automatic browser opening.

```bash
~/redwood-app$ yarn redwood dev --fwd="--port=1234 --open=false"
```

You may need to access your dev application from a different host, like your mobile device. To resolve the “Invalid Host Header” message, run the following:

```bash
~/redwood-app$ yarn redwood dev --fwd="--disable-host-check"
```

For the full list of Webpack Dev Server settings, see [this documentation](https://webpack.js.org/configuration/dev-server/).

## deploy

Deploy your redwood project to a hosting provider target.

For Jamstack hosting providers like Netlify and Vercel, the deploy command runs the set of steps to build, apply production DB changes, and apply data migrations. In this context, it is often referred to as a Build Command.

For hosting providers like AWS, this command runs the steps to both build your project _and_ deploy it to AWS.

```
yarn redwood deploy <target>
```

<br/>

| Commands                | Description                                                       |
| :---------------------- | :---------------------------------------------------------------- |
| `aws <provider>`        | Deploy to AWS using the selected provider [choices: "serverless"] |
| `netlify [...commands]` | Build command for Netlify deploy                                  |
| `vercel [...commands]`  | Build command for Vercel deploy                                   |

### aws

Deploy to AWS using the selected provider

```
yarn redwood deploy aws [provider]
```

<br/>

| Options & Arguments | Description                                                                      |
| :------------------ | :------------------------------------------------------------------------------- |
| `provider`          | AWS Deploy provider to configure [choices: "serverless"] [default: "serverless"] |
| `--side`            | which Side(s)to deploy [choices: "api"] [default: "api"]                         |

### netlify

Build command for Netlify deploy

```
yarn redwood deploy netlify [provider]
```

<br/>

| Options                | Description                                          |
| :--------------------- | :--------------------------------------------------- |
| `--build`              | Build for production [default: "true"]               |
| `--prisma`             | Apply database migrations [default: "true"]          |
| `--data-migrate, --dm` | wMigrate the data in your database [default: "true"] |

**Example**
The following command will build, apply Prisma DB migrations, and skip data migrations.

```
yarn redwood deploy netlify --no-data-migrate
```

### vercel

Build command for Vercel deploy

```
yarn redwood deploy vercel [provider]
```

<br/>

| Options                | Description                                          |
| :--------------------- | :--------------------------------------------------- |
| `--build`              | Build for production [default: "true"]               |
| `--prisma`             | Apply database migrations [default: "true"]          |
| `--data-migrate, --dm` | wMigrate the data in your database [default: "true"] |

**Example**
The following command will build, apply Prisma DB migrations, and skip data migrations.

```
yarn redwood deploy vercel --no-data-migrate
```

## destroy (alias d)

Rollback changes made by the generate command.

```
yarn redwood d <type>
```

<br/>

| Command              | Description                                                                     |
| :------------------- | :------------------------------------------------------------------------------ |
| `cell <name>`        | Destroy a cell component                                                        |
| `component <name>`   | Destroy a component                                                             |
| `function <name>`    | Destroy a Function                                                              |
| `layout <name>`      | Destroy a layout component                                                      |
| `page <name> [path]` | Destroy a page and route component                                              |
| `scaffold <model>`   | Destroy pages, SDL, and Services files based on a given DB schema Model         |
| `sdl <model>`        | Destroy a GraphQL schema and service component based on a given DB schema Model |
| `service <name>`     | Destroy a service component                                                     |

## generate (alias g)

Save time by generating boilerplate code.

```
yarn redwood generate <type>
```

Some generators require that their argument be a model in your `schema.prisma`. When they do, their argument is named `<model>`.

| Command                | Description                                                                                           |
| :--------------------- | :---------------------------------------------------------------------------------------------------- |
| `cell <name>`          | Generate a cell component                                                                             |
| `component <name>`     | Generate a component component                                                                        |
| `dataMigration <name>` | Generate a data migration component                                                                   |
| `deploy <provider>`    | Generate a deployment configuration                                                                   |
| `function <name>`      | Generate a Function                                                                                   |
| `layout <name>`        | Generate a layout component                                                                           |
| `page <name> [path]`   | Generate a page component                                                                             |
| `scaffold <model>`     | Generate Pages, SDL, and Services files based on a given DB schema Model. Also accepts `<path/model>` |
| `sdl <model>`          | Generate a GraphQL schema and service object                                                          |
| `service <name>`       | Generate a service component                                                                          |
| `util <util>`          | Quality of life utilities                                                                             |

**Undoing a Generator with a Destroyer**

Most generate commands (i.e., everything but `yarn redwood generate dataMigration`) can be undone by their corresponding destroy command. For example, `yarn redwood generate cell` can be undone with `yarn redwood d cell`.

### cell

Generate a cell component.

```terminal
yarn redwood generate cell <name>
```

Cells are signature to Redwood. We think they provide a simpler and more declarative approach to data fetching.

| Arguments & Options  | Description                              |
| :------------------- | :--------------------------------------- |
| `name`               | Name of the cell                         |
| `--force, -f`        | Overwrite existing files                 |
| `--javascript, --js` | Generate JavaScript files                |
| `--typescript, --ts` | Generate TypeScript files                |
| `--tests`            | Generate test files [default: true]      |
| `--stories`          | Generate Storybook files [default: true] |

**Usage**

See the [Cells](https://redwoodjs.com/tutorial/cells) section of the Tutorial.

**Destroying**

```
yarn redwood d cell <name>
```

**Example**

Generating a user cell:

```terminal
~/redwood-app$ yarn redwood generate cell user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g cell user
  ✔ Generating cell files...
    ✔ Writing `./web/src/components/UserCell/UserCell.test.js`...
    ✔ Writing `./web/src/components/UserCell/UserCell.js`...
Done in 1.00s.
```

A cell defines and exports four constants: `QUERY`, `Loading`, `Empty`, `Failure`, and `Success`:

```javascript
// ./web/src/components/UserCell/UserCell.js

export const QUERY = gql`
  query {
    user {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => <div>Error: {error.message}</div>

export const Success = ({ user }) => {
  return JSON.stringify(user)
}
```

### component

Generate a component.

```terminal
yarn redwood generate component <name>
```

Redwood loves function components and makes extensive use of React Hooks, which are only enabled in function components.

| Arguments & Options  | Description                              |
| :------------------- | :--------------------------------------- |
| `name`               | Name of the component                    |
| `--force, -f`        | Overwrite existing files                 |
| `--javascript, --js` | Generate JavaScript files                |
| `--typescript, --ts` | Generate TypeScript files                |
| `--tests`            | Generate test files [default: true]      |
| `--stories`          | Generate Storybook files [default: true] |

**Destroying**

```
yarn redwood d component <name>
```

**Example**

Generating a user component:

```terminal
~/redwood-app$ yarn redwood generate component user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g component user
  ✔ Generating component files...
    ✔ Writing `./web/src/components/User/User.test.js`...
    ✔ Writing `./web/src/components/User/User.js`...
Done in 1.02s.
```

The component will export some jsx telling you where to find it.

```javascript
// ./web/src/components/User/User.js

const User = () => {
  return (
    <div>
      <h2>{'User'}</h2>
      <p>{'Find me in ./web/src/components/User/User.js'}</p>
    </div>
  )
}

export default User
```

### dataMigration

Generate a data migration script.

```
yarn redwood generate dataMigration <name>
```

Creates a data migration script in `api/db/dataMigrations`.

| Arguments & Options | Description                                                              |
| :------------------ | :----------------------------------------------------------------------- |
| `name`              | Name of the data migration, prefixed with a timestamp at generation time |

**Usage**

See the [Data Migration](/docs/data-migrations) docs.

**Usage**

See the [Deploy](/docs/deploy) docs.

### function

Generate a Function.

```
yarn redwood generate function <name>
```

Not to be confused with Javascript functions, Capital-F Functions are meant to be deployed to serverless endpoints like AWS Lambda.

| Arguments & Options | Description              |
| :------------------ | :----------------------- |
| `name`              | Name of the function     |
| `--force, -f`       | Overwrite existing files |

**Usage**

See the [Custom Function](https://redwoodjs.com/cookbook/custom-function) recipe.

**Destroying**

```
yarn redwood d function <name>
```

**Example**

Generating a user function:

```terminal
~/redwood-app$ yarn redwood generate function user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g function user
  ✔ Generating function files...
    ✔ Writing `./api/src/functions/user.js`...
Done in 16.04s.
```

Functions get passed `context` which provides access to things like the current user:

```javascript
// ./api/src/functions/user.js

export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: `user function`,
  }
}
```

Now if we run `yarn redwood dev api`:

```plaintext{11}
~/redwood-app$ yarn redwood dev api
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood dev api
$ /redwood-app/node_modules/.bin/dev-server
17:21:49 api | Listening on http://localhost:8911
17:21:49 api | Watching /home/dominic/projects/redwood/redwood-app/api
17:21:49 api |
17:21:49 api | Now serving
17:21:49 api |
17:21:49 api | ► http://localhost:8911/graphql/
17:21:49 api | ► http://localhost:8911/user/
```

### layout

Generate a layout component.

```terminal
yarn redwood generate layout <name>
```

Layouts wrap pages and help you stay DRY.

| Arguments & Options  | Description                                         |
|----------------------|-----------------------------------------------------|
| `name`               | Name of the layout                                  |
| `--force, -f`        | Overwrite existing files                            |
| `--javascript, --js` | Generate JavaScript files                           |
| `--typescript, --ts` | Generate TypeScript files                           |
| `--tests`            | Generate test files [default: true]                 |
| `--stories`          | Generate Storybook files [default: true]            |
| `--skipLink`         | Generate a layout with a skip link [default: false] |

**Usage**

See the [Layouts](https://redwoodjs.com/tutorial/layouts) section of the tutorial.

**Destroying**

```
yarn redwood d layout <name>
```

**Example**

Generating a user layout:

```terminal
~/redwood-app$ yarn redwood generate layout user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g layout user
  ✔ Generating layout files...
    ✔ Writing `./web/src/layouts/UserLayout/UserLayout.test.js`...
    ✔ Writing `./web/src/layouts/UserLayout/UserLayout.js`...
Done in 1.00s.
```

A layout will just export it's children:

```javascript
// ./web/src/layouts/UserLayout/UserLayout.test.js

const UserLayout = ({ children }) => {
  return <>{children}</>
}

export default UserLayout
```

### page

Generates a page component and updates the routes.

```terminal
yarn redwood generate page <name> [path]
```

`path` can include a route parameter which will be passed to the generated
page. The syntax for that is `/path/to/page/{routeParam}/more/path`. You can
also specify the type of the route parameter if needed: `{routeParam:Int}`. If
`path` isn't specified, or if it's just a route parameter, it will be derived
from `name` and the route parameter, if specified, will be added to the end.

This also updates `Routes.js` in `./web/src`.

| Arguments & Options | Description                              |
| :------------------ | :--------------------------------------- |
| `name`              | Name of the page                         |
| `path`              | URL path to the page. Defaults to `name` |
| `--force, -f`       | Overwrite existing files                 |
| `--tests`           | Generate test files [default: true]      |
| `--stories`         | Generate Storybook files [default: true] |

**Destroying**

```
yarn redwood d page <name> [path]
```

**Examples**

Generating a home page:

```plaintext
~/redwood-app$ yarn redwood generate page home /
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g page home /
  ✔ Generating page files...
    ✔ Writing `./web/src/pages/HomePage/HomePage.test.js`...
    ✔ Writing `./web/src/pages/HomePage/HomePage.js`...
  ✔ Updating routes file...
Done in 1.02s.
```

The page returns jsx telling you where to find it:

```javascript
// ./web/src/pages/HomePage/HomePage.js

const HomePage = () => {
  return (
    <div>
      <h1>HomePage</h1>
      <p>Find me in ./web/src/pages/HomePage/HomePage.js</p>
    </div>
  )
}

export default HomePage
```

And the route is added to `Routes.js`:

```javascript{6}
// ./web/src/Routes.js

const Routes = () => {
  return (
    <Router>
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}
```

Generating a page to show quotes:

```plaintext
~/redwood-app$ yarn redwood generate page quote {id}
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g page quote {id}
  ✔ Generating page files...
    ✔ Writing `./web/src/pages/QuotePage/QuotePage.stories.js`...
    ✔ Writing `./web/src/pages/QuotePage/QuotePage.test.js`...
    ✔ Writing `./web/src/pages/QuotePage/QuotePage.js`...
  ✔ Updating routes file...
Done in 1.02s.
```

The generated page will get the route parameter as a prop:

```javascript{5,12,14}
// ./web/src/pages/QuotePage/QuotePage.js

import { Link, routes } from '@redwoodjs/router'

const QuotePage = ({ id }) => {
  return (
    <>
      <h1>QuotePage</h1>
      <p>Find me in "./web/src/pages/QuotePage/QuotePage.js"</p>
      <p>
        My default route is named "quote", link to me with `
        <Link to={routes.quote({ id: 42 })}>Quote 42</Link>`
      </p>
      <p>The parameter passed to me is {id}</p>
    </>
  )
}

export default QuotePage
```

And the route is added to `Routes.js`, with the route parameter added:

```javascript{6}
// ./web/src/Routes.js

const Routes = () => {
  return (
    <Router>
      <Route path="/quote/{id}" page={QuotePage} name="quote" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}
```

### scaffold

Generate Pages, SDL, and Services files based on a given DB schema Model. Also accepts `<path/model>`.

```terminal
yarn redwood generate scaffold <model>
```

A scaffold quickly creates a CRUD for a model by generating the following files and corresponding routes:

- sdl
- service
- layout
- pages
- cells
- components

The content of the generated components is different from what you'd get by running them individually.

| Arguments & Options  | Description                                                                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`              | Model to scaffold. You can also use `<path/model>` to nest files by type at the given path directory (or directories). For example, `redwood g scaffold admin/post` |
| `--force, -f`        | Overwrite existing files                                                                                                                                            |
| `--javascript, --js` | Generate JavaScript files                                                                                                                                           |
| `--typescript, --ts` | Generate TypeScript files                                                                                                                                           |

**Usage**

See [Creating a Post Editor](https://redwoodjs.com/tutorial/getting-dynamic#creating-a-post-editor).

You can namespace your scaffolds by providing `<path/model>`. The layout, pages, cells, and components will be nested in newly created dir(s). For example, given a model user, running `yarn redwood generate scaffold admin/user` will nest the layouts, pages, and components in a newly created `admin` directory:

```plaintext{9-20}
~/redwood-app$ yarn redwood generate scaffold admin/user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g scaffold admin/user
  ✔ Generating scaffold files...
    ✔ Writing `./api/src/graphql/users.sdl.js`...
    ✔ Writing `./api/src/services/users/users.test.js`...
    ✔ Writing `./api/src/services/users/users.js`...
    ✔ Writing `./web/src/scaffold.css`...
    ✔ Writing `./web/src/layouts/Admin/UsersLayout/UsersLayout.js`...
    ✔ Writing `./web/src/pages/Admin/EditUserPage/EditUserPage.js`...
    ✔ Writing `./web/src/pages/Admin/UserPage/UserPage.js`...
    ✔ Writing `./web/src/pages/Admin/UsersPage/UsersPage.js`...
    ✔ Writing `./web/src/pages/Admin/NewUserPage/NewUserPage.js`...
    ✔ Writing `./web/src/components/Admin/EditUserCell/EditUserCell.js`...
    ✔ Writing `./web/src/components/Admin/User/User.js`...
    ✔ Writing `./web/src/components/Admin/UserCell/UserCell.js`...
    ✔ Writing `./web/src/components/Admin/UserForm/UserForm.js`...
    ✔ Writing `./web/src/components/Admin/Users/Users.js`...
    ✔ Writing `./web/src/components/Admin/UsersCell/UsersCell.js`...
    ✔ Writing `./web/src/components/Admin/NewUser/NewUser.js`...
  ✔ Adding scaffold routes...
  ✔ Adding scaffold asset imports...
Done in 1.21s.
```

The routes will be nested too:

```javascript{6-9}
// ./web/src/Routes.js

const Routes = () => {
  return (
    <Router>
      <Route path="/admin/users/new" page={AdminNewUserPage} name="adminNewUser" />
      <Route path="/admin/users/{id:Int}/edit" page={AdminEditUserPage} name="adminEditUser" />
      <Route path="/admin/users/{id:Int}" page={AdminUserPage} name="adminUser" />
      <Route path="/admin/users" page={AdminUsersPage} name="adminUsers" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}
```

**Destroying**

```
yarn redwood d scaffold <model>
```

### sdl

Generate a GraphQL schema and service object.

```terminal
yarn redwood generate sdl <model>
```

The sdl will inspect your `schema.prisma` and will do its best with relations. Schema to generators isn't one-to-one yet (and might never be).

<!-- See limited generator support for relations
https://community.redwoodjs.com/t/prisma-beta-2-and-redwoodjs-limited-generator-support-for-relations-with-workarounds/361 -->

| Arguments & Options  | Description                   |
| :------------------- | :---------------------------- |
| `model`              | Model to generate the sdl for |
| `--crud`             | Also generate mutations       |
| `--force, -f`        | Overwrite existing files      |
| `--javascript, --js` | Generate JavaScript files     |
| `--typescript, --ts` | Generate TypeScript files     |

**Destroying**

```
yarn redwood d sdl <model>
```

**Example**

Generating a user sdl:

```terminal
~/redwood-app$ yarn redwood generate sdl user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g sdl user
  ✔ Generating SDL files...
    ✔ Writing `./api/src/graphql/users.sdl.js`...
    ✔ Writing `./api/src/services/users/users.test.js`...
    ✔ Writing `./api/src/services/users/users.js`...
Done in 1.04s.
```

The generated sdl defines a corresponding type, query, and create/update inputs, without defining any mutations. To also get mutations, add the `--crud` option.

```javascript
// ./api/src/graphql/users.sdl.js

export const schema = gql`
  type User {
    id: Int!
    email: String!
    name: String
  }

  type Query {
    users: [User!]!
  }

  input CreateUserInput {
    email: String!
    name: String
  }

  input UpdateUserInput {
    email: String
    name: String
  }
`
```

The services file fulfills the query. If the `--crud` option is added, this file will be much more complex.

```javascript
// ./api/src/services/users/users.js

import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}
```

For a model with a relation, the field will be listed in the sdl:

```javascript{8}
// ./api/src/graphql/users.sdl.js

export const schema = gql`
  type User {
    id: Int!
    email: String!
    name: String
    profile: Profile
  }

  type Query {
    users: [User!]!
  }

  input CreateUserInput {
    email: String!
    name: String
  }

  input UpdateUserInput {
    email: String
    name: String
  }
`
```

And the service will export an object with the relation as a property:

```javascript{9-13}
// ./api/src/services/users/users.js

import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}

export const User = {
  profile: (_obj, { root }) => {
    db.user.findUnique({ where: { id: root.id } }).profile(),
  }
}
```

### service

Generate a service component.

```terminal
yarn redwood generate service <name>
```

Services are where Redwood puts its business logic. They can be used by your GraphQL API or any other place in your backend code. See [How Redwood Works with Data](https://redwoodjs.com/tutorial/side-quest-how-redwood-works-with-data).

| Arguments & Options  | Description                              |
| :------------------- | :--------------------------------------- |
| `name`               | Name of the service                      |
| `--force, -f`        | Overwrite existing files                 |
| `--javascript, --js` | Generate JavaScript files                |
| `--typescript, --ts` | Generate TypeScript files                |
| `--tests`            | Generate test files [default: true]      |
| `--stories`          | Generate Storybook files [default: true] |

**Destroying**

```
yarn redwood d service <name>
```

**Example**

Generating a user service:

```terminal
~/redwood-app$ yarn redwood generate service user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood g service user
  ✔ Generating service files...
    ✔ Writing `./api/src/services/users/users.test.js`...
    ✔ Writing `./api/src/services/users/users.js`...
Done in 1.02s.
```

The generated service component will export a `findMany` query:

```javascript
// ./api/src/services/users/users.js

import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}
```

### util

This command has been deprecated. See [Setup command](#setup).

## info

Print your system environment information.

```terminal
yarn redwood info
```

This command's primarily intended for getting information others might need to know to help you debug:

```terminal
~/redwood-app$ yarn redwood info
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/redwood info

  System:
    OS: Linux 5.4 Ubuntu 20.04 LTS (Focal Fossa)
    Shell: 5.0.16 - /usr/bin/bash
  Binaries:
    Node: 13.12.0 - /tmp/yarn--1589998865777-0.9683603763419713/node
    Yarn: 1.22.4 - /tmp/yarn--1589998865777-0.9683603763419713/yarn
  Browsers:
    Chrome: 78.0.3904.108
    Firefox: 76.0.1
  npmPackages:
    @redwoodjs/core: ^0.7.0-rc.3 => 0.7.0-rc.3

Done in 1.98s.
```

## lint

Lint your files.

```terminal
yarn redwood lint
```

[Our ESLint configuration](https://github.com/redwoodjs/redwood/blob/master/packages/eslint-config/index.js) is a mix of [ESLint's recommended rules](https://eslint.org/docs/rules/), [React's recommended rules](https://www.npmjs.com/package/eslint-plugin-react#list-of-supported-rules), and a bit of our own stylistic flair:

- no semicolons
- comma dangle when multiline
- single quotes
- always use parenthesis around arrow functions
- enforced import sorting

<br/>

| Option  | Description       |
| :------ | :---------------- |
| `--fix` | Try to fix errors |

## open

Open your project in your browser.

```terminal
yarn redwood open
```

## prisma

Run Prisma CLI with experimental features.

```
yarn redwood prisma
```

Redwood's `prisma` command is a lightweight wrapper around the Prisma CLI. It's the primary way you interact with your database.

> **What do you mean it's a lightweight wrapper?**
>
> By lightweight wrapper, we mean that we're handling some flags under the hood for you.
> You can use the Prisma CLI directly (`yarn prisma`), but letting Redwood act as a proxy (`yarn redwood prisma`) saves you a lot of keystrokes.
> For example, Redwood adds the `--preview-feature` and `--schema=api/db/schema.prisma` flags automatically.
>
> If you want to know exactly what `yarn redwood prisma <command>` runs, which flags it's passing, etc., it's right at the top:
>
> ```sh{3}
> $ yarn redwood prisma migrate dev
> yarn run v1.22.10
> $ ~/redwood-app/node_modules/.bin/redwood prisma migrate dev
> Running prisma cli:
> yarn prisma migrate dev --schema "~/redwood-app/api/db/schema.prisma"
> ...
> ```

Since `yarn redwood prisma` is just an entry point into all the database commands that the Prisma CLI has to offer, we won't try to provide an exhaustive reference of everything you can do with it here. Instead what we'll do is focus on some of the most common commands; those that you'll be running on a regular basis, and how they fit into Redwood's workflows.

For the complete list of commands, see the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference). It's the authority.

Along with the CLI reference, bookmark Prisma's [Migration Flows](https://www.prisma.io/docs/concepts/components/prisma-migrate/prisma-migrate-flows) doc&mdash;it'll prove to be an invaluable resource for understanding `yarn redwood prisma migrate`.

| Command             | Description                                                  |
| :------------------ | :----------------------------------------------------------- |
| `db <command>`      | Manage your database schema and lifecycle during development |
| `generate`          | Generate artifacts (e.g. Prisma Client)                      |
| `migrate <command>` | Update the database schema with migrations                   |

### db

Manage your database schema and lifecycle during development.

```
yarn redwood prisma db <command>
```

The `prisma db` namespace contains commands that operate directly against the database.

#### pull

Pull the schema from an existing database, updating the Prisma schema.

> 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#db-pull).

```
yarn redwood prisma db pull
```

This command, formerly `introspect`, connects to your database and adds Prisma models to your Prisma schema that reflect the current database schema.

> Warning: The command will Overwrite the current schema.prisma file with the new schema. Any manual changes or customization will be lost. Be sure to back up your current schema.prisma file before running introspect if it contains important modifications.

#### push

Push the state from your Prisma schema to your database.

> 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#db-push).

```
yarn redwood prisma db push
```

This is your go-to command for prototyping changes to your Prisma schema (`schema.prisma`).
Prior to to `yarn redwood prisma db push`, there wasn't a great way to try out changes to your Prisma schema without creating a migration.
This command fills the void by "pushing" your `schema.prisma` file to your database without creating a migration. You don't even have to run `yarn redwood prisma generate` afterward&mdash;it's all taken care of for you, making it ideal for iterative development.

#### seed

Seed your database.

> 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#db-seed-preview).

```
yarn redwood prisma db seed
```

This command seeds your database by running your project's `seed.js` file (in `api/db`). Note that having a great seed might not be all that important at the start, but as soon as you start collaborating with others, it becomes vital.

Prisma's got some great resources on this command. You can [code along with Ryan Chenkie](https://www.youtube.com/watch?v=2LwTUIqjbPo), and learn how libraries like [faker](https://www.npmjs.com/package/faker) can help you create a large, realistic database fast, especially in tandem with Prisma's [createMany](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#createmany-preview). And Prisma's got a great [seeding guide](https://www.prisma.io/docs/guides/prisma-guides/seed-database) that covers both the concepts and the nuts and bolts.

<!-- ### generate -->

<!-- Generate artifacts (e.g. Prisma Client). -->

<!-- > 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#generate). -->

<!-- ``` -->
<!-- yarn redwood prisma generate -->
<!-- ``` -->

### migrate

Update the database schema with migrations.

> 👉 Quick link to the [Prisma Concepts](https://www.prisma.io/docs/concepts/components/prisma-migrate).

```
yarn redwood prisma migrate <command>
```

As a database toolkit, Prisma strives to be as holistic as possible. Prisma Migrate lets you use Prisma schema to make changes to your database declaratively, all while keeping things deterministic and fully customizable by generating the migration steps in a simple, familiar format: SQL.

Since migrate generates plain SQL files, you can edit those SQL files before applying the migration using `yarn redwood prisma migrate --create-only`. This creates the migration based on the changes in the Prisma schema, but doesn't apply it, giving you the chance to go in and make any modifications you want. [Daniel Norman's tour of Prisma Migrate](https://www.youtube.com/watch?v=0LKhksstrfg) demonstrates this and more to great effect.

Prisma Migrate has separate commands for applying migrations based on whether you're in dev or in production. The Prisma [Migration flows](https://www.prisma.io/docs/concepts/components/prisma-migrate/prisma-migrate-flows) goes over the difference between these workflows in more detail.

#### dev

Create a migration from changes in Prisma schema, apply it to the database, trigger generators (e.g. Prisma Client).

> 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-dev).

```
yarn redwood prisma migrate dev
```

<!-- #### reset -->

<!-- Reset your database and apply all migrations, all data will be lost. -->

<!-- > 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-reset). -->

<!-- ``` -->
<!-- yarn redwood prisma migrate reset -->
<!-- ``` -->

#### deploy

Apply pending migrations to update the database schema in production/staging.

> 👉 Quick link to the [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-deploy).

```
yarn redwood prisma migrate deploy
```

## redwood-tools (alias rwt)

Redwood's companion CLI development tool. You'll be using this if you're contributing to Redwood. See [Contributing](https://github.com/redwoodjs/redwood/blob/main/CONTRIBUTING.md#cli-reference-redwood-tools) in the Redwood repo.

## setup

Initialize project config and install packages

```
yarn redwood setup <command>
```

<br/>

| Commands           | Description                                                                               |
| :----------------- | :---------------------------------------------------------------------------------------- |
| `auth`             | Setup auth configuration for a provider                                                   |
| `custom-web-index` | Setup an `index.js` file, so you can customize how Redwood web is mounted in your browser |
| `deploy`           | Setup a deployment configuration for a provider                                           |
| `i18n`             | Setup i18n                                                                                |
| `tailwind`         | Setup tailwindcss and PostCSS                                                             |
| `webpack`          | Setup webpack config file in your project so you can add custom config                    |

### setup auth

Setup an auth configuration.

```
yarn redwood setup auth <provider>
```

You can get authentication out-of-the-box with generators. Right now we support Auth0, Firebase, GoTrue, Magic, and Netlify.

| Arguments & Options | Description                                                                                      |
| :------------------ | :----------------------------------------------------------------------------------------------- |
| `provider`          | Auth provider to configure. Choices are `auth0`, `firebase`, `goTrue`, `magicLink` and `netlify` |
| `--force, -f`       | Overwrite existing files                                                                         |

**Usage**

See [Authentication](https://redwoodjs.com/docs/authentication).

### setup custom-web-index

Setup an `index.js` file in `web/src` so you can customize how your Redwood App mounts to the DOM.

```
yarn redwood setup custom-web-index
```

Redwood automatically mounts your `<App />` to the DOM, but if you want to customize how that happens, you can use this setup command to generate a file where you can do that in.

| Arguments & Options | Description              |
| :------------------ | :----------------------- |
| `--force, -f`       | Overwrite existing files |

**Usage**

See [Custom Web Index](https://redwoodjs.com/docs/custom-web-index).

### setup deploy (config)

Setup a deployment configuration.

```
yarn redwood setup deploy <provider>
```

Creates provider-specific code and configuration for deployment.

| Arguments & Options | Description                                                                        |
| :------------------ | :--------------------------------------------------------------------------------- |
| `provider`          | Deploy provider to configure. Choices are `netlify`, `vercel`, or `aws-serverless` |
| `--force, -f`       | Overwrite existing configuration [default: false]                                  |

## storybook

Starts Storybook locally

```terminal
yarn redwood storybook
```

<br/>

[Storybook](https://storybook.js.org/docs/react/get-started/introduction) is a tool for UI development that allows you to develop your components in isolation, away from all the conflated cruft of your real app.

> "Props in, views out! Make it simple to reason about."

RedwoodJS supports Storybook by creating stories when generating cells, components, layouts and pages. You can then use these to describe how to render that UI component with representative data.

| Arguments & Options | Description                                       |
| :------------------ | :------------------------------------------------ |
| `--open`            | Open Storybook in your browser on start           |
| `--build`           | Build Storybook                                   |
| `--port`            | Which port to run Storybook on (defaults to 7910) |

## test

Run Jest tests for api and web.

```terminal
yarn redwood test [side..]
```

<br/>

| Arguments & Options | Description                                                                                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`              | Which side(s) to test. Choices are `api, web`. Defaults to "watch mode"                                                                                        |
| `--help`            | Show help                                                                                                                                                      |
| `--version`         | Show version number                                                                                                                                            |
| `--watch`           | Run tests related to changed files based on hg/git (uncommitted files). Specify the name or path to a file to focus on a specific set of tests [default: true] |
| `--watchAll`        | Run all tests                                                                                                                                                  |
| `--collectCoverage` | Show test coverage summary and output info to `coverage` directory in project root. See this directory for an .html coverage report                            |
| `--clearCache`      | Delete the Jest cache directory and exit without running tests                                                                                                 |

## serve
Run server for api in production, if you are self-hosting, or deploying into a serverfull environment.

```terminal
yarn redwood serve [side]
```

<br>

| Arguments & Options | Description                                                                                                           |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------- |
| `side`              | Which side(s) to run. Currently only supports `api`. Defaults to "api"                                                |
| `--port`            | What port should the server run on [default: 8911]                                                                    |
| `--socket`          | The socket the server should run. This takes precedence over port                                                     |
| `--rootPath`        | The root path your api functions are served from i.e. localhost:`{port}`/`{rootPath}`/`{functionName}` [default: "/"] |



<br>

## upgrade

Upgrade all `@redwoodjs` packages via an interactive CLI.

```terminal
yarn redwood upgrade
```

This command does all the heavy-lifting of upgrading to a new release for you.

Besides upgrading to a new stable release, you can use this command to upgrade to either of our unstable releases, `canary` and `rc`, or you can upgrade to a specific release version.

A canary release is published to npm every time a PR is merged to the `main` branch, and when we're getting close to a new release, we publish release candidates.

| Option          | Description                                                                                                                                                                                                        |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dry-run, -d` | Check for outdated packages without upgrading                                                                                                                                                                      |
| `--tag, -t`     | Choices are "canary", "rc", or a specific version (e.g. "0.19.3"). WARNING: Unstable releases in the case of "canary" and "rc", which will force upgrade packages to the most recent release of the specified tag. |
| `--pr`          | Installs packages for the given PR                                                                                                                                                                                 |

**Example**

Upgrade to the most recent canary:

```terminal
yarn redwood upgrade -t canary
```

Upgrade to a specific version:

```terminal
yarn redwood upgrade -t 0.19.3
```

Upgrade using packages from PR #1714 (version tag provided in PR comments):

```terminal
yarn redwood upgrade --pr 1714:0.24.0-38ba18c
```
