# Roadmap to 1.0

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

If you want an even higher-level overview, scroll the aside on the right, keeping the color key in mind.

This document is alive. We'll update it as often as we can, and when it's appropriate to do so. And as always, feel free to open a PR!

## What goes in 1.0?

Not everything will be in `1.0`. Not everything can go in `1.0`. Even some really great ideas won't be&mdash;even things that are core to the Redwood dream, like more sides and targets (because those will be in [`2.0`](#20)!). 

We need to be very careful about our priorities, both because we want `1.0` to be something special and because if we don't be careful, we'll never get there. The hardest thing in open source is saying no. But as we get closer to `1.0`, it's increasingly what we'll have to do.

Just to let you know that we haven't forgotten about some topics and have them in our long-term plans, there's a section at the bottom: [`2.0`](#20). You're more than welcome to work on one of these.

But for `1.0`, these are all the must-haves:

## Accessibility

<span id="status-1" class="font-mono">Figuring it out</span>

Accessibility isn't something we're going to compromise on. 
It has to be first class. 
It's in the work at [#540](https://github.com/redwoodjs/redwood/issues/540).
Accessibility mainly plays through the Router.
As background reading, Gatsby has some [great blog posts](https://www.gatsbyjs.org/blog/2020-02-10-accessible-client-side-routing-improvements/).

- [Router: Focus is not reset to top of DOM on route change #540](https://github.com/redwoodjs/redwood/issues/540)
- [[WIP] Add RouteAnnouncer for accessibility #693](https://github.com/redwoodjs/redwood/pull/693)

## Auth

<span id="status-2" class="font-mono">There's a plan</span>

<!-- @todo RBAC; a 1.0 thing? -->
<!-- @todo anything else -->

We have big plans for Auth, and the next thing up is role-based access control (RBAC).
RBAC is about checking to see if the current user belongs to a role that is permitted access to a Route, Page, Function, etc. It's in discussion at [#745](https://github.com/redwoodjs/redwood/issues/806).

- [Simple username/password authentication, which method should I use? #745](https://github.com/redwoodjs/redwood/issues/745)
- [Implement Role-based Authorization #806](https://github.com/redwoodjs/redwood/issues/806)

## Bundle Size

<span id="status-0" class="font-mono">Didn't start</span>

We haven't looked. But one way you can is by building with the stats flag (`yarn rw build --stats`). This will make Redwood bundle with [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer).

- [Possible CI solution for monitoring build size #196](https://github.com/redwoodjs/redwood/issues/196)
- [Preact instead of React? #261](https://github.com/redwoodjs/redwood/issues/261)
- [Use react-query for data fetching #758](https://github.com/redwoodjs/redwood/issues/758#issuecomment-650299099)

## CI/CD (App-side)

<span id="status-2" class="font-mono">There's a plan</span>

<!-- @todo did I get that right, and what is it exactly? -->

You need CI/CD nowadays if you're going to do anything real. So we'd like to provide a [GitHub Actions](https://github.com/features/actions) template you can copy.

## CI/CD (Framework-side)

<!-- @todo what's our current CI/CD? Can users even see? -->

<span id="status-1" class="font-mono">Figuring it out</span>

For us to build with confidence, this just needs to be better. The worst part is it's clipping our speed. 

- [Possible CI solution for monitoring build size #196](https://github.com/redwoodjs/redwood/issues/196)
- [Add dependbot integration #368](https://github.com/redwoodjs/redwood/issues/368)
- [GH Action for CI should *not* run when PR is merged #660](https://github.com/redwoodjs/redwood/issues/660)

## Deployment

<!-- @todo did I get this list right? -->
<!-- @source https://github.com/redwoodjs/redwood/blob/49c3afecc210709641dd340b974c86251ed207dc/README.md -->

<span id="status-2" class="font-mono">There's a plan</span>

We'd like to support more deployment targets. 
The ones high-up on our list are: AWS Lambda, Google Cloud Run, and Vercel.
We think we'll add our second target using a plugin pattern that'll let people contribute or write their own deployment strategies.

- [Deploying to AWS Lambda](https://community.redwoodjs.com/t/deploying-to-aws-lambda/316)
- [Feature Request: Support Deployments to AWS Lambda #431](https://github.com/redwoodjs/redwood/issues/431)

## Docs

<!-- @todo translations? https://community.redwoodjs.com/t/translate-to-indonesia-language-for-redwoodjs-documentation/629/3 https://github.com/redwoodjs/redwood/issues/249 -->

<span id="status-3" class="font-mono">Making it happen</span>

Part of Redwood's initial success was the quality of its tutorial. The practice of readable and comprehensive documentation is something we plan to continue. The road to `1.0` doesn't mean sacrificing on the quality of docs. On the contrary, the more the framework can do, the better the docs have to be. 

- [Improvements to Existing Docs (tracking issue) #156](https://github.com/redwoodjs/redwoodjs.com/issues/156)

## Generators

<span id="status-1" class="font-mono">Figuring it out</span>

Our generators are already in pretty good shape. So as we get closer to `1.0`, we don't just mean more generators, but more advanced generators. Especially given the recent addition of `@redwoodjs/structure`. 

Also, one pain point is Prisma Schema relations. 

- [Investigate integrating or replacing generators with Plop #653](https://github.com/redwoodjs/redwood/issues/653)

## Logging

<!-- @todo is this gonna be in 1.0? -->

<span id="status-1" class="font-mono">Figuring it out</span>

We'd like to provide a great logging experience. We're in very early stages, but we plan on using [Winston](https://github.com/winstonjs/winston).

- [Implement Winston for logging #827](https://github.com/redwoodjs/redwood/issues/827)

## Prisma Migrate

<span id="status-3" class="font-mono">Making it happen</span>

This one isn't up to us per se, but for us to be `1.0`, it needs to be `1.0`.

## Router

<!-- @todo Get the details about the params bug from Danny -->

<span id="status-1" class="font-mono">Figuring it out</span>

Out of all the Redwood packages, the Router is probably the one that needs the most attention. Architecturally, as a client-side router, it was inspired by Reach Router. But it's not meant to be used in quite the same way (TLDR: flat > nested). But the [layout rerendering](https://github.com/redwoodjs/redwood/issues/267) is the most pressing issue. We really don't want to give up our flat Routes in the process of fixing this. 

Prerendering is in discussion and is going to be awesome. 

- [Are layouts re-rendered on each navigation #267](https://github.com/redwoodjs/redwood/issues/267)
- [Type-safe Router](https://community.redwoodjs.com/t/type-safe-router/348)
- [Pre-rendering with react-snap & Redwood](https://community.redwoodjs.com/t/pre-rendering-with-react-snap-redwood/863)
- [Prerender proposal](https://community.redwoodjs.com/t/prerender-proposal/849)
- [Adds types to @redwoodjs/Router #791](https://github.com/redwoodjs/redwood/issues/791)


## Stability (in General)

<span id="status-1" class="font-mono">Figuring it out</span>

Besides the code actually working, `1.0` means giving up the chance to do things like rename stuff, like possibly [renaming `api/prisma` to `api/db`](https://github.com/redwoodjs/redwood/issues/620). 

## State Management

<!-- @todo not sure if this belongs here but it has to be decided on -->

<span id="status-1" class="font-mono">Figuring it out</span>

There's been discussions about this [on the forum](https://community.redwoodjs.com/t/does-redwood-have-a-preferred-state-management-paradigm/176)), and we'd like to have some opinions before we hit `1.0`. So far, we like [recoil](https://recoiljs.org/).

## Storybook

<span id="status-3" class="font-mono">Making it happen</span>

Redwood's component-development workflow starts with Storybook. Being able to develop your components in isolation without ever starting the dev server is a real game-changer.

Storybook integration just landed. There's still a few more things we have to do:

- Add docs (tutorial, cookbook recipe, docs)
- [Enable queries and mutations](https://community.redwoodjs.com/t/how-to-use-the-new-storybook-integration-in-v0-13-0/873/3)
- [How would a user overwrite the Providers / add addons?](https://github.com/redwoodjs/redwood/pull/742)

## Structure

<!-- @todo need help with the todos on this one -->

<span id="status-3" class="font-mono">Making it happen</span>

Using Redwood's Structure package, we can use the same logic to power both the IDE (Decoupled Studio) and Redwood itself.
Redwood Structure's most common use-case is getting the diagnostics of a complete Redwood project, but being able to programatically talk about a Redwood project like an AST moves many other amazing things we can't anticipate into the adjacent possible.

## Testing (App-side)

<!-- @todo is e2e part of 1.0? -->

<span id="status-3" class="font-mono">Making it happen</span>

We've nearly got testing integrated for both sides, and now we're thinking about how to let users configure Jest.
Improving the templates that the generators create is a must, not only for the sake of completeness but also for user learning, so we've got to put thought into those.

- [[Testing] Support Jest --config extensibility #564](https://github.com/redwoodjs/redwood/issues/564)
- [Pages stemming from "yarn rw g scaffold <name>" are missing tests #603](https://github.com/redwoodjs/redwood/issues/603)
- [[Testing] Create generator output for Cell #629](https://github.com/redwoodjs/redwood/issues/629)
- [Provide a way to Mock user authentication in jest tests #680](https://github.com/redwoodjs/redwood/issues/680)

## Testing (Framework-side)

<!-- @todo need help -->

<span id="status-1" class="font-mono">Figuring it out</span>

This one has the same sentiment as [CI/CD (Framework-side)](#cicd-framework-side). In general, we need more and better tests.

- [Add missing units tests to CLI package (and standardize fixtures/mocks for existing) #682](https://github.com/redwoodjs/redwood/issues/682)
- [Add tests for Auth generator #639](https://github.com/redwoodjs/redwood/issues/639)

## TypeScript

<span id="status-3" class="font-mono">Making it happen</span>

We want TypeScript to be what Redwood apps default to. There's a lot to do, both on the Framework-side and the app-side, but its happening:

- [Team TypeScript zap️: for those who want to help add TS Support](https://community.redwoodjs.com/t/team-typescript-for-those-who-want-to-help-add-ts-support/369)
- [TypeScript tracking issue #234](https://github.com/redwoodjs/redwood/issues/234)
- [TypeScript: Generators and Templates tracking issue #523](https://github.com/redwoodjs/redwood/issues/523)
- [Add getLanguage() helper for project typescript | javascript default and settings #633](https://github.com/redwoodjs/redwood/pull/633)

## 2.0

A section on `2.0` when we haven't even reached `1.0` yet? Redwood is playing the long game. We're building for things that don't exist yet. So although these most likely won't be in `1.0`, they're most definitely part of the plan, and we want you to know that.

### More Sides and Targets

Redwood only has two sides, each of which has a single target. Architecturally, Redwood is multi-client ready, but we haven't implemented other sides yet.
