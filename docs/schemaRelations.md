# Prisma Relations and Redwood's Scaffold Generator

Redwood utilizes Prisma for handling the database connection, migrations, and queries. The file to configure both the database connection and data structure is `api/prisma/schema.prisma` (For the full Prisma Schema documentation, [click here](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema).)

A typical `schema.prisma` includes many [data models](http://prisma.io/docs/reference/tools-and-interfaces/prisma-schema/models), which map to tables in a relational DB (and will map to collections in MongoDB). To create connections between these models, you'll need to use a powerful Prisma feature called *Relations*. The schema syntax for a Relation is `@relation`.

Before reading further, you should spend some time looking through the [Prisma Relations documentation](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations).

## Support for DB '@relations'

There are two important things to understand about the, ahem, relationship between Prisma Relations and Redwood Scaffold Generators:

1. As long as you are writing your own API Services and GraphQL SDL code, **you can use all Prisma Relations supported features in Redwood**!
2. Redwood's Scaffold Generator, for example `yarn rw g scaffold post`, will correctly generate the CRUD files for a data model that includes relations. **However, the generated code for models containing `@relation` will NOT work without manual modifications.**

> Note: the Scaffold generator uses both the SDL and Service generator. And the SDL generator uses the Service generator.

These generators *will* run correctly. However, when you try to use the associated CRUD UI (or your own UI, if applicable), you will encounter errors.

Admittedly, trips up a lot of people. And we are definitely working on it. But until the generators offer improved support, here's a guide to the manual modifications you'll need to make when using the Scaffold (or SDL or Service) Generator with models containing relations.

## The Problem with Scaffold Code

Redwood supports relationships in SDL files the way you’d expect. For example, you can write queries like this:

```jsx
posts {
  id
  title
  body
  user {
    name
    email
  }
}

```

And the Redwood SDL generator, which calls to the Service generator, will make this work.

**But when it comes to relationships between models in `schema.prisma`,** Prisma doesn’t allow you to save the foreign key field on any Scaffolds that you generate. (There's an [open GitHub Issue](https://github.com/prisma/prisma/issues/2152) about this on the Prisma repo. Maybe give it a nudge with an upvote?)

### Example Schema Using '@relation'

Note the `@relation` on `post.user` below:

```jsx
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id     Int     @id @default(autoincrement())
  title  String  @unique
  body   String
  user   User    @relation(fields: [userId], references: [id])
  userId Int
}

```

Using Redwood’s generators to build a CRUD scaffold for Post, you can successfully run `yarn rw g scaffold post`. But when you run `yarn rw dev`, and then try to create a new post and save from the UI, you’ll get an error.

Looking at the Service file the Redwood generator created, `api/src/service/posts.js`, here’s what the mutation looks like to create a new post:

```jsx
export const createPost = ({ input }) => {
  return db.post.create({
    data: input,
  })
}

```

And the corresponding `posts.sdl.js`:

```jsx
  type Post {
    id: Int!
    title: String!
    body: String!
    user: User!
    userId: Int!
  }

```

The issue is with Redwood’s use of `userID`. We are unable to create a new record by using the foreign key of another table. In this case, where `Post` has a `userId` column, we cannot just set the `userId` and save the record.

## Manual Workaround to Scaffold Relational Models

If you would still like to use Redwood’s generators for this type of schema, our very own **[@rob](https://community.redwoodjs.com/u/rob)** has devised a workaround, aka a Handy-Dandy-Hack™. You’ll need to use the following to modify your create and update functions in your Redwood generated Services by running `input` through this:

```jsx
const foreignKeyReplacement = (input) => {
  let output = input
  const foreignKeys = Object.keys(input).filter((k) => k.match(/Id$/))
  foreignKeys.forEach((key) => {
    const modelName = key.replace(/Id$/, '')
    const value = input[key]
    delete output[key]
    output = Object.assign(output, {
      [modelName]: { connect: { id: value } },
    })
  })
  return output
}

```

Applied to your own `posts.js`, your code would look like this:

```jsx
// api/src/services/posts/posts.jsimport { db } from 'src/lib/db'

// super hacky workaround function by @rob 🚀const foreignKeyReplacement = (input) => {
  let output = input
  const foreignKeys = Object.keys(input).filter((k) => k.match(/Id$/))
  foreignKeys.forEach((key) => {
    const modelName = key.replace(/Id$/, '')
    const value = input[key]
    delete output[key]
    output = Object.assign(output, {
      [modelName]: { connect: { id: value } },
    })
  })
  return output
}

...

// create Post example using the workaround export const createPost = ({ input }) => {
  return db.post.create({
    data: foreignKeyReplacement(input),
  })
}

...

```

> This is only a limited example for Post `create`. To fully implement this workaround, you will need to add this to all cases where you used the Generator on a model resulting in Service files with `create` and `update` functions.
