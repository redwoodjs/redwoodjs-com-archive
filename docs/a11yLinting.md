# Accessibility

We built Redwood to make building websites more accessible (_we write all the config so you don't have to!_), but Redwood's also built to help you make more accessible websites. Accessibility shouldn't be a nice-to-have. It should be a given from the start, a core feature that's built-in and well-supported. 

There's a lot of great tooling out there that'll not only help you build accessible websites, but also help you learn what exactly that means. The framework handles as much as it can for you (via the Redwood Router) and equips you with as many tools as it can (`setup a11y`) for the cases that it can't handle.

> It's important to keep in mind that even with all the tooling in the world, manual testing's still important, especially for accessibiliy. We'll go over this too.

## Getting to know the tools

The easiest part is getting setup:

```bash
yarn rw setup a11y
```

Now you're ready to:

- lint with `eslint-plugin-jsx-a11y`
- develop with `@axe-core/react`
- storybook with `@storybook/addon-a11y`
- test with `jest-axe`

### Linting with `eslint-plugin-jsx-a11y`

[eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) lints your app for accessibility errors the way eslint lints your app for syntax errors. There's quite a few rules. But `eslint-plugin-jsx-a11y` has great docs for [every single one](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/master/docs/rules).

<!-- For example, take the [alt-text](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/alt-text.md#alt-text) rule. They provide both good and bad exmaples, and why they're good and bad. -->

All the rules are set to warn. If you want them to error instead, you can run the setup command like this:

```bash
yarn rw setup a11y --set-to-error
```

Now that you've got linting setup, all you have to do now is keep coding!

> **Do you use styled components?**
>
> [todo]

You can only do so much statically though; that's where the runtime comes in:

### Developing with `@axe-core/react`

https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react#axe-corereact

[todo]

### Storybook with `@storybook/addon-a11y`

https://github.com/storybookjs/storybook/tree/next/addons/a11y#storybook-addon-a11y

[todo]

### Testing with `jest-axe`

https://github.com/nickcolley/jest-axe

[todo]

## Accessible Routing with Redwood Router 

[todo]

### The Problem with SPAs

https://www.youtube.com/watch?v=NKTdNv8JpuM

[todo]

### Managing Focus

[todo]

### Announcing Routes

[todo]

### Restoring Scroll

[todo]

## A few must-have browser extensions

- [axe](https://chrome.google.com/webstore/detail/axe-web-accessibility-tes/lhdoppojpmngadmnindnejefpokejbdd)
- [Accessibility Insights](https://accessibilityinsights.io/docs/en/web/overview/)
- [ARC Toolkit](https://www.paciellogroup.com/toolkit/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/extension/)

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
