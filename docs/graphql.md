# GraphQL 

GraphQL is a fundamental part of Redwood. Having said that, you can get going without knowing anything about it, and can actually get quite far without ever having to read [the docs](https://graphql.org/learn/). But to master Redwood, you'll need to have more than just a vague notion of what GraphQL is; you'll have to really grok it.

The good thing is that, besides taking care of the annoying stuff for you (namely, mapping your resolvers, which gets annoying fast if you do it yourself!), there's not many gotchas with GraphQL in Redwood. GraphQL is GraphQL. The only Redwood-specific thing you should really be aware of is [resolver args](#redwoods-resolver-args).

Since there's two parts to GraphQL in Redwood, the client and the server, we've divided this doc up that way. By default, Redwood uses Apollo for both: [Apollo Client](https://www.apollographql.com/docs/react/) for the client and [Apollo Server](https://www.apollographql.com/docs/apollo-server/) for the server, though you can swap Apollo Client out for something else if you want. Apollo Server, not so much, but you really shouldn't have to do that unless you want to be on the bleeding edge of the [GraphQL spec](https://spec.graphql.org/), in which case, why are you reading this doc anyway? Contribute a PR instead!

## Client-side

### RedwoodApolloProvider

By default, Redwood Apps come ready-to-query with the `RedwoodApolloProvider`. As you can tell from the name, this Provider wraps [ApolloProvider](https://www.apollographql.com/docs/react/api/react/hooks/#the-apolloprovider-component). Omitting a few things, this is what you'll normally see in Redwood Apps:

```js
// web/src/App.js

import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

// ...

const App = () => (
  <RedwoodApolloProvider>
    <Routes />
  </RedwoodApolloProvider>
)

// ...
```

You can use Apollo's `useQuery` and `useMutation` hooks by importing them from `@redwoodjs/web`, though if you're using `useQuery`, we recommend that you use a [Cell](https://redwoodjs.com/docs/cells):

```js
// web/src/components/MutateButton.js

import { useMutation } from '@redwoodjs/web'

const MUTATION = `
  # your mutation...
`

const MutateButton = () => {
  const [mutate] = useMutation(MUTATION)

  return (
    <button onClick={() => mutate({ ... })}>
      Click to mutate
    </button>
  )
}
```

Note that you're free to use any of Apollo's other hooks, you'll just have to import them from `@apollo/client` instead. In particular, these two hooks might come in handy:

|Hook|Description|
|:---|:---|
|[useLazyQuery](https://www.apollographql.com/docs/react/api/react/hooks/#uselazyquery)|Execute queries in response to events other than component rendering|
|[useApolloClient](https://www.apollographql.com/docs/react/api/react/hooks/#useapolloclient)|Access your instance of `ApolloClient`|

### Swapping out the RedwoodApolloProvider

As long as you're willing to do a bit of configuring yourself, you can swap out `RedwoodApolloProvider` with your GraphQL Client of choice. You'll just have to get to know a bit of the make up of the [RedwoodApolloProvider](https://github.com/redwoodjs/redwood/blob/main/packages/web/src/apollo/index.tsx#L71-L84); it's actually composed of a few more Providers and hooks:

- `FetchConfigProvider`
- `useFetchConfig`
- `GraphQLHooksProvider`

For an example of configuring your own GraphQL Client, see the [redwoodjs-react-query-provider](https://www.npmjs.com/package/redwoodjs-react-query-provider). If you were thinking about using [react-query](https://react-query.tanstack.com/), you can also just go ahead and install it! 

Note that if you don't import `RedwoodApolloProvider`, it won't be included in your bundle, dropping your bundle size quite a lot!

## Server-side

### Understanding Default Resolvers

According to the spec, for every field in your sdl, there has to be a resolver in your Services. But you'll usually see fewer resolvers in your Services than you technically should. And that's because if you don't define a resolver, [Apollo Server will](https://www.apollographql.com/docs/apollo-server/data/resolvers/#default-resolvers).

The key question Apollo Server asks is: "Does the parent argument (in Redwood apps, the `parent` argument is named `root`&mdash;see [Redwood's Resolver Args](#redwoods-resolver-args)) have a property with this resolver's exact name?" Most of the time, especially with Prisma Client's ergonomic returns, the answer is yes.

Let's walk through an example. Say our sdl looks like this:

```javascript
// api/src/graphql/user.sdl.js

export const schema = gql`
  type User {
    id: Int!
    email: String!
    name: String
  }

  type Query {
    users: [User!]!
  }
`
```

So we have a User model in our `schema.prisma` that looks like this:

```javascript
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

If you create your Services for this model using Redwood's generator (`yarn rw g services user`), your Services will look like this:

```javascript
// api/src/services/user/user.js

import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}
```

Which begs the question: where are the resolvers for the User fields&mdash;`id`, `email`, and `name`?
All we have is the resolver for the Query field, `users`.

As we just mentioned, Apollo defines them for you. And since the `root` argument for `id`, `email`, and `name` has a property with each resolvers' exact name (i.e. `root.id`, `root.email`, `root.name`), it'll return the property's value (instead of returning `undefined`, which is what Apollo would do if that weren't the case).

But, if you wanted to be explicit about it, this is what it would look like:

```javascript
// api/src/services/user/user.js

import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}

export const Users = {
  id: (_args, { root }) => root.id,
  email: (_args, { root }) => root.email,
  name: (_args, { root }) => root.name,
}
```

The terminological way of saying this is, to create a resolver for a field on a type, in the Service, export an object with the same name as the type that has a property with the same name as the field.

Sometimes you want to do this since you can do things like add completely custom fields this way:

```js{5}
export const Users = {
  id: (_args, { root }) => root.id,
  email: (_args, { root }) => root.email,
  name: (_args, { root }) => root.name,
  age: (_args, { root }) => new Date().getFullYear() - root.birthDate.getFullYear()
}
```

<!-- Source: https://community.redwoodjs.com/t/how-to-create-field-resolver/195/7 -->

### Redwood's Resolver Args

[According to the spec](https://graphql.org/learn/execution/#root-fields-resolvers), resolvers take four arguments: `args`, `obj`, `context`, and `info`. In Redwood, resolvers do take these four arguments, but what they're named and how they're passed to resolvers is slightly different:
- `args` is passed as the first argument
- `obj` is named `root` (all the rest keep their names)
- `root`, `context`, and `info` are wrapped into an object; this object is passed as the second argument

Here's an example to make things clear:

```javascript
export const Post = {
  user: (args, { root, context, info }) => db.post.findUnique({ where: { id: root.id } }).user()
}
```

Of the four, you'll see `args` and `root` being used a lot.

|Argument|Description|
|:---|:---|
|`args`|The arguments provided to the field in the GraphQL query|
|`root`|The previous return in the resolver chain|
|`context`|Holds important contextual information, like the currently logged in user|
|`info`|Holds field-specific information relevant to the current query as well as the schema details|

> **There's so many terms!**
>
> Half the battle here is really just coming to terms. To keep your head from spinning, keep in mind that everybody tends to rename `obj` to something else: Redwood calls it `root`, Apollo calls it `parent`. `obj` isn't exactly the most descriptive name in the world.

### Context

In Redwood, the `context` object that's passed to resolvers is actually available to all your Services, whether or not they're serving as resolvers. Just import it from `@redwoodjs/api`:

```javascript
import { context } from '@redwoodjs/api
```

### The Root Schema

Did you know that you can query `redwood`? Try it in the GraphQL Playground (you can find the GraphQL Playground at http://localhost:8911/graphql when your dev server is running&mdash;`yarn rw dev api`):

```gql
query {
  redwood {
    version
    currentUser
  }
}
```

How is this possible? Via Redwood's [root schema](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/makeMergedSchema/rootSchema.ts#L22-L38). The root schema is where things like currentUser are defined.

Now that you've seen the sdl, be sure to check out [the resolvers](https://github.com/redwoodjs/redwood/blob/34a6444432b409774d54be17789a7109add9709a/packages/api/src/makeMergedSchema/rootSchema.ts#L31-L45).

<!-- ### The query workflow

The GraphQL Playground's nice, but if you're a power user, you'll want to be using something a little more dedicated and always on; where you can save things like environments...

<div class="relative pb-9/16">
  <iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/watch?v=SU4g9_K0H1c" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; modestbranding; showinfo=0" allowfullscreen></iframe>
</div>

- todo
- link to claire's video
- dt has some thoughts on this
- insomnia -->

## Security

We'll document more GraphQL security best practices as Redwood reaches a v1.0 release candidate, but note that Redwood already bakes in some when deploying GraphQL to production, such as disabling the GraphQL Playground.

## FAQ

### Why Doesn't Redwood Use Something Like Nexus?

This might be one of our most frequently asked questions of all time. Here's [Tom's response in the forum](https://community.redwoodjs.com/t/anyone-playing-around-with-nexus-js/360/5): 

> We started with Nexus, but ended up pulling it out because we felt like it was too much of an abstraction over the SDL. It’s so nice being able to just read the raw SDL to see what the GraphQL API is.

<!-- TODO -->
<!-- This https://community.redwoodjs.com/t/how-to-add-resolvetype-resolver-for-interfaces/432/7 -->
