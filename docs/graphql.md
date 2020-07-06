# GraphQL According to Redwood

[todo]

Besides taking care of the annoying stuff for you (namely, mapping your resolvers) there's not too many gotchas with GraphQL in Redwood. GraphQL is GraphQL. The only Redwood-specific thing you should really be aware of is [resolver args](#redwoods-resolver-args).

Also note that Redwood uses Apollo Client and Server, so you'll want to be fairly familiar with both of them, although we'll try to go over a few of the trickier topics here.

## Understanding Default Resolvers

[todo]

According to the spec, for every field in your sdl, there has to be a resolver in your Services. But you'll usually see fewer resolvers in your Services than you technically should. And that's because if you don't define a resolver, [Apollo Server will](https://www.apollographql.com/docs/apollo-server/data/resolvers/#default-resolvers).

The key question Apollo Server asks is: "Does the parent argument (in Redwood apps, the `parent` argument is named `root`&mdash;see [Redwood's Resolver Args](#redwoods-resolver-args)) have a property with this resolver's exact name?" Most of the time, especially with Prisma Client's ergonomic returns, the answer is yes.

Let's walk through an example. Say our sdl looks like this:

```javascript
// api/src/graphql/user.sdl.js

import gql from 'graphql-tag'

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

> So we have a User model in our schema.prisma that looks like this:
>
> ```javascript
> model User {
>   id    Int     @id @default(autoincrement())
>   email String  @unique
>   name  String?
> }
> ```

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

As we just mentioned, Apollo defines them for you. And since the `root` argument for `id`, `email`, and `name` has a property with each resolvers' exact name (i.e. `root.id`, `root.email`, `root.name`), it'll return the property's value, instead of just returning `undefined`, which is what Apollo would do if `root` didn't have properties with each resolvers' exact name.

> So it's kind of misleading to say Apollo defines it for you, as if it was taking care of all your problems. The matter of fact is Apollo will always define it for you, but if it can't figure it out, it'll just return `undefined`. Thanks Apollo?

But, if you wanted to be explicit about it, this is what it would look like:

<!-- TODO -->
<!-- Or | null? -->
```javascript
// api/src/services/user/user.js
import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}

export const Users = () => {
  id: (_obj, { root }) => root.id
  email: (_obj, { root }) => root.email
  name: (_obj, { root }) => root.name
}
```

## Redwood's Resolver Args

[todo]

[According to the spec](https://graphql.org/learn/execution/#root-fields-resolvers), resolvers take four arguments: `args`, `parent`, `context`, and `info`. In Redwood apps, resolvers do take these four arguments, but the way they're named and structured is slightly different. `parent` is named `root` (all the rest keep their names), and `root`, `context`, and `info` are wrapped into an object:

```javascript
export const Post = {
  user: (_obj, { root }) => db.post.findOne({ where: { id: root.id } }).user(),
}
```

Since args has to be the first argument passed (you know, JS), you can call it anything you want.
So, when Redwood's not using it, you'll often see it called `_obj`, as in the example above.

## Context

[todo]

In Redwood, the `context` object that's passed to resolvers is actually available to all your Services, whether or not they're serving as resolvers. Just import it from `@redwoodjs/api`:

```javascript
import { context } from '@redwoodjs/api
```

<!-- TODO -->
<!-- Context and auth? -->

## Redwood's Automatic Resolver Mapping

[todo]

```javascript
const users = ...

const User = ...
```

https://community.redwoodjs.com/t/how-to-create-field-resolver/195/7

<!-- TODO -->
<!-- If services use any of the resolver args, then they can't be used inside other services? -->
<!-- But then again, the way they're called w/ resolver args, it's "what a service would expect"... -->

## Redwood's Base Schema

[todo]

Did you know you `redwood` is a valid query?

## Why Doesn't Redwood Use Something Like Nexus?

[todo]

We think its important for you to own your schema.

<!-- TODO -->
<!-- This https://community.redwoodjs.com/t/how-to-add-resolvetype-resolver-for-interfaces/432/7 -->
