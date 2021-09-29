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

### Customizing the Apollo Client and Cache

By default, `RedwoodApolloProvider` configures an `ApolloClient` instance with 1) a default instance of `InMemoryCache` to cache responses from the GraphQL API and 2) an `authMiddleware` to sign API requests for use with [Redwood's built-in auth](https://redwoodjs.com/docs/authentication). Beyond the `cache` and `link` params, which are used to set up that functionality, you can specify additional params to be passed to `ApolloClient` using the `graphQLClientConfig` prop. The full list of available configuration options for the client are [documented here on Apollo's site](https://www.apollographql.com/docs/react/api/core/ApolloClient/#options).

Depending on your use case, you may want to configure `InMemoryCache`. For example, you may need to specify a type policy to change the key by which a model is cached or to enable pagination on a query. [This article from Apollo](https://www.apollographql.com/docs/react/caching/cache-configuration/) explains in further detail why and how you might want to do this.

To configure the cache when it's created, use the `cacheConfig` property on `graphQLClientConfig`. Any value you pass is passed directly to `InMemoryCache` when it's created.

For example, if you have a query named `search` that supports [Apollo's offset pagination](https://www.apollographql.com/docs/react/pagination/core-api/), you could enable it by specifying:

```js
<RedwoodApolloProvider graphQLClientConfig={{
  cacheConfig: {
    typePolicies: {
      Query: {
        fields: {
          search: {
            // Uses the offsetLimitPagination preset from "@apollo/client/utilities";
            ...offsetLimitPagination()
          }
        }
      }
    }
  }
}}>
```

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

#### How to Modify the Context

Because the context is read-only in your services, if you need to modify it, then you need to do so in the `createGraphQLHandler`.

To populate or enrich the context on a per-request basis with additional attributes, set the `context` attribute `createGraphQLHandler` to a custom ContextFunction that modifies the context.

For example, if we want to populate a new, custom `ipAddress` attribute on the context with the information from the request's event, declare the `setIpAddress` ContextFunction as seen here:

```js
// api/src/functions/graphql.js

// ...

const ipAddress = ({ event }) => {
  return (
    event?.headers?.['client-ip'] ||
    event?.requestContext?.identity?.sourceIp ||
    'localhost'
  )
}

const setIpAddress = async ({ event, context }) => {
  context.ipAddress = ipAddress({ event })
}

export const handler = createGraphQLHandler({
  getCurrentUser,
  loggerConfig: {
    logger,
    options: { operationName: true, tracing: true },
  },
  schema: makeMergedSchema({
    schemas,
    services: makeServices({ services }),
  }),
  context: setIpAddress,
  onException: () => {
    // Disconnect from your database with an unhandled exception.
    db.$disconnect()
  },
})
```

> **Note:** If you use the preview GraphQL Helix/Envelop `graphql-server` package and a custom ContextFunction to modify the context in the createGraphQL handler, the function is provided ***only the context*** and ***not event***. However, the `event` information is available as an attribute of the context as `context.event`. Therefore, in the above example, one would fetch the ip address from the event this way: `ipAddress({ event: context.event })`.

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

## Verifying GraphQL Schema

In order to keep your GraphQL endpoint and services secure, you must specify one of `@requireAuth`, `@skipAuth` or a custom directive on **every** query and mutation defined in your SDL.

Redwood will verify that your schema complies with these runs when:

* building (or building just the api)
* launching the dev server.

If any fail this check, you will see:

* each query of mutation listed in the command's error log
* a fatal error `⚠️ GraphQL server crashed` if launching the server

### Build-time Verification

When building via the `yarn rw build` command and the SDL fails verification, you will see output that lists each query or mutation missing the directive:


```terminal
  ✔ Generating Prisma Client...
  ✖ Verifying graphql schema...
    → - deletePost Mutation
    Building API...
    Cleaning Web...
    Building Web...
    Prerendering Web...

You must specify one of @requireAuth, @skipAuth or a custom directive for
- contacts Query
- posts Query
- post Query
- createContact Mutation
- createPost Mutation
- updatePost Mutation
- deletePost Mutation 
```

### Dev Server Verification

When launching the dev server via the `yarn rw dev` command, you will see output that lists each query or mutation missing the directive:

```terminal

api | [nodemon] 2.0.12
api | [nodemon] to restart at any time, enter `rs`
api | [nodemon] watching path(s): redwood.toml
api | [nodemon] watching extensions: js,mjs,json
api | [nodemon] starting `yarn rw-api-server-watch`
gen | Generating TypeScript definitions and GraphQL schemas...
gen | 37 files generated
api | Building... Took 444 ms
api | Starting API Server... Took 2 ms
api | Listening on http://localhost:8911/
api | Importing Server Functions... 
web | ...
api | FATAL [2021-09-24 18:41:49.700 +0000]: 
api |  ⚠️ GraphQL server crashed 
api | 
api |     Error: You must specify one of @requireAuth, @skipAuth or a custom directive for 
api |     - contacts Query
api |     - posts Query
api |     - post Query
api |     - createContact Mutation
api |     - createPost Mutation
api |     - updatePost Mutation
api |     - deletePost Mutation 
```

To fix these errors, simple declare with `@requireAuth` to enforce authentication or `@skipAuth` to keep the operation public on each as approriate for your app's permissions needs.

## Directives

Directives supercharge your GraphQL services. They add configuration to fields, types or operations that act like "middleware" that lets you run reusable code during GraphQL execution to perform tasks like authentication, formatting, and more.

You'll recognize a directive by its preceded by the `@` character, e.g. `@myDirective`, and by being declared alongside a field:


```ts
type Bar {
  name: String! @myDirective
}
```

or a Query or Mutation:


```ts
type Query {
  bars: [Bar!]! @myDirective
}

type Mutation {
  createBar(input: CreateBarInput!): Bar! @myDirective
}
```
### GraphQL Handler Setup

Redwood makes it easy to code, organize, and map your directives into the GraphQL schema.

You simply add them to the `directives` directory and the `createGraphQLHandler` will do all the work.

```ts
// api/src/functions/graphql.ts

import { createGraphQLHandler } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}' // 👈 directives live here
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: {} },
  directives,//  👈 directives are added to the schema here
  sdls,
  services,
  onException: () => {
    // Disconnect from your database with an unhandled exception.
    db.$disconnect()
  },
})
```

> Note: Check-out the [in-depth look at Redwood Directives](https://www.redwoodjs.com/docs/directives) that explains how to generate directives so you may use them to validate access and transform the response.
## Logging

Logging is essential in production apps to be alerted about critical errors and to be able to respond effectively to support issues. In staging and development environments, logging helps you debug queries, resolvers and cell requests.

We want to make logging simple when using RedwoodJS and therefore have configured the api-side GraphQL handler to log common information about your queries and mutations. Log statements also be optionally enriched with [operation names](https://graphql.org/learn/queries/#operation-name), user agents, request ids, and performance timings to give you move visibility into your GraphQL api.

By configuring the GraphQL handler to use your api side [RedwoodJS logger](https://redwoodjs.com/docs/logger), any errors and other log statements about the [GraphQL execution](https://graphql.org/learn/execution/) will be logged to the [destination](https://redwoodjs.com/docs/logger#destination-aka-where-to-log) you've set up: to standard output, file, or transport stream.

You configure the logger using the `loggerConfig` that accepts a [`logger`]((https://redwoodjs.com/docs/logger)) and s set of [GraphQL Logger Options](#graphql-logger-options).

### Configure the GraphQL Logger

A typical GraphQLHandler `graphql.ts` is as follows:

```js
// api/src/functions/graphql.ts
// ...

import { logger } from 'src/lib/logger'

// ...
export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: {} },
// ...
})
```

#### Log Common Information

The `loggerConfig` takes several options that logs meaningful information along the graphQL execution lifecycle.


|Option|Description|
|:---|:---|
| data | Include response data sent to client. |
| operationName | Include operation name. The operation name is a meaningful and explicit name for your operation. It is only required in multi-operation documents, but its use is encouraged because it is very helpful for debugging and server-side logging. When something goes wrong (you see errors either in your network logs, or in the logs of your GraphQL server) it is easier to identify a query in your codebase by name instead of trying to decipher the contents. Think of this just like a function name in your favorite programming language. See https://graphql.org/learn/queries/#operation-name
|requestId| Include the event's requestId, or if none, generate a uuid as an identifier.
|query|Include the query. This is the query or mutation (with fields) made in the request.
| tracing |Include the tracing and timing information. This will ||log various performance timings within the GraphQL event lifecycle (parsing, validating, executing, etc).
|userAgent|Include the browser (or client's) user agent. This can be helpful to know what type of client made the request to resolve issues when encountering errors or unexpected behavior.

Therefore, if you wish to log the GraphQL `query` made, the `data` returned, and the `operationName` used, you would

```js
// api/src/functions/graphql.ts

export const handler = createGraphQLHandler({
  loggerConfig: {
    logger,
    options: { data: true, operationName: true, query: true },
  },
// ...
})
```

### Benefits of Logging

Benefits of logging common GraphQL request information include debugging, profiling, and resolving issue reports.

#### Operation Name Identifies Cells

The [operation name](https://graphql.org/learn/queries/#operation-name) is a meaningful and explicit name for your operation. It is only required in multi-operation documents, but its use is encouraged because it is very helpful for debugging and server-side logging.

Because your cell typically has a unique operation name, logging this can help you identify which cell made a request.
#### RequestId for Support Issue Resolution

Often times, your deployment provider will provide a request identifier to help reconcile and track down problems at an infrastructure level. For example, AWS API Gateway and AWS Lambda (used by Netlify, for example) provides `requestId` on the `event`.

You can include the request identifier setting the `requestId` logger option to `true`.

```js
// api/src/functions/graphql.ts
// ...
export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: { requestId: true } },
// ...
```

And then, when working to resolve a support issue with your deployment provider, you can supply this request id to help them track down and investigate the problem more easily.
#### No Need to Log within Services

By configuring your GraphQL logger to include `data` and `query` information about each request you can keep your service implementation clean, concise and free of repeated logger statements in every resolver -- and still log the useful debugging information.

```js
// api/src/functions/graphql.ts
// ...
export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: { data: true, operationName: true, query: true } },
// ...

// api/src/services/posts.js
//... 
export const post = async ({ id }) => {
  return await db.post.findUnique({
    where: { id },
  })
}
//... 
```

The GraphQL handler take care of will then take take of logging  your query and data -- as long as your logger is setup to log at the `info` [level](https://redwoodjs.com/docs/logger#log-level) and above. You can also disable the statements in production by just logging at the `warn` and above [level](https://redwoodjs.com/docs/logger#log-level).

```terminal
api | POST /graphql 200 7.754 ms - 1772
api | DEBUG [2021-09-29 16:04:09.313 +0000] (graphql-server): GraphQL execution started: BlogPostQuery
api |     operationName: "BlogPostQuery"
api |     query: {
api |       "id": 3
api |     }
api | DEBUG [2021-09-29 16:04:09.321 +0000] (graphql-server): GraphQL execution completed: BlogPostQuery
api |     data: {
api |       "post": {
api |         "id": 3,
api |         "body": "Meh waistcoat succulents umami asymmetrical, hoodie post-ironic paleo chillwave tote bag. Trust fund kitsch waistcoat vape, cray offal gochujang food truck cloud bread enamel pin forage. Roof party chambray ugh occupy fam stumptown. Dreamcatcher tousled snackwave, typewriter lyft unicorn pabst portland blue bottle locavore squid PBR&B tattooed.",
api |         "createdAt": "2021-09-24T16:51:06.198Z",
api |         "__typename": "Post"
api |       }
api |     }
api |     operationName: "BlogPostQuery"
api |     query: {
api |       "id": 3
api |     }
api | POST /graphql 200 9.386 ms - 441
```

but keep your services concise!

#### Send to Third-party Transports

Stream to third-party log and application monitoring services vital to production logging in serverless environments like [logFlare](https://logflare.app/), [Datadog](https://www.datadoghq.com/) or [LogDNA](https://www.logdna.com/)

#### Supports Log Redaction

Everyone has heard of reports that Company X logged emails, or passwords to files or systems that may not have been secured. While RedwoodJS logging won't necessarily prevent that, it does provide you with the mechanism to ensure that won't happen.

To redact sensitive information, you can supply paths to keys that hold sensitive data using the RedwoodJS logger [redact option](https://redwoodjs.com/docs/logger#redaction).

Because this logger is used with the GraphQL handler, it will respect any redaction paths setup.

For example, you have chosen to log `data` return by each request, then you may want to redact sensitive information, like email addresses from yur logs.

Here is an example of an application `/api/src/lib/logger.ts` configured to redact email addresses. Take note of the path `data.users[*].email` as this says, in the `data` attribute, redact the `email` from every `user`:

```js
// /api/src/lib/logger.ts
import { createLogger, redactionsList } from '@redwoodjs/api/logger'

export const logger = createLogger({
  options: {
    redact: [...redactionsList, 'email', 'data.users[*].email'],
  },
})
```

#### Timing Traces and Metrics

Often you want to measure and report how long your queries take to execute and respond. You may already be measuring these durations at the database level, but you can also measure the time it takes for your the GraphQL server to parse, validate, and execute the request.

You may turn on logging these metrics via the `tracing` GraphQL configuration option.

```js
// api/src/functions/graphql.ts
// ...
export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: { tracing: true } },
// ...
```

Let's say we wanted to get some benchmark numbers for the "find post by id" resolver

```js
  return await db.post.findUnique({
    where: { id },
  })
```

We see that this request took about 500 msecs (note: duration is reported in nanoseconds).

For more details about the information logged and its format, see [Apollo Tracing](https://github.com/apollographql/apollo-tracing).

```terminal
pi | INFO [2021-07-09 14:25:52.452 +0000] (graphql-server): GraphQL willSendResponse
api |     tracing: {
api |       "version": 1,
api |       "startTime": "2021-07-09T14:25:51.931Z",
api |       "endTime": "2021-07-09T14:25:52.452Z",
api |       "duration": 521131526,
api |       "execution": {
api |         "resolvers": [
api |           {
api |             "path": [
api |               "post"
api |             ],
api |             "parentType": "Query",
api |             "fieldName": "post",
api |             "returnType": "Post!",
api |             "startOffset": 1787428,
api |             "duration": 519121497
api |           },
api |           {
api |             "path": [
api |               "post",
api |               "id"
api |             ],
api |             "parentType": "Post",
api |             "fieldName": "id",
api |             "returnType": "Int!",
api |             "startOffset": 520982888,
api |             "duration": 25140
api |           },
... more paths follow ...
api |         ]
api |       }
api |     }
```

By logging the operation name and extracting the duration for each query, you can easily collect and benchmark query performance.
## Security

We'll document more GraphQL security best practices as Redwood reaches a `v1.0` release candidate. For now, know that Redwood already has some baked-in best practices; for example, when deploying GraphQL to production, GraphQL Playground is automatically disabled. 


### Secure Services

Some of the biggest security improvements we'll be making revolve around Services (which are intimately linked to GraphQL since they're wrapped into your resolvers). For `v1.0` we plan to make all of your GraphQL resolvers secure by default. You can even opt into this behavior now—see the [Secure Services](https://redwoodjs.com/docs/services.html#secure-services) section.

### Introspection and Playground Disabled in Production

Because it is often useful to ask a GraphQL schema for information about what queries it supports, GraphQL allows us to do so using the [introspection](https://graphql.org/learn/introspection/) system.

The [GraphQL Playground](https://github.com/graphql/graphql-playground) is a way for you to interact with your schema and try out queries and mutations. It can show you the schema by inspecting it. You can find the GraphQL Playground at http://localhost:8911/graphql when your dev server is running.

> Because both introspection and the playground share possibly sensitive information about your data model, your data, your queries and mutations, best practices for deploying a GraphQL Server call to disable these in production, RedwoodJS **only enables introspection and the playground when running in development**. That is when `process.env.NODE_ENV === 'development'`.

### Query Depth Limit

Attackers often submit expensive, nested queries to abuse query depth that could overload your database or expend costly resources.

Typically, these types of unbounded, complex and expensive GraphQL queries are usually huge deeply nested and take advantage of an understanding of your schema (hence why schema introspection is disabled by default in production) and the data model relationships to create "cyclical" queries.

An example of a cyclical query here takes advantage of knowing that and author has posts and each post has and author ... that has posts ... that has an another that ... etc.

This cyclical query has a depth of 8.

```js
// cyclical query example
// depth: 8+
query cyclical {
  author(id: 'jules-verne') {
    posts {
      author {
        posts {
          author {
            posts {
              author {
                ... {
                  ... # more deep nesting!
                }
              }
            }
          }
        }
      }
    }
  }
}
```

> To mitigate the risk of attacking your application via deeply nested queries, RedwoodJS by default sets the [Query Depth Limit](https://www.npmjs.com/package/graphql-depth-limit#documentation) to 11. 

You can change the default value via the `depthLimitOptions` setting when creating your GraphQL handler.

You `depthLimitOptions` are `maxDepth` or `ignore` stops recursive depth checking based on a field name. Ignore can be [either a string or regexp]( https://www.npmjs.com/package/graphql-depth-limit#documentation) to match the name, or a function that returns a boolean.

For example:

```js
// ...
export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: { query: true } },
  depthLimitOptions: { maxDepth: 6 },
// ...
})

## FAQ

### Why Doesn't Redwood Use Something Like Nexus?

This might be one of our most frequently asked questions of all time. Here's [Tom's response in the forum](https://community.redwoodjs.com/t/anyone-playing-around-with-nexus-js/360/5): 

> We started with Nexus, but ended up pulling it out because we felt like it was too much of an abstraction over the SDL. It’s so nice being able to just read the raw SDL to see what the GraphQL API is.

<!-- TODO -->
<!-- This https://community.redwoodjs.com/t/how-to-add-resolvetype-resolver-for-interfaces/432/7 -->
