# Directives

Redwood Directives are a powerful feature not offered by other frameworks that supercharge your GraphQL-backed services. 

Simply put, directives add configuration to fields, types or operations that act like "middleware" that lets you run reusable code during GraphQL execution to perform tasks like authentication, formatting, and more.

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

There are many ways to write directives using GraphQL tools and libraries, and believe us, it can get rcomplicated fast. 

But, don't fret: Redwood provides an easy and ergonomic way to generate and write your own directives so you can focus on the implementation logic and not the GraphQL plumbing. 

## What is a Redwood Directive?

Redwood directives are purposeful; they come in two flavors: **Validators** and **Transformers**.

Whatever flavor of directive you want, all Redwood directives must have the following properties:

- Be in the `./api/src/directives/{directiveName}` folder where `directiveName` is yur directive
- Must have a file name with `{directiveName}.{js,ts}` extension e.g. `maskedEmail.ts`
- Must export a `schema` and implement either their `validate` or `transform` function

### Understanding the Directive Flow

It helps to know a little about the GraphQL Phases, specifically the Execution Phase, and how Redwood Directive fit in the data fetching and authentication flow.

First, we see the built-in `@requireAuth` Validator directive that can allow or deny access to a service (aka a resolver) based on Redwood authentication.

In this example, the `post(id: Int!)` query is protected using the `@requireAuth` directive.

If the request's context has a `currentUser` and the app's `auth.{js|ts}` determines it `isAuthenticated()` then the execution phase proceeds to get resolved (for example, use the `post({ id })` service and query the database using Prisma) and return then data in the resulting resposne when execution is done.

![require-auth-directive](https://user-images.githubusercontent.com/1051633/135320891-34dc06fc-b600-4c76-8a35-86bf42c7f179.png)

In this second example, we add a Transformer directive `@welcome` to the `title` field on `Post` in the SDL. 

The GraphQL Execution phase proceeds the same as the prior example (because the `post` query is still protected and we'll want to fetch the user's name) and then the `title` field is resolved based on the data fetch query in the service. 

Finally after execution is done, then the directive can inspect the `resolvedValue` (here "Welcome to the blog!") and replace the value by inserting the current user's name -- "Welcome, Tom, to the blog!"

![welcome-directive](https://user-images.githubusercontent.com/1051633/135320906-5e2d639d-13a1-4aaf-85bf-98529822d244.png)
)

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

### When Should I Use a Redwood Directive?

|     | Use                                      | Directive      | Custom? | Type       | 
|---- |------------------------------------------|----------------|---------|------------|
| ✅  | Check if the request is authenticated?   | @requireAuth   | Built-in | Validator |
| ✅  | Check if the user belongs to a role?     | @requireAuth(roles: ["AUTHOR"])   | Built-in | Validator |
| ✅  | Only allow admins to see emails, but others get a masked value like "###@######.###"    | @maskedEmail(roles: ["ADMIN"])   | Custom | Transformer |
| 🙅  | Know if the logged in user can edit the record, and/or values | N/A - Instead do this check in your service
| 🙅  | Is my input a valid email address format? | N/A - Instead do this check in your service or using a GraphQL scalar (Future Redwood)
| 🙅  | I want to remove a field from the response for data filtereing; for example, do not include the title of the post | N/A - Instead use standard directives ***on the GraphQL query, not the SDL*** |  `@skip(if: true )` or `@include(if: false)` | Standard

### Chaining and Cascading Directives


### GraphQL Handler Setup

Redwood makes it easy to code, organize, and map your directives into the GraphQL schema.

You simply add them to the `directives` directory and the `createGraphQLHandler` will do all the work.

> **Note:** Redwood has a generator that will do all the heavy lifting setup for you.

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
### Some Rules

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

### Secure by Default with Built-in directives


* must declare `@requireAuth`, `@skipAuth` or a custom directive on **all** queries and mutations
* build time checks
* GraphQL api won't start up

- accessing context, currentUser and roles "Make your directive role-speciifc"

### @requireAuth

@todo 

### @skipAuth

@todo 
## Custom Directives


Of course, you can write your own directives. Just generate a directive using the Redwood CLI to give you the boiler plate and a handy test!

### Generator

When using the `yarn redwood generate` command you will be presented with a choice of creating a Validator or a Transformer directive.

```bash
yarn redwood generate directive myDirective
```

```terminal
yarn rw g directive myDirective

? What type of directive would you like to generate? › - Use arrow-keys. Return to submit.
❯   Validator - Implement a validation: throw an error if criteria not met to stop execution
    Transformer - Modify values of fields or query responses
```

> **Note:** You can pass the `--type` parameter with either `validator` or `transformer` to create the desired driective type.

After picking the sirective type, the directive files will be created in you `api/src/directives/ directory:

```terminal
  ✔ Generating directive file ...
    ✔ Successfully wrote file `./api/src/directives/myDirective/myDirective.test.ts`
    ✔ Successfully wrote file `./api/src/directives/myDirective/myDirective.ts`
  ✔ Generating TypeScript definitions and GraphQL schemas ...
  ✔ Next steps...

    After modifying your directive, you can add it to your SDLs e.g.:
     // example todo.sdl.js
     # Option A: Add it to a field
     type Todo {
       id: Int!
       body: String! @myDirective
     }

     # Option B: Add it to query/mutation
     type Query {
       todos: [Todo] @myDirective
     }
```     


### Validator 

Let's create a `@isSubscriber` directive that will check roles to see if the user is a subscriber.

```terminal
yarn rw g directive isSubscriber --type validator
```

Next, implement your validatation logic in the directive's `validate` function.

Validator directives do not have access to the field value, i.e. they are called before resolving the value. But then do have access to the `context` and `directiveArgs`.

 - Throw an error, if you want to stop executing e.g. not sufficient permissions
 - Validator directives can be async or sync
 - Returned value will be ignored
   

```ts
const validate: ValidatorDirectiveFunc = ({ context, directiveArgs }) => {

  // You can also modify your directive to take arguments
  // and use the directiveArgs object provided to this function to get values
  logger.debug(directiveArgs, 'directiveArgs in isSubscriber directive')

  throw new Error('Implementation missing for isSubscriber')
}
```

Here, we can access the `context` parameter and then check to see in the currentUser is authenticated as if they belog to the `SUBSCRIBER` role:


```ts
// /api/src/directives/isSubscriber/isSubscriber.ts
// ...

const validate: ValidatorDirectiveFunc = ({ context }) => {
  if (!context.currentUser)) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (!context.currentUser.roles?.includes('SUBSCRIBER')) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}
