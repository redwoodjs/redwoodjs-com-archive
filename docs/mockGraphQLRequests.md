# Mocking GraphQL requests

Testing and building components without having to rely on the API is a good best practice.

Redwood makes this possible via `mockGraphQLQuery` and `mockGraphQLMutation`. The argument signatures of these functions are identical, internally they target different operation types based on their suffix.

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

### The operation name

The operation name is used to associate mock-data with a query or mutuation request.

```
query UserProfileQuery { /*...*/ }
mockGraphQLQuery('UserProfileQuery', { /*... */ })
```

```
mutation SetUserProfile { /*...*/ }
mockGraphQLMutation('SetUserProfile', { /*... */ })
```

Operation names should be unique.

### The mock-data

The second argument can be an object or a function.

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

Mock-data function arguments:
1. The `variables`
2. `{ ctx }`: 

The `ctx` object allows you to make adjustments to the response with the following functions:

- `ctx.status(code: number, text?: string)`: set a http response code:
```js{2}
mockGraphQLQuery('OperationName', (_variables, { ctx }) => {
  ctx.status(404)
})
```

- `ctx.delay(numOfMS)`: delay the response
```js{2}
mockGraphQLQuery('OperationName', (_variables, { ctx }) => {
  ctx.delay(1500) // pause for 1.5 seconds
  return { id: 42 }
})
```

- `ctx.error(e: GraphQLError)`: return an error object in the response:
```js{2}
mockGraphQLQuery('OperationName', (_variables, { ctx }) => {
  ctx.error({ message: 'Uh, oh!' })
})
```

## Global mock-requests vs local mock-requests

Placing your mock-requests in `"<name>.mock.js"` will cause them to be globally scoped in Storybook. This means that they'll be available to all stories in Storybook.

> When building React components it's often the case that a single component will have a deeply nested component that perform a GraphQL query or mutation. Having to mock those requests for every story can be painful and tedious. 

Using `mockGraphQLQuery` or a `mockGraphQLMutation` inside a story is locally scoped and will overwrite a globally scoped mock-request.

Our suggestion is to always start with globally scoped mocks.

## Mocking a Cell's Query

Locate the file ending with with `.mock.js` in your Cell's folder. This file exports a value named `standard`, which is the mock-data that will be returned for your Cell's `QUERY`.
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

The value assigned to `standard` is the mock-data associated to the `QUERY`, so modifying the `QUERY` means you also need to modify the mock-data.
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

> Behind the scenes: Redwood uses the value associated to `standard` as the second argument to `mockGraphQLQuery`.
