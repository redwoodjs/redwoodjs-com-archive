# App Configuration: redwood.toml

You can configure your Redwood app's settings in `redwood.toml`. By default, `redwood.toml` lists the following configuration options:

<!-- TODO -->
<!-- toml syntax coloring not working here -->
```toml
[web]
  port = 8910
  apiProxyPath = "/.netlify/functions"
[api]
  port = 8911
[browser]
  open = true
```

These are listed by default because they're the ones that you're most likely to configure. But there are plenty more available. The rest are spread between Redwood's [webpack configuration files](https://github.com/redwoodjs/redwood/tree/main/packages/core/config) and `@redwoodjs/internal`'s [config.ts](https://github.com/redwoodjs/redwood/blob/main/packages/internal/src/config.ts#L42-L60):

```javascript
// redwood/packages/internal/src/config.ts

const DEFAULT_CONFIG: Config = {
  web: {
    host: 'localhost',
    port: 8910,
    path: './web',
    target: TargetEnum.BROWSER,
    apiProxyPath: '/.netlify/functions',
  },
  api: {
    host: 'localhost',
    port: 8911,
    path: './api',
    target: TargetEnum.NODE,
  },
  browser: {
    open: true,
  },
}
```

The options and their structure are based on Redwood's notion of sides and targets. Right now, Redwood has two fixed sides, api and web, that target NodeJS Lambdas and Browsers respectively. In the future, we'll add support for more sides and targets, like Electron and React Native (you can already see them listed as enums in [TargetEnum](https://github.com/redwoodjs/redwood/blob/d51ade08118c17459cebcdb496197ea52485364a/packages/internal/src/config.ts#L11-L12)), and as we do, you'll see them reflected in `redwood.toml`. But right now, you'll most likely never touch options like `target`.

The idea is that, in the future, changes here will have cascading, "app-level" effects. Using generators as an example, based on your side and target, the generators will behave differently, but appropriately different.

> For the difference between a side and a target, see [Redwood File Structure](https://redwoodjs.com/tutorial/redwood-file-structure).

You can think of `redwood.toml` as a convenience layer over Redwood's webpack configuration files. That is, for certain settings, instead of having to deal with webpack directly, we give you quick access via `redwood.toml`. Some of these settings are for development, some are for production, and some are for both. You can actually see this reflected in which webpack file each configuraiton option is referenced in&mdash;[webpack.development.js](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/webpack.development.js), [webpack.production.js](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/webpack.production.js), and [webpack.common.js](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/webpack.common.js).

<!-- https://github.com/redwoodjs/redwood/pull/152#issuecomment-593835518 -->
`redwood.toml` also serves a slightly larger purpose: it's used to determine the base directory of a Redwood project. So this file is what really makes a Redwood app a Redwood app. If you remove it and run `yarn rw dev`, you'll get an error:

```terminal
Error: Could not find a "redwood.toml" file, are you sure you're in a Redwood project?
```

(So don't do that!)

## [web]

Configuration for the web side.

| Key                           | Description                        | Default                 | Context       |
| :---------------------------- | :--------------------------------- | :---------------------- | :------------ |
| `host`                        | Hostname to listen on              | `'localhost'`           | `development` |
| `port`                        | Port to listen on                  | `8910`                  | `development` |
| `path`                        | Path to the web side               | `'./web'`               | `both`        |
| `target`                      | Target for the web side            | `TargetEnum.BROWSER`    | `both`        |
| `apiProxyPath`                | Proxy path to the api side         | `'/.netlify/functions'` | `production`  |
| `includeEnvironmentVariables` | Environment variables to whitelist |                         | `both`        |

### apiProxyPath

```toml
[web]
  apiProxyPath = "/.netlify/functions"
```

The path to the serverless functions. When you're running your app locally, this gets aliased away (you can see exactly how in [webpack.common.js](https://github.com/redwoodjs/redwood/blob/49c3afecc210709641dd340b974c86251ed207dc/packages/core/config/webpack.development.js#L21-L28) (and here's the docs on Webpack's [devServer.proxy](https://webpack.js.org/configuration/dev-server/#devserverproxy), for good measure)).

Since Redwood plays nicely with Netlify, we use the [same proxy path](https://docs.netlify.com/functions/build-with-javascript) by default. If you're deploying elsewhere, you'll want to change this.

### includeEnvironmentVariables
<!-- https://github.com/redwoodjs/redwood/issues/427 -->
<!-- https://github.com/redwoodjs/redwood/blob/d51ade08118c17459cebcdb496197ea52485364a/packages/core/config/webpack.common.js#L17-L31 -->

```toml
[web]
  includeEnvironmentVariables = ['API_KEY']
```

Where `API_KEY` is defined in .env or .env.defaults:

```plaintext
API_KEY=...
```

`includeEnvironmentVariables` is the set of environment variables to whitelist for the web side. You can also prefix environment variables with `REDWOOD_ENV_` (see [Environment Variables](https://redwoodjs.com/docs/environment-variables#web)).

## [api]

Configuration for the api side.

| Key      | Description             | Default           | Context       |
| :------- | :---------------------- | :---------------- | :------------ |
| `host`   | Hostname to listen on   | `'localhost'`     | `development` |
| `port`   | Port to listen on       | `8911`            | `development` |
| `path`   | Path to the api side    | `'./api'`         | `both`        |
| `target` | Target for the api side | `TargetEnum.NODE` | `both`        |

## [browser]

Configuration for the browser target.

| Key    | Description                                                       | Default | Context       |
| :----- | :---------------------------------------------------------------- | :------ | :------------ |
| `open` | Open the browser to web's `host:port` after the dev server starts | `false` | `development` |

### open

```toml
[browser]
  open = true
```

Setting `open` to `true` like this will open the browser to web's `host:port` (by default, localhost:8910) after the dev server starts. If you want your browser to stop opening when you `yarn rw dev`, set this to false. Or just remove it entirely.

You can also provide the name of a browser to use instead of the system default. E.g., `open = 'Firefox'` will open Firefox regardless of which browser's the default on your system.

There's a lot more you can do here. For all the details, see Webpack's docs on [devServer.open](https://webpack.js.org/configuration/dev-server/#devserveropen).

## Running within a Container or VM

To run a Redwood app within a container or VM, you'll want to set both the web and api's `host` to `0.0.0.0` to allow network connections to and from the host:

```toml
[web]
  host = '0.0.0.0'
  ...
[api]
  host = '0.0.0.0'
  ...
```
