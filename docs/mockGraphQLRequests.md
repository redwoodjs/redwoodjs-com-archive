# Mocking GraphQL requests

Testing and building components without having to rely on the API is a good best practice. Redwood makes this possible via `mockGraphQLQuery` and `mockGraphQLMutation`. 

The argument signatures of these functions are identical. Internally, they target different operation types based on their suffix.

```js
mockGraphQLQuery('OperationName', (variables, { ctx, req }) => {
  ctx.delay(1500) // pause for 1.5 seconds
  return {
    userProfile: {
      id: 42,
      name: 'peterp',
    }
  }
})
```

## The operation name

The first argument is the [operation name](https://graphql.org/learn/queries/#operation-name); it's used to associate mock-data with a query or a mutation:

```js
query UserProfileQuery { /*...*/ }
mockGraphQLQuery('UserProfileQuery', { /*... */ })
```

```js
mutation SetUserProfile { /*...*/ }
mockGraphQLMutation('SetUserProfile', { /*... */ })
```

Operation names should be unique.

## The mock-data

The second argument can be an object or a function:

```js{1}
mockGraphQLQuery('OperationName', (variables, { ctx }) => {
  ctx.delay(1500) // pause for 1.5 seconds
  return {
    userProfile: {
      id: 42,
      name: 'peterp',
    }
  }
})
```

If it's a function, it'll receive two arguments: `variables` and `{ ctx }`. The `ctx` object allows you to make adjustments to the response with the following functions:

- `ctx.status(code: number, text?: string)`: set a http response code:

```js{2}
mockGraphQLQuery('OperationName', (_variables, { ctx }) => {
  ctx.status(404)
})
```

<br/>

- `ctx.delay(numOfMS)`: delay the response

```js{2}
mockGraphQLQuery('OperationName', (_variables, { ctx }) => {
  ctx.delay(1500) // pause for 1.5 seconds
  return { id: 42 }
})
```

<br/>

- `ctx.errors(e: GraphQLError)`: return an error object in the response:

```js{2}
mockGraphQLQuery('OperationName', (_variables, { ctx }) => {
  ctx.errors({ message: 'Uh, oh!' })
})
```

## Global mock-requests vs local mock-requests

Placing your mock-requests in `"<name>.mock.js"` will cause them to be globally scoped in Storybook, making them available to all stories.

> **All stories?**
>
> In React, it's often the case that a single component will have a deeply nested component that perform a GraphQL query or mutation. Having to mock those requests for every story can be painful and tedious. 

Using `mockGraphQLQuery` or `mockGraphQLMutation` inside a story is locally scoped and will overwrite a globally-scoped mock-request.

We suggest always starting with globally-scoped mocks.

## Mocking a Cell's `QUERY`

To mock a Cell's `QUERY`, find the file ending with with `.mock.js` in your Cell's directory. This file exports a value named `standard`, which is the mock-data that will be returned for your Cell's `QUERY`.

```js{4,5,6,12,13,14}
// UserProfileCell/UserProfileCell.js
export const QUERY = gql`
  query UserProfileQuery {
    userProfile {
       id
    }
  }
`

// UserProfileCell/UserProfileCell.mock.js
export const standard = {
  userProfile: {
    id: 42
  }
}
```

Since the value assigned to `standard` is the mock-data associated with the `QUERY`, modifying the `QUERY` means you also need to modify the mock-data.

```diff
// UserProfileCell/UserProfileCell.js
export const QUERY = gql`
  query UserProfileQuery {
    userProfile {
       id
+       name
    }
  }
`

// UserProfileCell/UserProfileCell.mock.js
export const standard = {
  userProfile: {
    id: 42,
+    name: 'peterp',
  }
}
```

> **Behind the scenes** 
>
> Redwood uses the value associated with `standard` as the second argument to `mockGraphQLQuery`.
