# Command Line Interface

The following is a comprehensive reference of the Redwood CLI. You can get a glimpse of all the commands by scrolling the aside to the right.

The Redwood CLI has two entry-point commands:

1. **redwood** (alias `rw`), which is for developing an application, and
2. **redwood-tools** (alias `rwt`), which is for contributing to the framework.

This document covers the `redwood` command . For `redwood-tools`, see [Contributing](https://github.com/redwoodjs/redwood/blob/main/CONTRIBUTING.md#cli-reference-redwood-tools) in the Redwood repo.

**A Quick Note on Syntax**

We use [yargs](http://yargs.js.org/) and borrow its syntax here:

```
yarn rw g page <name> [path] --option
```

</br>

- `rw g page` is the command.
- `<name>` and `[path]` are positional arguments.
  - `<>` denotes a required argument.
  - `[]` denotes an optional argument.
- `--option` is an option.

Every argument and option has a type. Here `<name>` and `[path]` are strings and `--option` is a boolean.

You'll also sometimes see arguments with trailing `..` like:

```
yarn rw build [side..]
```

The `..` operator indicates that the argument accepts an array of values. See [Variadic Positional Arguments](https://github.com/yargs/yargs/blob/main/docs/advanced.md#variadic-positional-arguments).

## build

Build for production.

```terminal
yarn rw build [side..]
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

Running `yarn rw build` without any arguments generates the Prisma client and builds both sides of your project:

```terminal
~/redwood-app$ yarn rw build
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw build
  ✔ Generating the Prisma client...
  ✔ Building "api"...
  ✔ Building "web"...
Done in 17.37s.
```

Files are output to each side's `dist` directory:

```plaintext{2,6}
├── api
│   ├── dist
│   ├── prisma
│   └── src
└── web
    ├── dist
    ├── public
    └── src
```

## dataMigrate

Data migration tools.

```
yarn rw dataMigrate <command>
```

<br/>

| Command   | Description                                                                                     |
| :-------- | :---------------------------------------------------------------------------------------------- |
| `install` | Appends `DataMigration` model to `schema.prisma`, creates `api/prisma/dataMigrations` directory |
| `up`      | Executes oustanding data migrations                                                             |

### install

- Appends a `DataMigration` model to `schema.prisma` for tracking which data migrations have already run.
- Creates a DB migration using `yarn rw db save 'create data migrations`.
- Creates `api/prisma/dataMigrations` directory to contain data migration scripts

```terminal
yarn rw dataMigrate install
```

### up

Executes outstanding data migrations against the database. Compares the list of files in `api/prisma/dataMigrations` to the records in the `DataMigration` table in the database and executes any files not present.

If an error occurs during script execution, any remaining scripts are skipped and console output will let you know the error and how many subsequent scripts were skipped.

```terminal
yarn rw dataMigrate up
```

## db

Database tools.

```
yarn rw db <command>
```

<br/>

| Command            | Description                                                                                               |
| :----------------- | :-------------------------------------------------------------------------------------------------------- |
| `down [decrement]` | Migrate your database down                                                                                |
| `generate`         | Generate the Prisma client                                                                                |
| `introspect`       | Introspect your database and generate models in `./api/prisma/schema.prisma`, overwriting existing models |
| `save [name..]`    | Create a new migration                                                                                    |
| `seed`             | Seed your database with test data                                                                         |
| `studio`           | Start Prisma Studio                                                                                       |
| `up [increment]`   | Generate the Prisma client and apply migrations                                                           |

### down

Migrate your database down.

> **WARNING:** Prisma's migration functionality is currently experimental.

```terminal
yarn rw db down [decrement]
```

<br/>

| Argument    | Description                                              |
| :---------- | :------------------------------------------------------- |
| `decrement` | Number of backwards migrations to apply. Defaults to `1` |

**Example**

Given the following migrations,

```plaintext{2,4}
api/prisma/migrations/
├── 20200518160457-create-users  <-- desired
├── 20200518160621-add-profiles
├── 20200518160811-add-posts     <-- current
└── migrate.lock
```

we could get to `20200518160457-create-users` by running:

```terminal
~/redwood-app$ yarn rw db down 2
```

### generate

Generate the Prisma client.

```terminal
yarn rw db generate
```

The Prisma client is auto-generated and tailored to your `schema.prisma`.
This means that `yarn rw db generate` needs to be run after every change to your `schema.prisma` for your Prisma client to be up to date. But you usually won't have to do this manually as other Redwood commands run this behind the scenes.

### introspect

Introspect your database and generate models in `./api/prisma/schema.prisma`, overwriting existing models.

```terminal
yarn rw db introspect
```

### save

Create a new migration.

> **WARNING:** Prisma's migration functionality is currently experimental.

```terminal
yarn rw db save [name..]
```

A migration defines the steps necessary to update your current schema.

| Argument | Description           |
| :------- | :-------------------- |
| `name`   | Name of the migration |

Running `yarn rw db save` generates the following directories and files as necessary:

```terminal
api/prisma/migrations
├── 20200516162516-create-users
│   ├── README.md
│   ├── schema.prisma
│   └── steps.json
└── migrate.lock
```

<br/>

- `migrations`: A directory to store migrations.
- `migrations/<migration>`: A directory for a specific migration. The name (`<migration>`) is composed of a timestamp of when it was created and the name given during `yarn rw db save`.
- `migrations/<migration>/README.md`: A human-readable description of the migration, including metadata like when the migration was created and by who, a list of the actual migration changes, and a diff of the changes made to `schema.prisma`.
- `migrations/<migration>/schema.prisma`: The schema that will be created if the migration is applied.
- `migrations/<migration>/steps.json`: An alternate representation of the migration steps that will be applied.
- `migrate.lock`: A lock file specifying the current migration.

### seed

Seed your database with test data.

```terminal
yarn rw db seed
```

Runs `seed.js` in `./api/prisma`. `seed.js` instantiates the Prisma client and provides an async main function where you can put any seed data&mdash;data that needs to exist for your app to run. See the [example blog's seed.js file](https://github.com/redwoodjs/example-blog/blob/master/api/prisma/seeds.js).

### studio

Start <a href="https://github.com/prisma/studio">Prisma Studio</a>, a visual editor for your database.

> **WARNING:** Prisma Studio is currently experimental.

```terminal
yarn rw db studio
```

### up

Generate the Prisma client and apply migrations.

> **WARNING:** Prisma's migration functionality is currently experimental.

```terminal
yarn rw db up [increment]
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
api/prisma/migrations/
├── 20200518160457-create-users  <-- current
├── 20200518160621-add-profiles
├── 20200518160811-add-posts     <-- desired
└── migrate.lock
```

we could get to `20200518160811-add-posts` by running:

```terminal
~/redwood-app$ yarn rw db up 2
```

## dev

Start development servers for api and web.

```terminal
yarn redwood dev [side..]
```

`yarn rw dev api` starts the Redwood dev server and `yarn rw dev web` starts the Webpack dev server with Redwood's config.

| Argument           | Description                                                                                                                          |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `side`             | Which dev server(s) to start. Choices are `api` and `web`. Defaults to `api` and `web`                                               |
| `--forward, --fwd` | String of one or more [Webpack DevServer](https://webpack.js.org/configuration/dev-server/) config options. See example usage below. |

**Usage**

If you're only working on your sdl and services, you can run just the api server to get GraphiQL on port 8911:

```plaintext{10}
~/redwood-app$ yarn rw dev api
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw dev api
$ /redwood-app/node_modules/.bin/dev-server
15:04:51 api | Listening on http://localhost:8911
15:04:51 api | Watching /home/dominic/projects/redwood/redwood-app/api
15:04:51 api |
15:04:51 api | Now serving
15:04:51 api |
15:04:51 api | ► http://localhost:8911/graphql/
```

Using `--forward` (alias `--fwd`), you can pass one or more Webpack DevServer config options. The following will run the dev server, set the port to `1234`, and disable automatic browser opening.

```plaintext{10}
~/redwood-app$ yarn rw dev --fwd="--port=1234 --open=false"
```

## destroy (alias d)

Rollback changes made by the generate command.

```
yarn rw d <type>
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

## diagnostics

Get structural diagnostics for a Redwood project (experimental).

```
yarn rw diagnostics
```

**Example**

```terminal
~/redwood-app$ yarn rw diagnostics
yarn run v1.22.4
web/src/Routes.js:14:5: error: You must specify a 'notfound' page
web/src/Routes.js:14:19: error: Duplicate Path
web/src/Routes.js:15:19: error: Duplicate Path
web/src/Routes.js:17:40: error: Page component not found
web/src/Routes.js:17:19: error (INVALID_ROUTE_PATH_SYNTAX): Error: Route path contains duplicate parameter: "/{id}/{id}"
```

## generate (alias g)

Save time by generating boilerplate code.

```
yarn rw g <type>
```

Some generators require that their argument be a model in your `schema.prisma`. When they do, their argument is named `<model>`.

| Command                | Description                                                                                           |
| :--------------------- | :---------------------------------------------------------------------------------------------------- |
| `auth <provider>`      | Generate an auth configuration                                                                        |
| `cell <name>`          | Generate a cell component                                                                             |
| `component <name>`     | Generate a component component                                                                        |
| `dataMigration <name>` | Generate a data migration component                                                                   |
| `function <name>`      | Generate a Function                                                                                   |
| `layout <name>`        | Generate a layout component                                                                           |
| `page <name> [path]`   | Generate a page component                                                                             |
| `scaffold <model>`     | Generate Pages, SDL, and Services files based on a given DB schema Model. Also accepts `<path/model>` |
| `sdl <model>`          | Generate a GraphQL schema and service object                                                          |
| `service <name>`       | Generate a service component                                                                          |

**Undoing a Generator with a Destroyer**

Most generate commands (i.e., everything but `yarn rw g auth` and `yarn rw g dataMigration`) can be undone by their corresponding destroy command. For example, `yarn rw g cell` can be undone with `yarn rw d cell`.

### auth

Generate an auth configuration.

```
yarn rw g auth <provider>
```

You can get authentication out-of-the-box with generators. Right now we support Auth0, Firebase, GoTrue, Magic, and Netlify.

| Arguments & Options | Description                                                                                      |
| :------------------ | :----------------------------------------------------------------------------------------------- |
| `provider`          | Auth provider to configure. Choices are `auth0`, `firebase`, `goTrue`, `magicLink` and `netlify` |
| `--force, -f`       | Overwrite existing files                                                                         |

**Usage**

See [Authentication](https://redwoodjs.com/docs/authentication).

### cell

Generate a cell component.

```terminal
yarn rw g cell <name>
```

Cells are signature to Redwood. We think they provide a simpler and more declarative approach to data fetching.

| Arguments & Options  | Description               |
| :------------------- | :------------------------ |
| `name`               | Name of the cell          |
| `--force, -f`        | Overwrite existing files  |
| `--javascript, --js` | Generate JavaScript files |
| `--typescript, --ts` | Generate TypeScript files |

**Usage**

See the [Cells](https://redwoodjs.com/tutorial/cells) section of the Tutorial.

**Destroying**

```
yarn rw d cell <name>
```

**Example**

Generating a user cell:

```terminal
~/redwood-app$ yarn rw g cell user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g cell user
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
yarn rw g component <name>
```

Redwood loves function components and makes extensive use of React Hooks, which are only enabled in function components.

| Arguments & Options  | Description               |
| :------------------- | :------------------------ |
| `name`               | Name of the component     |
| `--force, -f`        | Overwrite existing files  |
| `--javascript, --js` | Generate JavaScript files |
| `--typescript, --ts` | Generate TypeScript files |

**Destroying**

```
yarn rw d component <name>
```

**Example**

Generating a user component:

```terminal
~/redwood-app$ yarn rw g component user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g component user
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
yarn rw g dataMigration <name>
```

Creates a data migration script in `api/prisma/dataMigrations`.

| Arguments & Options | Description                                                              |
| :------------------ | :----------------------------------------------------------------------- |
| `name`              | Name of the data migration, prefixed with a timestamp at generation time |

**Usage**

See the [Data Migration](/docs/data-migrations) docs.

### function

Generate a Function.

```
yarn rw g function <name>
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
yarn rw d function <name>
```

**Example**

Generating a user function:

```terminal
~/redwood-app$ yarn rw g function user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g function user
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

Now if we run `yarn rw dev api`:

```plaintext{11}
~/redwood-app$ yarn rw dev api
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw dev api
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
yarn rw g layout <name>
```

Layouts wrap pages and help you stay DRY.

| Arguments & Options  | Description               |
| :------------------- | :------------------------ |
| `name`               | Name of the layout        |
| `--force, -f`        | Overwrite existing files  |
| `--javascript, --js` | Generate JavaScript files |
| `--typescript, --ts` | Generate TypeScript files |

**Usage**

See the [Layouts](https://redwoodjs.com/tutorial/layouts) section of the tutorial.

**Destroying**

```
yarn rw d layout <name>
```

**Example**

Generating a user layout:

```terminal
~/redwood-app$ yarn rw g layout user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g layout user
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
yarn rw g page <name> [path]
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

**Destroying**

```
yarn rw d page <name> [path]
```

**Examples**

Generating a home page:

```plaintext
~/redwood-app$ yarn rw g page home /
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g page home /
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
~/redwood-app$ yarn rw g page quote {id}
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g page quote {id}
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
yarn rw g scaffold <model>
```

A scaffold quickly creates a CRUD for a model by generating the following files and corresponding routes:

- sdl
- service
- layout
- pages
- cells
- components

The content of the generated components is different from what you'd get by running them individually.

| Arguments & Options  | Description                                                                                                                                                    |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | Model to scaffold. You can also use `<path/model>` to nest files by type at the given path directory (or directories). For example, `rw g scaffold admin/post` |
| `--force, -f`        | Overwrite existing files                                                                                                                                       |
| `--javascript, --js` | Generate JavaScript files                                                                                                                                      |
| `--typescript, --ts` | Generate TypeScript files                                                                                                                                      |

**Usage**

See [Creating a Post Editor](https://redwoodjs.com/tutorial/getting-dynamic#creating-a-post-editor).

You can namespace your scaffolds by providing `<path/model>`. The layout, pages, cells, and components will be nested in newly created dir(s). For example, given a model user, running `yarn rw g scaffold admin/user` will nest the layouts, pages, and components in a newly created `admin` directory:

```plaintext{9-20}
~/redwood-app$ yarn rw g scaffold admin/user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g scaffold admin/user
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
yarn rw d scaffold <model>
```

### sdl

Generate a GraphQL schema and service object.

```terminal
yarn rw g sdl <model>
```

The sdl will inspect your `schema.prisma` and will do its best with relations. Schema to generators isn't one-to-one yet (and might never be).

<!-- See limited genreator support for relations
https://community.redwoodjs.com/t/prisma-beta-2-and-rwjs-limited-generator-support-for-relations-with-workarounds/361 -->

| Arguments & Options  | Description                   |
| :------------------- | :---------------------------- |
| `model`              | Model to generate the sdl for |
| `--crud`             | Also generate mutations       |
| `--force, -f`        | Overwrite existing files      |
| `--javascript, --js` | Generate JavaScript files     |
| `--typescript, --ts` | Generate TypeScript files     |

**Destroying**

```
yarn rw d sdl <model>
```

**Example**

Generating a user sdl:

```terminal
~/redwood-app$ yarn rw g sdl user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g sdl user
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
    db.user.findOne({ where: { id: root.id } }).profile(),
  }
}
```

### service

Generate a service component.

```terminal
yarn rw g service <name>
```

Services are where Redwood puts its business logic. They can be used by your GraphQL API or any other place in your backend code. See [How Redwood Works with Data](https://redwoodjs.com/tutorial/side-quest-how-redwood-works-with-data).

| Arguments & Options  | Description               |
| :------------------- | :------------------------ |
| `name`               | Name of the service       |
| `--force, -f`        | Overwrite existing files  |
| `--javascript, --js` | Generate JavaScript files |
| `--typescript, --ts` | Generate TypeScript files |

**Destroying**

```
yarn rw d service <name>
```

**Example**

Generating a user service:

```terminal
~/redwood-app$ yarn rw g service user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g service user
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

## info

Print your system environment information.

```terminal
yarn rw info
```

This command's primarily intended for getting information others might need to know to help you debug:

```terminal
~/redwood-app$ yarn rw info
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw info

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
yarn rw lint
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
yarn rw open
```

## redwood-tools (alias rwt)

Redwood's companion CLI development tool. You'll be using this if you're contributing to Redwood. See [Contributing](https://github.com/redwoodjs/redwood/blob/main/CONTRIBUTING.md#cli-reference-redwood-tools) in the Redwood repo.

## test

Run Jest tests for api and web.

```terminal
yarn rw test [side..]
```

<br/>

| Arguments & Options | Description                                                                                                                                    |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`              | Which side(s) to test. Choices are `api, web`. Defaults to "watch mode"                                                                        |
| `--help`            | Show help                                                                                                                                      |
| `--version`         | Show version number                                                                                                                            |
| `--watch`           | Run tests related to changed files based on hg/git (uncommitted files). Specify the name or path to a file to focus on a specific set of tests |
| `--watchAll`        | Run all tests                                                                                                                                  |
| `--collectCoverage` | Show test coverage summary and output info to `coverage` directory in project root. See this directory for an .html coverage report            |
| `--clearCache`      | Delete the Jest cache directory and exit without running tests                                                                                 |

## upgrade

Upgrade all `@redwoodjs` packages via an interactive CLI.

```terminal
yarn rw upgrade
```

This command does all the heavy-lifting of upgrading to a new release for you.

Besides upgrading to a new release, you can use this command to upgrade to either of our unstable releases: `canary` and `rc`. A canary release is published to npm every time a branch is merged to master, and when we're getting close to a new release, we publish release candidates.

| Option          | Description                                                                                                                         |
| :-------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `--dry-run, -d` | Check for outdated packages without upgrading                                                                                       |
| `--tag, -t`     | WARNING: Unstable releases! Force upgrades packages to the most recent version for the given `--tag`. Choices are `canary` and `rc` |
