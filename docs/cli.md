# Command Line Interface 

The following is a comprehensive reference of the Redwood CLI. You can get a list of all the commands and/or find the one(s) you're interested in by scrolling the aside to the right.

The Redwood CLI has two entry-point commands:
1. **redwood** (alias rw), which is for developing an application, and
2. **redwood-tools** (alias rwt), which is for contributing to the framework.

This CLI document covers the `redwood` command options. For `redwood-tools` options, see the [Redwood Contributing guide's Reference section](https://github.com/redwoodjs/redwood/blob/master/CONTRIBUTING.md#cli-reference-redwood-tools).

**A Note on Syntax**

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

You will also sometimes see arguments with trailing `..` like:

```
yarn rw build [side..]
```

The `..` operator indicates that the argument accepts an array of values. Also see [Variadic Positional Arguments](https://github.com/yargs/yargs/blob/master/docs/advanced.md#variadic-positional-arguments).

## build
Build for production.

```terminal
yarn rw build [side..]
```

We use Babel to transpile the api side into `./api/dist` and Webpack to package the web side  into `./web/dist`.

> You can deploy your Redwood project without an API layer or database&mdash;see 
[Disable API/Database](https://redwoodjs.com/cookbook/disable-api-database).


<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">side</span></td>
      <td>Which side(s) to build. Choices are <span id="code">api</span> and <span id="code">web</span>. Default is <span id="code">api</span> and <span id="code">web</span>.</td>
    </tr>
  </tbody>
</table>

<br/>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--verbose, -v</span></td>
      <td>Print more information while building.</td>
    </tr>
    <tr>
      <td><span id="code">--stats</span></td>
      <td>
        Use <a href="https://github.com/webpack-contrib/webpack-bundle-analyzer" id="link">Webpack Bundle Analyzer </a> to visualize the size of Webpack output files via an interactive zoomable treemap.
      </td>
    </tr>
  </tbody>
</table>

**Usage**

See the [Builds](https://redwoodjs.com/guides/builds) guide.

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

## dev
Run development servers for db, api, and web.

```terminal
yarn redwood dev [side..]
```

`yarn rw dev api` starts the Redwood dev server (see [The Development Server](https://redwoodjs.com/guides/the-development-server.html#the-development-server)) and `yarn rw dev web` starts the Webpack dev server with Redwood's config.

Technically db isn't a "side" and doesn't start a "dev server". It's equivalent to running `yarn prisma generate --watch` in `./api`. 

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">side</span></td>
      <td>Which dev server(s) to start. Choices are <span id="code">db</span>, <span id="code">api</span>, and <span id="code">web</span>. Default is <span id="code">db</span>, <span id="code">api</span>, and <span id="code">web</span>.</td>
    </tr>
  </tbody>
</table>

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

## db

Entry point to database tools. 

```
yarn rw db <command>
```

Most of the following are Prisma commands:

<!-- Commands -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Command</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">down</span></td>
      <td>Migrate your database down.</td>
    </tr>
    <tr>
      <td><span id="code">generate</span></td>
      <td>Generate the Prisma client.</td>
    </tr>
    <tr>
      <td><span id="code">introspect</span></td>
      <td>Introspect your database and generate models in <span id="code">./api/prisma/schema.prisma</span>, overwriting existing models.</td>
    </tr>
    <tr>
      <td><span id="code">save</span></td>
      <td>Create a new migration.</td>
    </tr>
    <tr>
      <td><span id="code">seed</span></td>
      <td>Seed your database with test data.</td>
    </tr>
    <tr>
      <td><span id="code">up</span></td>
      <td>Generate the Prisma client and apply migrations.</td>
    </tr>
  </tbody>
</table>

## db down

Migrate your database down. Also see the [Prisma docs on migrate down](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#migrate-down).

> Prisma's migration functionality is currently in an experimental state.

```terminal
yarn rw db down [decrement|name|timestamp]
```

You can specify the state to migrate down to via one of three ways: 

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">decrement</span></td>
      <td>Go down by an amount. Default is <span id="code">1</span>.</td>
    </tr>
    <tr>
      <td><span id="code">name</span></td>
      <td>Go down to a migration by name.</td>
    </tr>
      <td><span id="code">timestamp</span></td>
      <td>Go down to a migration by timestamp.</td>
    </tr>
  </tbody>
</table>

**Example**

Given the following migrations,

```plaintext{2,4}
api/prisma/migrations/
├── 20200518160457-create-users  <-- desired
├── 20200518160621-add-profiles
├── 20200518160811-add-posts     <-- current
└── migrate.lock
```

we could get to `20200518160457-create-users` by running any of the following:

```terminal
~/redwood-app$ yarn rw db down 2
~/redwood-app$ yarn rw db down "create-users"
~/redwood-app$ yarn rw db down 20200518160457
```

## db generate

Generate the Prisma client. Also see the [Prisma docs on generate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#generate).

```terminal
yarn rw db generate
```

The Prisma client is auto-generated and tailored to your `schema.prisma`. 
This means that `yarn rw db generate` needs to be run after every change to your `schema.prisma` for your Prisma client to be up to date. But you usually won't have to do this manually as other Redwood commands run this behind the scene (e.g. `build`, `dev`).

## db introspect

Introspect your database and generate models in `./api/prisma/schema.prisma`, overwriting existing models. Also see the [Prisma docs on introspect](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#introspect).


```terminal
yarn rw db introspect
```

## db save

Create a new migration. Also see the [Prisma docs on migrate save](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#migrate-save).

> Prisma's migration functionality is currently in an experimental state.

```terminal
yarn rw db save
```

A migration defines the steps necessary to update your current schema. Running `yarn rw db save` generates the following directories and files as necessary:

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

## db seed

Seed your database with test data.

```terminal
yarn rw db seed
```

Runs `./api/prisma/seed.js` which instantiates the Prisma client and provides an async main function where you can put any seed data&mdash;data that needs to exist for your app to run. Also see the [example blog's seed.js file](https://github.com/redwoodjs/example-blog/blob/master/api/prisma/seeds.js).

## db up

Generate the Prisma client and apply migrations. Also see the [Prisma docs on migrate up](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli/command-reference#migrate-up).

> Prisma's migration functionality is currently in an experimental state.

```terminal
yarn rw db up [increment|name|timestamp]
```

You can specify the state to migrate up to via one of three ways:

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">increment</span></td>
      <td>Go up by an amount. Default is <span id="code">1</span>.</td>
    </tr>
    <tr>
      <td><span id="code">name</span></td>
      <td>Go up to a migration by name.</td>
    </tr>
      <td><span id="code">timestamp</span></td>
      <td>Go up to a migration by timestamp.</td>
    </tr>
  </tbody>
</table>

**Example**

Given the following migrations

```plaintext{2,4}
api/prisma/migrations/
├── 20200518160457-create-users  <-- current
├── 20200518160621-add-profiles
├── 20200518160811-add-posts     <-- desired
└── migrate.lock
```

we could get to `20200518160811-add-posts` by doing any of the following:

```terminal
~/redwood-app$ yarn rw db up 2
~/redwood-app$ yarn rw db up "add-posts"
~/redwood-app$ yarn rw db up 20200518160811
```

## generate (alias g)

Entry point to generators&mdash;save time by generating boilerplate code.

```
yarn rw g <command>
```

Some generators require that their argument be a model in your `schema.prisma`. When they do, their argument is named `<model>`.

<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/4">Command</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">auth</span></td>
      <td>Generate auth configuration.</td>
    </tr>
    <tr>
      <td><span id="code">cell &lt;name></span></td>
      <td>Generate a cell component.</td>
    </tr>
    <tr>
      <td><span id="code">component &lt;name&gt;</span></td>
      <td>Generate a component component.</td>
    </tr>
    <tr>
      <td><span id="code">function &lt;name&gt;</span></td>
      <td>Generate a Function.</td>
    </tr>
    <tr>
      <td><span id="code">layout &lt;name&gt;</span></td>
      <td>Generate a layout component.</td>
    </tr>
    <tr>
      <td><span id="code">page &lt;name&gt; [path]</span></td>
      <td>Generate a page component.</td>
    </tr>
    <tr>
      <td><span id="code">scaffold &lt;model&gt;</span></td>
      <td>Generate Pages, SDL, and Services files based on a given DB schema Model. Also accepts <span id="code">&lt;path/model&gt;</span>.</td>
    </tr>
    <tr>
      <td><span id="code">sdl &lt;model&gt;</span></td>
      <td>Generate a GraphQL schema and service object.</td>
    </tr>
    <tr>
      <td><span id="code">service &lt;name&gt;</span></td>
      <td>Generate a service component.</td>
    </tr>
  </tbody>
</table>

## generate auth

Generate auth configuration.

```
yarn rw g auth <provider>
```

You can get authentication out-of-the-box with generators. Right now we only support netlify and auth0, but we have a lot more in store.

> "Wait&mdash;generators configure things too?" Sometimes! This is an example of a generator doing a little more than just generating things.

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">provider</span></td>
      <td>Name of auth provider to configure. Choices are <span id="code">netlify</span> and <span id="code">auth0</span>.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Option -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Usage**

See the [Authentication](https://redwoodjs.com/guides/authentication) guide.

## generate cell

Generate a cell component.

```terminal
yarn rw g cell <name>
```

Cells are signature to Redwood. We think they provide a simpler and more declarative approach to data fetching. 

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">name</span></td>
      <td>Name of the generated cell.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Option -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Usage**

See the [Cells](https://redwoodjs.com/tutorial/cells) section of the tutorial.

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

## generate component

Generate a component component.

```terminal
yarn rw g component <name>
```

Redwood loves function components and makes extensive use of React Hooks which are only enabled in function components. 

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">name</span></td>
      <td>Name of the generated component.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

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

## generate function

Generate a Function. 

```
yarn rw g function <name>
```

Not to be confused with Javascript functions, Capital-F Functions are meant to be deployed to serverless endpoints like AWS Lambda.

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">name</span></td>
      <td>Name of the generated function.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Usage**

See the [Custom Function](https://redwoodjs.com/cookbook/custom-function) recipe.

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

## generate layout

Generate a layout component.

```terminal
yarn rw g layout <name>
```

Layouts wrap pages and help you stay DRY. 

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">name</span></td>
      <td>Name of the generated layout.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Usage**

See the [Layouts](https://redwoodjs.com/tutorial/layouts) section of the tutorial.

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

## generate page

Generates a page component and updates the routes.

```terminal
yarn rw g page <name> [path]
```

If `path` isn't specified, it will be the same as the name. This also updates `Routes.js` in `./web/src`.

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">name</span></td>
      <td>Name of the generated page.</td>
    </tr>
    <tr>
      <td><span id="code">path</span></td>
      <td>Path to the page. Default is <span id="code">name</span>.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Example**

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

## generate scaffold

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

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">model</span></td>
      <td>Model to scaffold. You can also use <span id="code">&lt;path/model&gt;</span> to nest files by type at the given path directory (or directories). For example, <span id="code">rw g scaffold admin/post</span>.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Usage**

See the [Creating a Post Editor](http://127.0.0.1:8080/tutorial/getting-dynamic.html#creating-a-post-editor) section of the tutorial.

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

## generate sdl

Generate a GraphQL schema and service object.

```terminal
yarn rw g sdl <model>
```

The sdl will inspect your `schema.prisma` and will do its best with relations. For 
The schema <-> generators isn't one to one yet,

See 
limited genreator support ofr relations 
https://community.redwoodjs.com/t/prisma-beta-2-and-rwjs-limited-generator-support-for-relations-with-workarounds/361

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">model</span></td>
      <td>Model to generate the sdl for.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

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

The generated sdl defines a corresponding type, query, and create/update inputs, without defining any mutations.

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

The services file fulfills the query: 

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

## generate service

Generate a service component.

```terminal
yarn rw g service <name>
```

Services are where Redwood puts its business logic. They can be used by your GraphQL API or any other place in your backend code. 

> Generated service filenames are always plural.

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">name</span></td>
      <td>Name of the generated service.</td>
    </tr>
  </tbody>
</table>

</br>

<!-- Options -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--force, -f</span></td>
      <td>Overwrite existing files.</td>
    </tr>
  </tbody>
</table>

**Usage**

See [How Redwood Works with Data](https://redwoodjs.com/tutorial/side-quest-how-redwood-works-with-data).

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

Prints your system environment information.

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

[Our ESLint configuration](https://github.com/redwoodjs/redwood/blob/master/packages/eslint-config/index.js) is a mixture between [ESLint's recommended rules](https://eslint.org/docs/rules/), [React's recommended rules](https://www.npmjs.com/package/eslint-plugin-react#list-of-supported-rules), and a bit of our own stylistic flair:

- no semicolons
- comma dangle when multiline
- single quotes
- always use parenthesis around arrow functions
- enforced import sorting

<br/>

<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--fix</span></td>
      <td>Apply suggested changes.</td>
    </tr>
  </tbody>
</table>

## open

Open your project in your browser.

```terminal
yarn rw open
```

## redwood-tools (alias rwt)

Redwood's companion CLI development tool. You'll be using this if you're contributing to the Redwood Framework. For information about using this command and available options, see the [Redwood Contributing guide's Reference section](https://github.com/redwoodjs/redwood/blob/master/CONTRIBUTING.md#Reference).

## test

Run Jest tests for api and web

> This command is a WIP. You can track its progress via issue [#521](https://github.com/redwoodjs/redwood/pull/521)and PR [#502](https://github.com/redwoodjs/redwood/issues/502).

```terminal
yarn rw test [side..]
```

<!-- You can find the config files in [@redwoodjs/core](https://github.com/redwoodjs/redwood/tree/master/packages/core). -->

<br/>

<!-- Arguments -->
<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Argument</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">side</span></td>
      <td>Which side(s) to test. Choices are <span id="code">api</span> and <span id="code">web</span>. Default is <span id="code">api</span> and <span id="code">web</span>.</td>
    </tr>
  </tbody>
</table>

## upgrade

Upgrade all `@redwoodjs` packages via an interactive CLI.

```terminal
yarn rw upgrade
```

A canary release is published to npm every time a branch is merged to master.

<table class="table-fixed w-full">
  <thead class="text-left">
    <tr>
      <th class="w-1/5">Option</th>
      <th class="w-auto">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span id="code">--dry-run, -d</span></td>
      <td>Check for outdated packages without upgrading.</td>
    </tr>
    <tr>
      <td><span id="code">--tag</span></td>
      <td>Which release to upgrade to. Choices are <span id="code">canary</span> and <span id="code">rc</span>.</td>
    </tr>
  </tbody>
</table>

> WARNING: using the `--tag` option will force upgrade you to an unstable release.