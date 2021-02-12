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

todo

## Adapting React Query's hooks

todo

## Invalidating Mutations

todo

## Bonus

todo

### useOtherQuery 

todo

### persisting 

todo