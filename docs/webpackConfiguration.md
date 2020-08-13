# Webpack Configuration

Redwood uses webpack. And with webpack, comes configuration.

One of Redwood's tenets is convention over configuration. So it's worth repeating that you don't have to do any of this. Take the golden path, and everything will work just fine.

But another of Redwood's tenets is to make the hard stuff possible. Whether Webpack configuration falls into the hard-stuff category or not is up for debate. But one thing we know for sure is it can be an epic time sink. We hope that documenting it well will make this process fast, easy, and maybe even enjoyable.

While configuring webpack, at some point, you may wonder what exactly our configuration is. The following section aims to explain that. But if you just want to configure webpack, jump to [Configuring Webpack](#configuring-webpack).

## Redwood's Webpack Configuration Files

You can find Redwood's webpack config files in `@redwoodjs/core`'s [config](https://github.com/redwoodjs/redwood/tree/master/packages/core/config) directory. Redwood has four webpack configs:

| File                                                                                                                   | Description                                                                                                                                                                        |
| :--------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [webpack.common.js](https://github.com/redwoodjs/redwood/blob/master/packages/core/config/webpack.common.js)           | Base config; merges with development, production, and user-defined configs                                                                                                         |
| [webpack.development.js](https://github.com/redwoodjs/redwood/blob/master/packages/core/config/webpack.development.js) | Config used when developing locally                                                                                                                                                |
| [webpack.production.js](https://github.com/redwoodjs/redwood/blob/master/packages/core/config/webpack.production.js)   | Config used when building for production                                                                                                                                           |
| [webpack.stat.js](https://github.com/redwoodjs/redwood/blob/master/packages/core/config/webpack.stats.js)              | Config used when `--stats` is provided to `yarn rw build`; merges the production config with [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) |

### webpack.common.js

This is the base config; it merges with the development and production configs, configures options commmon to both, and merges the user-defined config along the way.

This is where the bulk of the configuration happens. Since we distinguish between a development and production configs, we [do as the docs say](https://webpack.js.org/configuration/configuration-types/#exporting-a-function) and export a function. 

Here's a table of the plugins we use:

| Plugin                                                                                             | Description                                                                                |
| :------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/)                           | Simplifies the creation of HTML files to serve your webpack bundles                        |
| [DirectoryNamedWebpackPlugin](https://github.com/shaketbaby/directory-named-webpack-plugin#readme) | Makes it possible to control what file within directory will be treated as entry file      |
| [MiniCssExtractPlugin](https://webpack.js.org/plugins/mini-css-extract-plugin/)                    | Extracts CSS into separate files                                                           |
| [CopyWebpackPlugin](https://webpack.js.org/plugins/copy-webpack-plugin/)                           | Copies individual files or entire directories, which already exist, to the build directory |
| [DotenvPlugin](https://webpack.js.org/plugins/environment-plugin/#dotenvplugin)                    | Expose (a subset of) dotenv variables                                                      |

### webpack.development.js

This is the config used when developing locally. `yarn rw dev` starts [webpack-dev-server](https://webpack.js.org/guides/development/#using-webpack-dev-server) with this config.

With webpack dev server, files aren't written to disk, so you won't see anything in `dist`. Nor do we do any optimiztions.

The main thing to configure here is [devServer](https://webpack.js.org/configuration/dev-server/#devserveroverlay).
But you can already configure many of its options via `redwood.toml`&mdash;see [App Configureation: redwood.toml](https://redwoodjs.com/docs/app-configuration-redwood-toml).

### webpack.production.js

This is the config used when building for production (`yarn rw build`). There's not much here right now.

### webpack.stat.js

Redwood bundles with `webpack.stat.js` if you provide the `--stats` option to `yarn rw build`:

```
yarn rw build --stats
```

Note that this'll skip building the api side.

This config uses [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer). When it finishes it'll launch an interactive zoomable treemap in your browser to examine the contents of all your bundles.

### Supported Extensions and Loaders

When a file is imported, one of the following loaders will be run. They're executed in the following order:

1. `.md, .test.js, .stories.js`: null-loader
2. `.js, .jsx, .ts., .tsx`: babel
3. `.css, .scss, .module.css, .module.scss`: sass-loader, css-loader, style-loader. Sass requires `sass-loader` and `sass` to be installed.
4. `.png, .jpg, .gif`: url-loader
5. `.svg`: svg-react-loader
6. `*`: file-loader

<!-- Source: https://github.com/redwoodjs/redwood/pull/696 -->
Redwood's webpack configuration [comes with postcss-loader](https://github.com/bjackson/redwood/blob/419a4267d9e0634fc8693a6e1a03d25096c0096a/packages/core/config/webpack.common.js#L68-L79). It's ready to plug in your postcss-loader config, `./web/config/postcss.config.js`:

```javascript
// ./web/config/postcss.config.js

module.exports = {
    plugins: {
        'autoprefixer': {},
    }
}
```

## Configuring Webpack

You can configure webpack by adding a `./web/config/webpack.config.js` file to your app. Note that the `config` directory doesn't exist by default; you'll have to create it.

Two formats are supported:

1. Mutating the base config by exporting a function:

```javascript
module.exports = (config, { env }) => {
  if (env === 'development') {
    // Add dev plugin
  }

  config.module.rules.push({...})

  return config
}
```

<br/>

2. Merging the base config by exporting an object:

```javascript
module.exports = {
  module: {
    rules: [{...}]
  }
}
```

There's a couple reasons for using one format over the other.
You can only configure a speicifc environment (i.e. development, production) using the first format.
And as the [Changing the Title of the Page](#changing-the-title-of-the-page) example shows, you can also only modify existing rules using the first format.

If you're adding extras, the second format should work just fine.

## Examples

### Changing the Title of the Page

> It's actually easier to change this in ./web/index.html. But this still serves as a good example of how to configure webpack.

By default, the title of the page will be the same as your app's base directory. For example, if your app's base directory is `redwood-app`, you'll see "redwood-app":

![rw-wp-before](https://user-images.githubusercontent.com/32992335/83955148-b2b89c00-a804-11ea-92b5-55541f1b89aa.png)

This is set in [webpack.common.js](https://github.com/redwoodjs/redwood/blob/34dd1a91516e7756ac6f9247a5d89c3adcbfdc2f/packages/core/config/webpack.common.js#L90):

```javascript{4}
// redwood/packages/core/config/webpack.common.js

new HtmlWebpackPlugin({
  title: path.basename(redwoodPaths.base),
  template: path.resolve(redwoodPaths.base, 'web/src/index.html'),
  inject: true,
  chunks: 'all',
}),
```

To change this, in your `./web/config/webpack.config.js`, search `config`'s `plugins` array for `HtmlWebpackPlugin` and change it's `title` option. Note that, here, we're using the first format for configuring webpack, exporitng a function:

```javascript{6}
// ./web/config/webpack.config.js

module.exports = (config, { env }) => {
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.title = 'Some Custom Title'
    }
  })

  return config
}
```

Now, back in the browser, you'll see:

![rw-wp-after](https://user-images.githubusercontent.com/32992335/83955150-bb10d700-a804-11ea-9c63-708bc2fe7139.png)

### Adding TailwindCSS

This section is inspired by mdv.io's excellent blog post, [Adding TailwindCSS to RedwoodJS](https://mdv.io/). Note that the `webpack.config.js` file is no longer necessary since Redwood's webpack configuration now comes with postcss-loader by default (see [Supported Extensions and Loaders](#supported-extensions-and-loaders)). Neither is PurgeCSS, since, as of TailwindCSS v1.4, it's [built-in](https://tailwindcss.com/docs/release-notes/#tailwind-css-v1-4).

First, install the development dependencies:

```terminal
cd web
yarn add -D postcss-loader tailwindcss autoprefixer
```

As mentioned, we don't have to tell webpack to use postcss-loader. But we do have to configure it:

```terminal
mkdir config
touch config/postcss.config.js
```

```javascript
// ./web/config/postcss.config.js

const path = require('path')

module.exports = {
  plugins: [
    require('tailwindcss')(path.resolve(__dirname, 'tailwind.config.js')),
    require('autoprefixer')
  ],
}
```

> We've used the word "postcss-loader" three times, and it's because there's actually three different things: 1) the postcss-loader "rule" in webpack, which is there by default, 2) the postcss-loader package, and 3) the configuration for the postcss-loader rule, which is what goes in postcss.config.js. Welcome to the wonderful world of configuration.

Now, initialize tailwind and move the resulting file (`tailwind.config.js`) to `config`, just to keep things organized:

```terminal
yarn tailwindcss init
mv tailwind.config.js config/tailwind.config.js
```

Finally, use the tailwind directives in `web/src/index.css`

```css
/* ./web/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

And that should be it!

### Enabling Sass

Support for Sass is already configured, so all you have to do is install the development dependencies:

```terminal
cd web
yarn add -D sass-loader sass
```