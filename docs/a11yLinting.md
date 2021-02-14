# Accessibility

We built Redwood to make building websites more accessible&mdash;we write all the config so you don't have to. But Redwood's also built to help you make your website accessible once you've made it. Accessibility shouldn't be a nice-to-have, but a core feature, that's well-supported. There's a lot of great tooling out there that'll not only help you build accessible websites, but also help you learn. The framework handles as much as it can for you (Redwood Router) and equips you with as many tools as it can (setup a11y).

> It's important to keep in mind that even with all the tooling in the world, manual testing's still important, especially for accessibiliy.

## Getting to know the tools

Getting setup's easy:

```bash
yarn rw setup a11y
```

Now you're ready to:

- lint with `eslint-plugin-jsx-a11y`
- develop with `@axe-core/react`
- storybook with `@storybook/addon-a11y`
- test with `jest-axe`

### Linting with `eslint-plugin-jsx-a11y`

[eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) lints your app for accessibility errors the way eslint lints your app for syntax errors. 

There's a lot of rules to go over; we'll go over as many as we can. `eslint-plugin-jsx-a11y`` has great docs; make sure to refer to them when you need to; they're the standard: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/master/docs/rules.

All the rules are set to warn. If you want them to error, you can run the setup command like this:

```bash
yarn rw setup a11y --set-to-error
```

Now that you've got linting setup, all you have to do now is keep coding. 

> Are you using styled components?
>
> [todo]

You can only do so much statically though; that's where the runtime comes in:

### Developing with `@axe-core/react`

[todo]

### Storybook with `@storybook/addon-a11y`

[todo]

### Testing with `jest-axe`

[todo]

## Accessible Routing with Redwood Router 

[todo]

### The Problem with SPAs

[todo]

### Managing Focus

[todo]

### Announcing Routes

[todo]

### Restoring Scroll

[todo]

## A few must-have browser extensions

-
-
-
-

## Testing manually

[todo]

### Using a screen reader

[todo]

## Even more resources

[todo]

<!-- ## With TailwindCSS -->

<!-- https://tailwindcss.com/docs/screen-readers -->


<!-- ## Accessible UIs -->

<!-- - [Reach UI](https://reach.tech/) -->
<!-- - [Chakra UI](https://chakra-ui.com/) -->
<!-- - [headless ui](https://github.com/tailwindlabs/headlessui/tree/develop/packages/%40headlessui-react) -->

<!-- <\!-- add a "screen reader" tag -\-> -->
<!-- ## Semantic HTML -->

<!-- [todo] -->

<!-- https://reactjs.org/docs/accessibility.html#semantic-html -->

<!-- <\!-- Mostly for screen readers? -\-> -->

<!-- Avoid div soup. -->

<!-- This is about getting stuff "for free". -->
