# Accessibility

We built Redwood to make building websites more accessible (_we write all the config so you don't have to_), but Redwood's also built to help you make more accessible websites. Accessibility shouldn't be a nice-to-have. It should be a given from the start, a core feature that's built-in and well-supported.

There's a lot of great tooling out there that'll not only help you build accessible websites, but also help you learn what exactly that means. The framework handles as much as it can for you (via the Redwood Router) and equips you with as many tools as it can (`setup a11y`) for the cases that it can't handle.

> **With all this awesome tooling, do I still have to manually test my application?**
> 
> Unequivocally, yes. Even with all the tooling in the world, manual testing's still important, especially for accessibiliy. 
> The GDS Accessibility team found that [automated testing only catches ~30% of all the issues](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage).
>
> But just because the tools don't catch'em all doesn't mean they're not valuable. It'd be much harder to learn what to look for without them.

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
> - https://github.com/styled-components/styled-components/issues/2718
> - https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/174
>
> [todo]


### Developing with `@axe-core/react`

https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react#axe-corereact

[todo]

You can only do so much statically. `@axe-core/react` tests the accessibility of your rendered app. Many accessibility issues exist at the intersection of the DOM and the CSS. Unless you fully render your app, you will get 1) false negatives because of lacking information and 2) false positives because some elements are evaluated in states that aren't final.

### Storybook with `@storybook/addon-a11y`

https://github.com/storybookjs/storybook/tree/next/addons/a11y#storybook-addon-a11y

[todo]

### Testing with `jest-axe`

https://github.com/nickcolley/jest-axe

[todo]

`jext-axe` is an aXe Jest matcher for testing accessibility. It expects the rendered app to have no aXe violations. 

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

## Testing manually

[todo]

### A few must-have browser extensions

- [axe](https://chrome.google.com/webstore/detail/axe-web-accessibility-tes/lhdoppojpmngadmnindnejefpokejbdd)
- [Accessibility Insights](https://accessibilityinsights.io/docs/en/web/overview/)
- [ARC Toolkit](https://www.paciellogroup.com/toolkit/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/extension/)

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
