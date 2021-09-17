# Storybook

Storybook enables a kind of frontend-first, component-driven development workflow that we've always wanted. 
By developing your UI components in isolation, you get to focus exclusively on your UI's needs,
saving you from getting too caught up in the details of your API too early. 

Storybook also makes debugging a lot easier.
You don't have to start the dev server, login as a user, tab through dropdowns, and click buttons just for that one bug to show up. 
Or render a whole page and make six GraphQL calls just to change the color of a modal.
You can set it all up as a story, tweak it there as you see fit, and even test it for good measure.

## Getting Started with Storybook

You can start Storybook with `yarn rw storybook`:

```
yarn rw storybook
```

This spins up Storybook on port `7910`. 

## Configuring Storybook

There's two files you can add to your project's `web/config` directory to configure Storybook: `storybook.config.js` and `storybook.preview.js`. Note that you may have to create the `web/config` directory:

```
cd redwood-project/web
mkdir config
touch config/storybook.config.js config/storybook.preview.js
```

`storybook.config.js` configures Storybook's server while `storybook.preview.js` configures the way stories render.

### Configuring the Server with `storybook.config.js`

> Since `storybook.config.js` configures Storybook's server, note that any changes you make require restarting Storybook.

While you can configure [any of Storybook server's available options](https://storybook.js.org/docs/react/configure/overview#configure-your-storybook-project) in `storybook.config.js`, you'll probably only configure `addons`:

```js
// web/config/storybook.config.js

module.exports = {
  /**
   * This line adds all of Storybook's essential addons.
   * 
   * @see {@link https://storybook.js.org/addons/tag/essentials}
   */
  addons: ['@storybook/addon-essentials']
}
```

This's because the other options are for things like how to find stories, configuring Webpack, configuring Babel, etc. 
Since Redwood merges your project's `storybook.config.js` with its base configuration, it does all that for you.

### Configuring Rendering with `storybook.preview.js`

Sometimes you want to change the way all your stories render. 
It'd be mixing concerns to add that logic to your actual components, and it'd get old fast to add it to every single `.stories.js` file. 
Instead decorate all your stories with any custom rendering logic you want in `storybook.preview.js`.

For example, something you may want to do is add some margin to all your stories so that they're not glued to the top left corner:

```js
// web/config/storybook.preview.js

export const decorators = [
  (Story) => <div style={{ margin: '48px' }}><Story /></div>
]
```

For more, see the Storybook docs on [configuring how stories render](https://storybook.js.org/docs/react/configure/overview#configure-story-rendering).
