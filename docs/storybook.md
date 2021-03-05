# Storybook

Storybook enables a component-driven development workflow we've always wanted. With the ability to develop your UI components in isolation, you curtail the complexity of development by focusing on what actually matters.
You don't have to start the dev server, login as a user, click buttons, and tab through dropdowns just for that one bug to show up. Or render a whole page and make six GraphQL calls just to change the color of a modal.
You can set it all up as a story, tweak it there as you see fit, and even test it for good measure. 

## Configuring Storybook

There's two files for configuring Storybook: `storybook.config.js` and `storybook.preview.js`.
You can think of the two as being analogous to Redwood's api and web sides—`storybook.config.js` configures Storybook's server while `storybook.preview.js` configures the way stories render.

### Configuring the Server with `storybook.main.js`

You can configure Storybook's server by adding a `storybook.config.js` file to your `web/config` directory. Redwood merges this with it's base [configuration](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/storybook/main.js).

While you can configure any of the properties (see the [Storybook docs](https://storybook.js.org/docs/react/configure/overview#configure-your-storybook-project) for a list of all the properties), you'll probably only really want to configure `addons`:

```js
// web/src/config/storybook.main.js

module.exports = {
  addons: ['@storybook/addon-essentials']
}
```

That's because the other properties are for things like how to find stories and configuring Webpack and Babel. We do all that for you, and you probably won't need to change how to find stories unless you've got your files structured differently.

> Since `storybook.config.js` configures Storybook's server, any changes you make require restarting Storybook.

### Configuring Rendering with `storybook.preview.js`

`storybook.preview.js` changes how stories render. By default, Redwood wraps stories in [StorybookProvider](https://github.com/redwoodjs/redwood/blob/main/packages/core/src/storybook/StorybookProvider.tsx), which imports your default CSS and mock files, starts mock service worker, and mocks the router.

Something you might do in `storybook.preview.js` is add some margin to all your stories so that they're not glued to the top left corner:

```js
// web/config/storybook.preview.js

export const decorators = [
  (Story) => <div style={{ margin: '3em'}}><Story /></div>
]
```

For more, see the Storybook docs on [configuring how stories render](https://storybook.js.org/docs/react/configure/overview#configure-story-rendering).
