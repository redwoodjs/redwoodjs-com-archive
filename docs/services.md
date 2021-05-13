# Services

Redwood puts all your business logic in one place—Services. These can be used by your GraphQL API or any other place in your backend code. Redwood does all of the annoying stuff for you, just write your business logic!

## Secure Services

Starting with `v0.32`, Redwood includes a feature we call Secure Services. By default, your GraphQL endpoint is open to the world. Secure Services makes sure that the resolvers behind the endpoint (your Services) can't be invoked unless you allow them explicitly.

> As of now, this behavior is opt-in—if you don't do anything, your Services will continue to work as they always have. But once Redwood hits `v1.0`, Secure Services will be enabled by default. 
>
> If you don't opt-in now, you'll see a warning message during dev server startup that warns you that it will become the default behavior as of `v1.0`.

In addition to security, your Services benefit by being able to just focus on their job: rather than worrying about whether someone is logged in or not, Services remain laser focused on a specific bit of business logic. Larger concerns like security and validation can be moved "up" and out of the way.

> **Services are only secured when used as resolvers via GraphQL**. If you have one service calling another service, this logic will *not* be used.

## Enabling Secure Services

To enable Secure Services, add `REDWOOD_SECURE_SERVICES=1` to your `.env.defaults` file:

```shell
# env.defaults

REDWOOD_SECURE_SERVICES=1
```

Once you do this, you'll see your Services suddenly become inaccessible, with an error message in the console when you start your dev server:

```
Must define a `beforeResolver()` in posts/posts.js
```

Which means it worked!

## Securing Your Services

Secure Services rely on a new function that you export from your Service named `beforeResolver()`. This function defines a set of "rules" (functions) that will be invoked, one after the other, before calling any Service. **As long as none of those functions throw an error, the Service call will be allowed**.

```javascript
export const beforeResolver = () => {}
```

If you simply export the `beforeResolver()` function without any rules, you'll see another error when making a GraphQL call:

```
Service call not authorized. If you really want to allow access, add `rules.skip({ only: ['posts'] })` to your beforeResolver()
```

This is why we call it **Secure Services**—they're secure even if you do nothing. You have to do *something* to allow access.

### A Simple Service

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

The simplest rule you can add that actually adds some security is requiring authentication before every Service function call:

```javascript
import { requireAuth } from 'src/lib/auth'

export const beforeResolver = (rules) => {
  rules.add(requireAuth)
}
```

`beforeResolver()` receives an argument that we'll call `rules` that you can call one of these functions on:

1. `add()`
2. `skip()`  

In this example case, `requireAuth()` would be called automatically before each and every Service function call (`posts`, `createPost` and `deletePost`). 

> Using `requireAuth()` assumes you have an authentication library installed. If you don't, you can create a `requireAuth` function in `api/src/lib/auth.js` (which you'll also probably have to create) and just have it return `true` for now:
>
> ```javascript
> // api/src/lib/auth.js
>
> export const requireAuth = () => true
> ```
>
> In fact, if you create a new Redwood app as of `v0.32`, this is exactly what we do for you! When you install an auth library we'll replace this function with one that actually checks if your users are logged in, and you don't need to change anything in your `beforeResolvers()` either.

We'll refer to these functions that run as rules as "rule functions".

### Skipping Rules with `only` and `except`

What if we want to make `posts` open to the world and only require authentication for the "sensitive" endpoints like `createPost` and `deletePost`? `add()` takes a second argument of options where you can specify which Services the rule should apply to:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth, { except: ['posts'] })
}
```

Now the resolver will NOT run for `posts()`. 

You can also use `only` as the opposite of `except`:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth, { only: ['createPost', 'deletePost'] })
}
```

> Usually you want to use whatever form results in fewer "exceptions". In this case, you'd use `except` since you're only *excluding* one function, instead of using `only` to *include* two functions.

