# Roadmap

_Last updated 24 Aug 2020_

The speed we're moving at is pretty remarkable. We want to hit `1.0` by the end of the year. And we think we can do it. But there are a lot of moving parts, each at a different level of maturity.

At this stage of development, when it's so important to keep the finish line in mind, having a high-level overview is invaluable. Hence, this roadmap, and these color-coded labels:

- <span id="status-0" class="font-mono">Didn't start</span>
- <span id="status-1" class="font-mono">Figuring it out</span>
- <span id="status-2" class="font-mono">There's a plan</span>
- <span id="status-3" class="font-mono">Making it happen</span>
- <span id="status-4" class="font-mono">Cleaning up</span>

We're taking inspiration from Basecamp's [Shape Up](https://basecamp.com/shapeup/3.4-chapter-12#work-is-like-a-hill). You can think of each one of these color-coded labels as a point on the hill chart.

> If you know Shape Up then you'll know that our scopes are probably too big. They are, but we want to orient people who aren't knee-deep in this, and questions like "how's TypeScript going?" are usually the kinds they have. So even though TypeScript is a big scope that comprises a lot of smaller, more actionable scopes, we want to give you an idea of where we're at with it.
>
> This means that even if we say TypeScript is <span id="status-3" class="font-mono">Making it happen</span>, there are some parts of it that might be <span id="status-0" class="font-mono">Didn't start</span>.

This document is alive. We'll update it as often as we can, and when it's appropriate to do so. And as always, feel free to [open a PR](https://github.com/redwoodjs/redwood/blob/main/CONTRIBUTING.md)!

## What goes in 1.0?

Not everything will be in `1.0`. Not everything can go in `1.0`. Even some really great ideas won't be&mdash;even things that are core to the Redwood dream, like more sides and targets (because those will be in [`2.0`](#20)!).

We need to be very careful about our priorities, both because we want `1.0` to be something special and because if we aren't careful, we'll never get there. The hardest thing in open source is saying no. But as we get closer to `1.0`, it's increasingly what we'll have to do.

Here's a high level overview of the `1.0` roadmap with links to relevant GitHub project boards and forum topics. If you're interested in helping with one of these, just let us know in the [RedwoodJS Forum](https://community.redwoodjs.com/) and we'll be happy to get you set up!

## Accessibility

<span id="status-1" class="font-mono">Figuring it out</span>

Accessibility isn't something we're going to compromise on. It has to be first class. Our goal is to help app authors build accessible experiences without having to jump through hoops. As background reading, Gatsby has some [great blog posts](https://www.gatsbyjs.org/blog/2020-02-10-accessible-client-side-routing-improvements/).

[Accessibility • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/5)

## Auth

<span id="status-3" class="font-mono">Making it happen</span>

Authentication and authorization are baked into Redwood. We plan to have easy-to-install, sophisticated authentication methods for a variety of popular auth providers. On top of that, we'll also provide RBAC (role-based access control) capabilities if you want them.

[Auth • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/6)

## Deployment

<span id="status-2" class="font-mono">There's a plan</span>

We'd like to support several deployment targets. The ones high-up on our list are: Netlify (done), Vercel (done), AWS, and Google Cloud Run. Deployment strategies should be done in a way that makes it easy for additional targets to be added and for users to create their own custom strategies.

[Deployment • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/9)

## Docs

<span id="status-3" class="font-mono">Making it happen</span>

Part of Redwood's initial success was the quality of the tutorial. The practice of readable and comprehensive documentation is something we plan to continue. The road to `1.0` doesn't mean sacrificing on the quality of docs. On the contrary, the more the framework can do, the better the docs have to be.

Docs are tracked on the [redwoodjs.com repo](https://github.com/redwoodjs/redwoodjs.com/projects/1)

## Generators

<span id="status-1" class="font-mono">Figuring it out</span>

Our generators are already in pretty good shape. So as we get closer to `1.0`, we don't just mean more generators, but more advanced generators. Especially given the recent addition of `@redwoodjs/structure`.

[Generators • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/13)

## Logging

<span id="status-1" class="font-mono">Figuring it out</span>

Logging has wiped out almost all of the old-growth Redwoods in California. But that doesn't mean we're not fans of logging here at RedwoodJS. As long as the logging helps you figure out what your app is doing! A production Redwood app will need great logging, so we intend to make it easy to get hooked up.

[Logging • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/7)

## Performance

<span id="status-0" class="font-mono">Didn't start</span>

Can you have great developer ergonomics **and** performance? We intend to find out.

Bundle size will be important here, so a good place to start is by building with the stats flag (`yarn rw build --stats`). This will make Redwood bundle with the [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer).

[Performance • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/10)

## Prerender

<span id="status-1" class="font-mono">Figuring it out</span>

- [Prerender proposal](https://community.redwoodjs.com/t/prerender-proposal/849)
- [Pre-rendering with react-snap & Redwood](https://community.redwoodjs.com/t/pre-rendering-with-react-snap-redwood/863)

## Prisma Migrate

<span id="status-3" class="font-mono">Making it happen</span>

This one isn't up to us per se, but for us to be `1.0`, it needs to be `1.0`.

## Router

<span id="status-1" class="font-mono">Figuring it out</span>

We've written our own router for Redwood, and we need to make sure it is competitive with existing routers in the React ecosystem (e.g. React Router, Reach Router). We've taken a stance on desiring a flat routing scheme (vs a nested one) and this currently comes with some performance downsides that need to be addressed.

[Router • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/11)

## Storybook

<span id="status-3" class="font-mono">Making it happen</span>

Redwood's component-development workflow starts with Storybook. Being able to develop your components in isolation without ever starting the dev server is a real game-changer.

[Storybook • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/8)

## Structure

<span id="status-3" class="font-mono">Making it happen</span>

Using Redwood's Structure package, we can use the same logic to power both an IDE (e.g. Jamstack IDE) and Redwood itself. Redwood Structure's most common use-case is getting the diagnostics of a complete Redwood project, but being able to programatically talk about a Redwood project like an AST moves many other amazing things we can't anticipate into the adjacent possible.

[Structure • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/12)

## Testing (App)

<span id="status-3" class="font-mono">Making it happen</span>

We've nearly got testing integrated for both sides, and now we're thinking about how to let users configure Jest. Improving the templates that the generators create is a must, not only for the sake of completeness but also for user learning, so we've got to put thought into those.

[Testing • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/4)

## TypeScript

<span id="status-3" class="font-mono">Making it happen</span>

We want TypeScript to be what Redwood apps default to. There's a lot to do, both on the Framework-side and the app-side, but its happening.

[TypeScript • GitHub Project Board](https://github.com/redwoodjs/redwood/projects/2)
