# Webpack Configuration

RedwoodJS uses webpack to bundle and build your assets.

## Overriding Webpack config

Your Webpack config can be modified by adding a `./web/config/webpack.config.js` file.

Two formats are supported:

1. Mutating the base config, by exporting a function:

```javascript
module.exports = (config, {env}) => {
  if (env === 'development') {
    // Add dev plugin
  }
  config.module.rules.push({...})

  return config
}
```

2. Merging the base config, by exporting an object:

```javascript
module.exports = {
  module: {
    rules: [{...}]
  }
}
```

## Example Use

### Changing the title of the page

```javascript
module.exports = (config, { env }) => {
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.title = 'Some Custom Title'
    }
  })

  return config
}
```

### Adding TailwindCSS support

```javascript
const configDir = __dirname

module.exports = (config) => {
  config.module.rules[0].oneOf[5] = {
    test: /\.css$/,
    sideEffects: true,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 } },
      {
        loader: 'postcss-loader',
        options: {
          config: {
            path: configDir,
          },
        },
      },
    ],
  }

  return config
}
```

### Enabling sass

We already have

```terminal
cd web
yarn add -D sass-loader sass
```

## Supported extensions and loaders

One of the following loaders will be run when a file is imported, they're executed in the following order:

1. `.md, .test.js, .stories.js`: null-loader
2. `.js, .jsx, .ts., .tsx`: babel
3. `.css, .scss, .module.css, .module.scss`: sass-loader, css-loader, style-loader. Sass requires `sass-loader` and `sass` to be installed.
4. `.png, .jpg, .gif`: url-loader
5. `.svg`: svg-react-loader
6. `*`: file-loader
