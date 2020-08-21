# Environment Variables

You can provide environment variables to each side of your Redwood app in different ways, depending on each Side's target, and whether you're in development or production.

> Right now, Redwood apps have two fixed Sides, API and Web, that have each have a single target, nodejs and browser respectively.

## Generally

Redwood apps use [dotenv](https://github.com/motdotla/dotenv) to load vars from your `.env` file into `process.env`.
For a reference on dotenv syntax, see the dotenv README's [Rules](https://github.com/motdotla/dotenv#rules) section.

> Technically, we use [dotenv-defaults](https://github.com/mrsteele/dotenv-defaults), which is how we also supply and load `.env.defaults`.
<!-- also in a Redwood app's base directory. -->

Redwood also configures Webpack with `dotenv-webpack`, so that all references to `process.env` vars on the Web side will be replaced with the variable's actual value at built-time. More on this in [Web](#Web).

## API

### Development

You can access environment variables defined in `.env` and `.env.defaults` as `process.env.VAR_NAME`. For example, if we define the environment variable `HELLO_ENV` in `.env`:

```
HELLO_ENV=hello world
```

and make a hello Function (`yarn rw g function hello`) and reference `HELLO_ENV` in the body of our response:

```javascript{6}
// ./api/src/functions/hello.js

export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: `${process.env.HELLO_ENV}`,
  }
}
```

Navigating to http://localhost:8911/hello shows that the Function successfully accesses the environment variable:

<!-- @todo -->
<!-- Get a better-quality pic -->
![rw-envVars-api](https://user-images.githubusercontent.com/32992335/86520528-47112100-bdfa-11ea-8d7e-1c0d502805b2.png)

### Production

<!-- @todo -->
<!-- Deployment system? platform? -->
Whichever platform you deploy to, they'll have some specific way of making environment variables available to the serverless environment where your Functions run. For example, if you deploy to Netlify, you set your environment variables in **Settings** > **Build & Deploy** > **Environment**. You'll just have to read your provider's documentation.

## Web

### Development

Like the API Side, anything defined in your `.env` and `.env.defaults` files is simply available:

```
HELLO_ENV=hello world
```

```javascript{8}
// web/src/pages/HomePage.js

const HomePage = () => {
  return (
    <div>
      <h1>HomePage</h1>
      <p>Find me in ./web/src/pages/HomePage/HomePage.js</p>
      <p>{process.env.HELLO_ENV}</p>
    </div>
  )
}

export default HomePage
```

![rw-envVars-web](https://user-images.githubusercontent.com/32992335/86520491-c0f4da80-bdf9-11ea-9212-c1d792d2ff5f.png)

But this only goes for development. In production, references like this will either err or fail silently, depending on where you reference your environment variables.

For another example of using environment variables in development, see [File Uploads](https://redwoodjs.com/cookbook/file-uploads).

### Production

In production, you can get environment variables to the Web Side either by

1. prefixing them with `REDWOOD_ENV_`
2. putting them in the `includeEnvironmentVariables` array in `redwood.toml`

Note that, just like for the API Side, you'll also have to set them up with your provider.

#### Prefixing with REDWOOD_ENV_

In `.env`, if you prefix your environment variables with `REDWOOD_ENV_`, they'll be available via `process.env.REDWOOD_ENV_MY_VAR_NAME`, and will be dynamically replaced at built-time.

This means that if you have an environment variable like `process.env.REDWOOD_ENV_SECRET_API_KEY` Redwood removes and replaces it with its *actual* value. So if someone inspects your site's source, they could see your `REDWOOD_ENV_SECRET_API_KEY` in plain text. This is a limitation of delivering static JS and HTML to the browser.

#### includeEnvironmentVariables in redwood.toml

Like the option above, these are also removed and replaced.

## Keeping Sensitive Information Safe

Since it usually contains sensitive information, you should [never commit your `.env` file](https://github.com/motdotla/dotenv#should-i-commit-my-env-file). Note that you'd actually have to go out of your way to do this as, by default, a Redwood app's `.gitignore` explicitly ignores `.env`:

```plaintext{2}
.DS_Store
.env
.netlify
dev.db
dist
dist-babel
node_modules
yarn-error.log
```

## Where Does Redwood Load My Environment Variables?

For all the variables in your `.env` and `.env.defaults` files to make their way to `process.env`, there has to be a call to `dotenv`'s `config` function somewhere. So where is it?

It's in [the CLI](https://github.com/redwoodjs/redwood/blob/main/packages/cli/src/index.js#L6-L12)&mdash;every time you run a `yarn rw` command:

```javascript
// packages/cli/src/index.js

import { config } from 'dotenv-defaults'


config({
  path: path.join(getPaths().base, '.env'),
  encoding: 'utf8',
  defaults: path.join(getPaths().base, '.env.defaults'),
})
```

## Seeding your Database

<!-- Source: https://github.com/motdotla/dotenv#should-i-have-multiple-env-files -->

You can provide an `.env` file just for seeding your database. A Redwood app's seed file (`api/prisma/seed.js`) is setup to load it into `process.env`:

```javascript{5-7}
// api/prisma/seed.js

/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

dotenv.config()
const db = new PrismaClient()

// ...

```

So `api/prisma` you make an `.env` file in `api/prisma` with environment variables:

```
SEEDING_MESSAGE=seeding the database...
...
```

In your seed file's `main` function (where all your seeding logic goes), you can access those environment variables on `process.env`:

```javascript{5}
async function main() {

  // seeding logic...

  console.log(process.env.SEEDING_MESSAGE)
}
```