```

#### Writing Tests

```ts
import { mockRedwoodDirective, getDirectiveName } from '@redwoodjs/testing/api'

import isSubscriber from './isSubscriber'

describe('isSubscriber directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(isSubscriber.schema).toBeTruthy()
    expect(getDirectiveName(isSubscriber.schema)).toBe('isSubscriber')
  })

  it('has a isSubscriber throws an error if validation does not pass', () => {
    const mockExecution = mockRedwoodDirective(isSubscriber, {})

    expect(mockExecution).toThrowError(
      'Implementation missing for isSubscriber'
    )
  })
})
```

### Transformer 

Let's create a `@maskedEmail` directive that will check roles to see if the user should see the email or if it should be obfuscated.

```terminal
yarn rw g directive maskedEmail --type transformer
```

Next, implement your validatation logic in the directive's `transform` function.

Transformer directives provide `context` and `resolvedValue` paramaters and run **after** resolving the value.
   
* You can also throw an error, if you want to stop executing, but note that the value has already been resolved
* Transformer directives **must** be synchronous, and return a value

```ts

const transform: TransformerDirectiveFunc = ({ context, resolvedValue }) => {
  return resolvedValue.replace('foo', 'bar')
}
```
#### Explain params
#### Explain args
#### Explain defaultValue



#### Writing tests

```ts
import { mockRedwoodDirective, getDirectiveName } from '@redwoodjs/testing/api'

import maskedEmail from './maskedEmail'

describe('maskedEmail directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(maskedEmail.schema).toBeTruthy()
    expect(getDirectiveName(maskedEmail.schema)).toBe('maskedEmail')
  })

  it('has a maskedEmail implementation transforms the value', () => {
    const mockExecution = mockRedwoodDirective(maskedEmail, {
      mockedResolvedValue: 'foo',
    })

    expect(mockExecution()).toBe('bar')
  })
})
```