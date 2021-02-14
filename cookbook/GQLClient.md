# Configuring your own GraphQL client

Did you know that you can configure your app with whatever GraphQL client you want? By default, Redwood uses [Apollo Client](https://www.apollographql.com/docs/react/). Here's what things usually look like:

```js{3,9,11}
// web/src/index.js

import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

// ...

ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodApolloProvider>
      <Routes />
    </RedwoodApolloProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

The `RedwoodApolloProvider` wraps all your routes and gives your Cells everything they need for data fetching.

But you don't have to use the `RedwoodApolloProvider` if you've got another GraphQL client in mind. 
In this cookbook, we'll go over how to configure your app with the GraphQL client of your choice. 
Here we'll be using [React Query](https://react-query.tanstack.com/), but you can use anyting you want&mdash;most of the steps will be the same, but we'll be sure to point out the ones that are exclusive to React Query.

> **Want to reduce bundle size?**
>
> If you don't import the `RedwoodApolloProvider` in your app, it won't be included the bundle!

Note that if you want to skip all this good-for-nothing config and go straight to the punchline, [Marcelo Alves](https://github.com/MarceloAlves) has you covered with his [RedwoodJS React Query Provider](https://www.npmjs.com/package/redwoodjs-react-query-provider) package! Follow his instructions [here](https://github.com/MarceloAlves/redwoodjs-react-query-provider#usage)&mdash;he'll have you up and running in no time.

## The `FetchConfig` and `GraphQLHooks` Providers

To configure your app with your own GraphQL client, there's two Redwood providers you'll need to know about: the `FetchConfigProvider` and the `GraphQLHooksProvider`.

<!-- > But too-many-links, didn't-click: React Context basically provides a value to the React component tree it wraps so that you don't have to prop drill it all the way down. -->
> **What's this provider thing you keep saying?**
>
> A provider is a React concept that stems from React Context. 
> It's a convetion to end a React component that returns a Provider with "Provider".
>
> If you don't know much about React Context, it might be a good idea to [brush up on it](https://reactjs.org/docs/context.html) before continuing.
> But the last thing you want a doc to tell is to go read another doc (another version of the N+1 problem), so React Context 101: it basically makes a value globally available to the React component tree it wraps, so that you don't have to prop drill it all the way down to wherever you want it.
> 
> The question "is context a state management solution?" comes up a lot, and even came up recently on the [Redwood Discord](https://discord.com/channels/679514959968993311/766152912069853204/809298569768861697).
> One of the problems with context is that if you're not careful it can cause a lot of renders: when a context's value changes, everything that uses that context rerenders. Everything. 
> But with the new [`useSelectedContext`](https://github.com/facebook/react/pull/20646) hook that might be coming out soon, that could be mitigated.

Let's put these providers in context: we want to make requests to our api, our graphql serverless function. So, we need that function's URI, what it'll be in both development and in production. And that's exactly what the `FetchConfigProvider` gives us. Since fetch is the most basic way of requesting a resource, it's called the `FetchConfigProvider` because it configures fetch. We won't be using fetch here, but you could.

The other thing we have to think about are Cells. Cells are how data gets into our app. How do Cells know to use our GraphQL client? That's where the `GraphQLHooksProvider` comes in. It provides the fully-configured `useQuery` function that cells use to query the api.

<!-- If you look at the withCell source, you might be confused when you see that Cells import the `useQuery` hook from `@redwoodjs/web`. How Cells are going to use your `useQuery` hook if they're importing it from `@redwoodjs/web`? Well, `useQuery` is actually just a call to `useContext` using the `GraphQLHooksContext`, Which we configure using the `GraphQLHooksProvider`! So as long as we configure it with the value we want, in this case, React Query's useQuery function, our Cells will use that. -->

## Case study: the `RedwoodApollloProvider`

Now that we know all the pieces, let's put them together by taking a look at the [`RedoodApolloProvider`](https://github.com/redwoodjs/redwood/blob/main/packages/web/src/apollo/index.tsx).

<!-- line highlighting is bugged here. -->
```js
const RedwoodApolloProvider = ({ graphQLClientConfig, useAuth, children }) => {
  return (
    <FetchConfigProvider useAuth={useAuth}>
      <ApolloProviderWithFetchConfig config={graphQLClientConfig}>
        <GraphQLHooksProvider useQuery={useQuery} useMutation={useMutation}>
          <FlashProvider>{children}</FlashProvider>
        </GraphQLHooksProvider>
      </ApolloProviderWithFetchConfig>
    </FetchConfigProvider>
  )
}
```

The order is important here: the `GraphQLHooksProvider` uses the `FetchConfigProvider`'s value, so it has to go below it in the tree.

[todo]

## Adapting React Query's hooks

The way React Query's `useQuery` and `useMutation` hooks work, we can't just pass them to the `GrpahQLHooksProvider` as they are. We have to adapt them.

React Query's `useQuery` hook expects a key as it's first argument and the function that actually go gets the data as it's second. 

> **Wait, React Query's `useQuery` doesn't actually do the data fetching?**
>
> You can think of React Query as a server/cache manager, that orchestrates a whole bunch of awesome things.
> It doesn't come with a function that does the fetching&mdash;you have to provide it with that&mdash;but it will call that function at the right time, like when the data's stale, or might be stale... [todo]

So we have to decide how we're actually going to make the GraphQL calls. We could just use fetch, and it might be a good exercise to do just that. It would look something like...

```js
() => fetch(uri, {
  method: 'POST',
  headers: {
    // ...
  }
  body: {
    query: ...
    variables: ...
  }
})
```

You could do it that way, but why bother when there's this library called [graphql-request](https://www.npmjs.com/package/graphql-request) that makes this stuff dead easy?

## Getting the Operation Name

If we're not going to give React Query arbitrary keys, we need to derive something unique from the queries we're passing in. There's a few ways we could do this, but the query's operation name is the most obvious choice. Luckily there's a GraphQL helper function that'll help us with that:

```
yarn workspace web add graphql
```

The [JS GraphQL reference implementation](https://github.com/graphql/graphql-js) has a lot of utility functions; the one we want is `getOperationAST`.
If that sounds technical, that's because it is. Let's break it down by looking at a typical GraphQL query you'll see in a Cell:

```gql
export const QUERY = gql`
  query BlogPostsQuery {
    blogPosts {
      id
    }
  }
`
```

There's a lot of anatomical terms for what we're looking at here. There's the operation type (`query`), the operation name (`BlogPostQuery`)... `getOperationAST` parses a GraphQL document in much the same way Babel parses JS&mdash;it gives us back the GraphQL document in a format we can programmatically manipulate.

What we want is `BlogPostQuery`, the operation name. Note that for most documents, the operation name's optional, kind of the way a function name's optional (think anonymous functions). Even the operation type's optional if it's a query:

```gql
export const QUERY = gql`{
  blogPosts {
    id
  }
}
`
```

This is a nameless operation. It's valid, but it isn't good for what we're about to do. It's a good practice to name your operations&mdash;Redwood Cells already do this for you.

All right, we need to make a helper function that gets the operation name from a GraphQL document. We'll call it `getOperationName`. Let's quickly run `getOperationASt` on our `QUERY` to see what we're dealing with:

```js
> getOperationAST(QUERY)
{
    "kind": "OperationDefinition",
    "operation": "query",
    "name": {
        "kind": "Name",
        "value": "BlogPostsQuery"
    },
    "variableDefinitions": [],
    "directives": [],
    "selectionSet": {
        "kind": "SelectionSet",
        "selections": [
            {
                "kind": "Field",
                "name": {
                    "kind": "Name",
                    "value": "blogPosts"
                },
                "arguments": [],
                "directives": [],
                "selectionSet": {
                    "kind": "SelectionSet",
                    "selections": [
                        {
                            "kind": "Field",
                            "name": {
                                "kind": "Name",
                                "value": "id"
                            },
                            "arguments": [],
                            "directives": []
                        }
                    ]
                }
            }
        ]
    }
}
```

That's a lot of stuff. That's ok&mdash;what we want's fairly easy to get; it's just `name.value`:

```
const getOperationName = (QUERY) => getOperationAST(QUERY).name.value
```

We've got ourselves a key!

## Bonus: Invalidating Mutations

This isn't related to... per se... but if you're using React Query to do your data fetching, it's probably something you should know about since you're going to be using React Query to do your mutations. And not many apps don't have mutations.

The way React Query works, it's via keys. So you have to tell it which key to invalidate. Good thing we made that `getOperationName` function!

[todo]

## Super Bonus: Devtools

React Query comes with it's own [devtools](https://react-query.tanstack.com/devtools). And they're just a React component!

```js
import { ReactQueryDevtools } from 'react-query/devtools'

// rest of the RedwoodReactQueryProvider...
  {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
// rest of the RedwoodReactQueryProvider...
```

From the devtools, you can invalidate queries... get visibility into the cache... the devtools are great for debugging. [todo]