We'll refer to the `only` and `except` options as "scopes". So some rule functions run everywhere and some are scoped to only run for certain Services.

Now if you try to access your `posts` Service, you'll encounter an error again, saying that it's unprotected. This is because we have no rule covering `posts` since we excluded it from `requireAuth()`. We need to tell the Secure Services engine that we acknowledge that we're leaving `posts` open to the world.

## skip()

Every Service function must be covered by either an `add()` or `skip()` call. This is you saying to Redwood "it's okay to call each and every Service function, either by first running these rule functions or by running nothing (and I know I'm running nothing)."

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.skip(requireAuth, { only: ['posts'] })
}
```

Here we `requireAuth()` everywhere, then say "but skip it only when calling `posts()`". In this case we only have one rule, so it's the only one we need to skip, which lets us use a more concise version of the syntax that omits the function altogether:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.skip({ only: ['posts'] })
}
```

Skip with no function as the first argument means "skip everything". If you also leave off the options list, then it **really** will skip everything—all rules for all Services:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.skip()
}
```

This is a pretty dangerous thing to do, and in a future release, we'll force you to pass an option like `{ force: true }` to make sure you know what you're doing.

## More Complex Scenarios

In our example posts Service, we probably want to add some role-based authorization to some of the Services. Since we're using the `requireAuth` function, we can pass role checks as usual:

```javascript
export const beforeResolver = (rules) => {
  rules.add(() => requireAuth({ role: ['admin'] }))
  rules.skip({ only: ['posts'] })
}
```

> We have to wrap `requireAuth()` in an anonymous function here because we want to pass arguments to it.

Maybe you have different roles for those who can create vs. those who can delete posts:

```javascript
export const beforeResolver = (rules) => {
  rules.add(() => requireAuth({ role: ['author', 'admin'] }), { only: ['createPost'] })
  rules.add(() => requireAuth({ role: ['admin'] }), { only: ['deletePost'] })
  rules.skip({ only: ['posts'] })
}
```

Since you can never trust the client, you may want to verify the data coming in when creating a post in case someone is trying to get some bad data into the database:

```javascript
const verifyPost = (name, { input }) => {
  if (!input.title || input.title === '') {
    throw new UserInputError('Title is required')
  }
}
  
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.add(verifyPost, { only: ['createPost'] })
  rules.skip({ only: ['posts'] })
}
```

So `createPost` and `deletePost` both require that your users be logged in, and `createPost` will also verify the input. Note the arguments sent to the `verifyPost()` function:

* `name` is the name of the Service function that's being called—`"createPost"` in this case
* the second argument is whatever was sent to the Service call itself when it was called as a resolver by GraphQL (in this case, an object containing the `input` from the mutation `variables`).

### Rule Ordering

Rules are run in the order you define them in your `beforeResolver()`. Given this example:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.add(rateLimit)
  rules.add(circularQueryCheck)
}
```

The rules will run in the following order:

```terminal
requireAuth() -> rateLimit() -> circularQueryCheck()
```

If any of them `throw`, the chain will stop and an error will be returned to GraphQL.

To get even more concise, if you have multiple rule functions that can run for the same scope of functions (as in the above example), you can send multiple functions as the first argument:

```javascript
export const beforeResolver = (rules) => {
  rules.add([requireAuth, rateLimit, circularQueryCheck])
}
```

### Best Practices

When do you use `only` and when do you use `except` and when do you use `skip` with or without `only` and `except`?

You'll probably find it the most clear to use whatever combination gives you a) the fewest number of lines and b) the shortest line length per line. These prescriptions may seem arbitrary, but consider the following examples; they're equivalent, but you'll probably find yourself leaning towards the syntax of one over the others:

