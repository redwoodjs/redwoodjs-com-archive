# Services

Redwood puts all your business logic in one place—Services. These can be used by your GraphQL API or any other place in your backend code. Redwood does all of the annoying stuff for you, just write your business logic!

## Overview

@TODO 

## Secure Services

Starting with `v0.37`, Redwood includes a feature we call Validator Directives. 

* requireAuth
* skipAuth

 By default, your GraphQL endpoint is open to the world. Secure Services use validator directives to make sure that the resolvers behind the endpoint (your Services) can't be invoked unless you allow them explicitly.


In addition to security, your Services benefit by being able to just focus on their job: rather than worrying about whether someone is logged in or not, Services remain laser focused on a specific bit of business logic. Larger concerns like security and validation can be moved "up" and out of the way.


### Securing Your Services

Secure Services rely on directives ... @todo


#### A Simple Service

Let's start with a simple Service for viewing, creating and deleting blog posts:

```javascript
export const posts = () => {
  return db.post.findMany()
}

export const createPost = ({ input }) => {
  return db.post.create({ data: input })
}

export const deletePost = ({ id }) => {
  return db.post.delete({ where: { id } })
}
```

The simplest rule you can add that actually adds some security is requiring authentication before every Service query or mutation:

```javascript
type Query {
  posts: [Post!]! @requireAuth
}

type Mutation {
  createPost(input: CreatePostInput!): Post! @requireAuth
  deletePost(id: Int!): Post! @requireAuth
}

```

In this example case, the `requireAuth()` directive would be called automatically before each and every Service function call (`posts`, `createPost` and `deletePost`).

> Using `requireAuth()` assumes you have an authentication library installed. If you don't, you can create a `requireAuth` function in `api/src/lib/auth.js` (which you'll also probably have to create) and just have it return `true` for now:
>
> ```javascript
> // api/src/lib/auth.js
>
> export const requireAuth = () => true
> ```
>

#### Best Practices

If you want your query or mutation to be public, simply use the `@skipAuth` directive.

When generating sdl, the file will include the `@requireAuth` directive by default to ensure queries and mutations are secure. If your app's queries and mutations are all public, you can setup a custom generator sdl template to apply `@skipAuth` or a custom validator directive to suit you application's needs.


@TODO
#### Examples

@TODO