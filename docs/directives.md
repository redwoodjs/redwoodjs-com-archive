# Directives

GraphQL directives are a SDL (Schema Definition Language) feature that lets you add configuration to a field, type or operation that act like "middleware" that lets you run some reusable code during GraphQL execution to perform tasks like authentication, formatting, and more.

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

You can also define arguments that can be extracted and used when evaluating the directive:

```ts
type Bar {
  field: String! @myDirective(roles: ["ADMIN"])
}
```

Because there are many ways to write directives that can get rather complicated and often require a deep understanding of the GraphQL lifecycle and structure, Redwood provides an easy and ergonomic way to generate and write your own directives. 

## What is a Redwood Directive?

Redwood directives are purposeful and come in two flavors: **Validators** and **Transformers**.

Whatever flavor of directive you want, all Redwood directives must have the following properties:

- Be in the `./api/src/directives/{directiveName}` folder where `directiveName` is yur directive
- Must have a file name with `{directiveName}.{js,ts}` extension e.g. `maskedEmail.ts`
- Must export a `schema` and implement either their `validate` or `transform` function

### Validators

Validators integrate with Redwood's authentication so evaluate whether or not a field, query or mutation is permitted -- that is, if the request context's `currentUser` is authenticated or belongs to one of the permitted roles.

Validators should throw an Error such as `AuthenticationError` or `ForbiddenError` to deny access and simply return to allow.

Here the `@isSubscriber` validator directive checks if the currentUser exists (and therefore is authenticated) and whether or not they have the `SUBSCRIBER` role. If they don't, then access is denied by throwing an error.

```ts
import {
  AuthenticationError,
  ForbiddenError,  
  createValidatorDirective,
  ValidatorDirectiveFunc,
} from '@redwoodjs/graphql-server'
import { hasRole } from 'src/lib/auth'

export const schema = gql`
  directive @isSubscriber on FIELD_DEFINITION
`

const validate: ValidatorDirectiveFunc = ({ context }) => {
  if (!context.currentUser)) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (!context.currentUser.roles?.includes('SUBSCRIBER')) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}

const isSubscriber = createValidatorDirective(schema, validate)

export default isSubscriber
```

Since validator directives can access arguments (such as `roles`), you can quickly provide RBAC (Role-based Access Control) to fields, queries and mutations.

```ts
import gql from 'graphql-tag'

import { createValidatorDirective } from '@redwoodjs/graphql-server'

import { requireAuth as applicationRequireAuth } from 'src/lib/auth'
import { logger } from 'src/lib/logger'

export const schema = gql`
  directive @requireAuth(roles: [String]) on FIELD_DEFINITION
`

const validate = ({ directiveArgs }) => {
  const { roles } = directiveArgs

  applicationRequireAuth({ roles })
}

const requireAuth = createValidatorDirective(schema, validate)

export default requireAuth
```

All Redwood apps come with two built-in validator directives: `@requireAuth` and `@skipAuth`. The `@requireAuth` directive takes optional roles. You may use these to protect against unwanted GraphQL access to your data -- or explicitly allow public access.

> **Note:** Validators evaluate prior to resolving the field value, so you cannot modify the value and any return value is ignored.

### Transformers

Transformers can access the resolved field value to modify and then replace in the response. Transformers apply to both on single fields (such as a User's email) and also collections (such as a set of Posts that either belong to the User) or is the result of a query. Transformers cannot be applied to Mutations.

In the first case of a single field, the directive would return the modified field value. In the latter case, the directive could iterate each Post and modify the `title` in each. In all cases, the directive **must** return the same expected "shape" of the data the SDL expects.


> **Note:** you can chain directives to first validate and then transform, such as `@requireAuth @maskedEmail`. Or, even combine transformations to cascade formatting a value (i.e., you could use `@uppercase` together with `@truncate` to convert a title to uppercase and shorten to 10 characters).

Since transformer directives can access arguments (such as `roles` or `maxLength`) you may fetch those values and use them when applying (or even if you should apply) your transformation.

That means that a transformer directive could consider the `permittedRoles` in:

```ts
type user {
  email: String! @maskedEmail(permittedRoles: ["ADMIN"])
}
```

and if the currentUser is an ADMIN, then skip the masking transform and simply return the original resolved field value.


```jsx
// ./api/directives/maskedEmail.directive.js
import {
  createTransformerDirective,
  TransformerDirectiveFunc,
} from '@redwoodjs/graphql-server'

export const schema = gql`
  directive @maskedEmail on FIELD_DEFINITION
`

const transform: TransformerDirectiveFunc = ({ context, resolvedValue }) => {
  return resolvedValue.replace(/[a-zA-Z0-9]/i, '*')
}

const maskedEmail = createTransformerDirective(schema, transform)

export default maskedEmail

```

and you would use it in your SDLs like this:

```jsx
type UserExample {
  id: Int!
  email: String! @maskedEmail # 👈 will replace alphanumeric characters with asterisks in the response!
  name: String 
}
```

---

TODO

Of course, you can generate a directive using the Redwood CLI to give you the boiler plate and a handy test!

```bash
yarn redwood generate directive myCoolDirective # <-- you would use it like @myCoolDirective
```

Each directive can only appear in certain locations within a GraphQL schema or operation. These locations are listed in the directive's definition. In the `@maskedEmail` example, the directive can only appear in the `FIELD_DEFINITION` location.

An example of a `FIELD_DEFINITION` location is a filed that exists on a `Type`:

```jsx
type UserExample {
  id: Int!
  email: String! @requireAuth
  name: String @maskedEmail # 👈 will maskedEmail name in the response!
}

type Query {
 userExamples: [UserExample!]! @requireAuth 👈 will enforce auth when fetching all users
 userExamples(id: Int!): UserExample @requireAuth 👈 will enforce auth when fetching a us
}
```

Note: Even though GraphQL supports `FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION | ENUM_VALUE` locations, RedwoodDirectives can **only** be declared on a `FIELD_DEFINITION` — that is, you **cannot** declare a directive in an `Input type`:

```graphql
input UserExampleInput {
  email: String! @maskedEmail # 👈 🙅 not allowed on an input
  name: String! @requireAuth # 👈 🙅 also not allowed on an input
 }
```

## Built-in directives

requireAuth

skipAuth

- accessing context, currentUser and roles "Make your directive role-speciifc"
- how createGraphQLHandler hooks up directives (just like sdl and services)

```jsx
```

## Writing your own directive

- generator command
- explain params
- explain args
- explain defaultValue

## Transformers vs Validators

❯   Validator
    Implement a validation: throw an error
   if criteria not met to stop execution

❯   Transformer
    Modify values of fields or query
   responses

## Validators

### Where can you apply validators?

- field with example
- query/mutation with example

## Transformers

### Where can you apply transformers?

- field with example
- type with example ?

## Writing tests

---

## TODO:

- [ ]  Update secure by default / rules docs

[Docs - Services : RedwoodJS Docs](https://redwoodjs.com/docs/services#enabling-secure-services)