# Project Configuration: Dev, Test, Build

## Babel

Redwood comes with babel configured out of the box so that you can write modern JavaScript and TypeScript without needing to worry about transpilation at all.
GraphQL tags, JSX, SVG imports—all of it's handled for you.

For those well-versed in babel config, you can find Redwood's in [@redwoodjs/internal](https://github.com/redwoodjs/redwood/tree/main/packages/internal/src/build/babel).

### Configuring Babel

For most projects, you won't need to configure babel at all, but if you need to you can configure each side (web, api) individually using side-specific `babel.config.js` files.

> **Heads up**
>
> `.babelrc{.js}` files are ignored.
> You have to put your custom config in the appropriate side's `babel.config.js`: `web/babel.config.js` for web and `api/babel.config.js` for api.

Let's go over an example.

#### Example: Adding Emotion

Let's say we want to add the styling library [emotion](https://emotion.sh), which requires adding a babel plugin.

1. Create a `babel.config.js` file in `web`:
```shell
touch web/babel.config.js
```
<br />

2. Add the `@emotion/babel-plugin` as a dependency:
```shell
yarn workspace web add --dev @emotion/babel-plugin
```
<br />

3. Add the plugin to `web/babel.config.js`:
```js
// web/babel.config.js

module.exports = {
  plugins: ["@emotion"] // 👈 add the emotion plugin
}

// ℹ️ Notice how we don't need the `extends` property
```

That's it!
Now your custom web-side babel config will be merged with Redwood's.

---

## Jest

Redwood uses Jest underhood for testing on both the web and api sides.

Let's take a peek at how they're configured.

At the root of your project, is `jest.config.js` . It should look like this:

```js
module.exports = {
  rootDir: '.',
  projects: ['<rootDir>/{*,!(node_modules)/**/}/jest.config.js'],
}
```

This just tells just that the actual configs sit in each individual side, in the `./web` and `./api` folders, allows just to pick up the individual settings for each side.

The `rootDir` also makes sure that if you're running jest with the `--collectCoverage` flag, it will produce the report in your root folder.

#### Web Jest Config
THe web side's configuration sites in `./web/jest.config.js`

```js
const config = {
  rootDir: '../',
  preset: '@redwoodjs/testing/config/jest/web',
  // ☝️ load the built-in Redwood Jest configuartion
}

module.exports = config
```
The latest configuration for redwood can always be seen within our project templates here: [Web jest config template](https://github.com/redwoodjs/redwood/blob/main/packages/create-redwood-app/template/web/jest.config.js)

The preset includes all settings required to handle testing with React & JSX, dealing with your cell mocks automatically, as well as babel transforms.

More details of this preset can be seen in the source here: [Jest Web Preset](https://github.com/redwoodjs/redwood/blob/main/packages/testing/config/jest/web/jest-preset.js)


#### Api Side Config
The Api side is also configured similarly, with the configuration sitting in `./api/jest.config.js`

The Api preset is slightly different in that:

**a)** It is configured to run tests serially (because scearios actually seed your test database)
**b)** Has setup code to make sure your database is reset in between scenarios, and seeds your scenarios before running the test

More details of this preset can be seen in the source here: [Jest Api Preset](https://github.com/redwoodjs/redwood/blob/main/packages/testing/config/jest/api/jest-preset.js)


## GraphQL Codegen
Redwood uses [GraphQL Code Generator](https://www.graphql-code-generator.com) under the hood for generating types for your GraphQL queries and mutations.

While the defaults are configured to JustWork™️ out of the box with Redwood generators, you can choose to customise them by adding a `./codegen.yml` file too the root of your project. Your custom settings will be merged with the built-in ones

Here's an example where all the generated types are transformmed to UPPERCASE

```yml
# ./codegen.yml at the root of your project
config:
  namingConvention:
    typeNames: change-case-all#upperCase
```

All the available options for this can be found on [graphql code generator site](https://www.graphql-code-generator.com/docs/config-reference/config-field)

If you're curious about the built-in configurations, they can be found in [this file](https://github.com/redwoodjs/redwood/blob/main/packages/internal/src/generate/typeDefinitions.ts) in the Redwood source. Look for the `generateTypeDefGraphQLWeb` and `generateTypeDefGraphQLApi` functions