```javascript
// one rule per line—very clear which ones will be run and where
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.add(rateLimit)
  rules.add(circularQueryCheck, { only: ['createPost', 'deletePost'] })
}

// basically says "DO THIS EVERYWHERE....(but skip in this one place)"
export const beforeResolver = (rules) => {
  rules.add([requireAuth, rateLimit, circularQueryCheck])
  rules.skip(circularQueryCheck, { only: ['posts'] })
}

// similar to above, but more of an "additive-only" version
export const beforeResolver = (rules) => {
  rules.add([requireAuth, rateLimit])
  rules.add(circularQueryCheck, { except: ['posts'] })
}
```

Another way to think about it is to avoid adding to fewer services than not, and avoid skipping more Services than not. It's much clearer to add rules to all services and then `except` one or two than to add a Service to `only` a dozen different services. 

Likewise, it's usually clearer to skip only a few Services than to skip a ton of them. If you find yourself skipping a ton of Services, you probably added it to too many to begin with.

On the other hand, if you have a function that will only be run for a single Service function (like verifying that a new user has a valid email address), it might be clearer to put that check in the function itself, rather than clutter up the `beforeResolver()`.

It usually comes down to matter of taste!

## Thanks, I Hate It

If you'd rather just handle these types of auth tasks within each individual Service, you can! Just `rules.skip()` in `beforeResolver` and handle these tasks in each individual Service. But beware: you'll need to be eternally vigilant and remember to add these checks each and every time you create a new Service.

## TL;DR

You must export a `beforeResolver()` function in each of your Services. 

This function receives a single argument, `rules`, which you call `add` or `skip` on to build a "specification" that provides a list of functions that run before allowing access to the Service as a GraphQL resolver. 

The functions that you give to `rules.add()` will be sent two arguments: the first is the `name` of the Service you tried to call and the second is whatever arguments were going to be passed to the Service originally.

All service functions *must* be covered by at least one rule, either in an `add()` or `skip()` call, otherwise you'll see an error when calling the Service as a resolver via GraphQL.

**Services can still call other Services, in which case these rules will *not* be run**.

### Examples

Require authentication for every function in a Service (this is a great absolute minimum to make sure your Services aren't accessible via GraphQL to anyone that isn't logged in):

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
}

export const posts = () => {
  return db.post.findMany()
}
```

Include a rule on all Service functions *except* some:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth, { except: ['posts'] })
}

// posts, createPost, deletePost functions...
```

Include a rule on *only* some Service functions:

```javascript
import { rateLimit } from 'src/lib/auth'

export const beforeResolver = (rules) => {
  rules.add(rateLimit, { only: ['posts'] })
}
```

Multiple rules can be stacked and they will be run in order:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth, { except: ['posts'] })
  rules.add(rateLimit, { only: ['posts'] })
}
```

Add a rule to all Services, but then skip for only `posts`:

```javascript
export const beforeResolver = (rules) => {
  rules.add(requireAuth)
  rules.skip({ only: ['posts'] })
}
```

Skip all rules no matter what—effectively makes everything *in*secure and its up to you to add checks in each individual Service function:

```javascript
export const beforeResolver = (rules) => {
  rules.skip()
}
```

A more complex combination:

```javascript
export const beforeResolver = (rules) => {
  rules.add([requireAuth, rateLimit, circularQueryCheck])
  rules.skip(cicularQueryCheck, { only: ['posts'] })
}
```

An even more complex combination:

```javascript
const verifyPost = (name, { input }) => {
  if (!input.title || input.title === '') {
    throw new UserInputError('Title is required')
  }
}

const verifyOwnership = (name, { id }) => {
  if (!currentUser.posts().map(p => p.id).includes(id)) {
    throw new UserInputError('User does not own this post')
  }
}
  
export const beforeResolver = (rules) => {
  rules.add(rateLimit)
  rules.add(() => requireAuth({ roles => ['admin'] }), { only: ['createPost', 'deletePost'] })
  rules.add(verifyPost, { only: ['createPost'] })
  rules.add(verifyOwnership, { only: ['deletePost'] })
  rules.add(circularQueryCheck, { only: ['posts'] })
}
```
