# Cells

Cells are a declarative approach to data fetching and one of Redwood's signature modes of abstraction. In a way, Cells create space: by providing conventions around data fetching, Redwood can get in between the request and the response and perform optimizations, all without you ever having to change your code.

While it might seem like there must be lot of magic involved, a Cell is actually just a [higher-order component](https://reactjs.org/docs/higher-order-components.html) that executes a GraphQL query and manages its lifecycle.
All the logic's actually in just one file: [createCell.tsx](https://github.com/redwoodjs/redwood/blob/main/packages/web/src/components/createCell.tsx).
The idea is that, by exporting named constants that match the parameters of `withCell`, Redwood can assemble this higher-order component out of these constants at build-time using a babel plugin!

All of this without writing a line of imperative code. Just say what is supposed to happen when, and Redwood will take care of the rest.

## Generating a Cell

You can generate a Cell with:

```terminal
yarn rw generate cell <name>
```

This creates the directory named `<name>Cell` in `web/src/components` with four files:

```terminal
~/redwood-app$ yarn rw generate cell user
yarn run v1.22.4
$ /redwood-app/node_modules/.bin/rw g cell user
  ✔ Generating cell files...
    ✔ Writing `./web/src/components/UserCell/UserCell.mock.js`...
    ✔ Writing `./web/src/components/UserCell/UserCell.stories.js`...
    ✔ Writing `./web/src/components/UserCell/UserCell.test.js`...
    ✔ Writing `./web/src/components/UserCell/UserCell.js`...
Done in 1.07s.
```

### Single Item Cell vs List Cell

Sometimes, you want a Cell that renders a single item, like the above example. At other times, you want a list of items.

The Redwood cell generator can do both for you, and detects if the `<name>` you pass is plural.

To generate a Cell that gets you a list of users, instead, you would simply run `yarn rw generate cell users`.

> For **irregular words** whose plural and singular is identical, such as *equipment* or *pokemon*, if you want a list simply specify the list flag: `yarn rw generate cell equipment --list`
## Cells in-depth

We'll go over each of these files in detail. But know that the file appended with just `.js` (in the example above, `UserCell.js`) contains all your Cell's logic.

Off the bat, this file exports five constants: `QUERY`, `Loading` , `Empty` , `Failure`  and `Success`. The root query in `QUERY` is the same as `<name>` so that, if you're generating a cell based on a model in your `schema.prisma`, you can get something out of the database right away. But there's a good chance you won't generate your Cell this way, so if you need to, make sure to change the root query. See the [Cells](https://redwoodjs.com/tutorial/cells#our-first-cell) section of the Tutorial for a great example of this.

## Usage

With Cells, you have a total of seven exports to work with:

| Name          | Type              | Description                                                  |
| :------------ | :---------------- | :----------------------------------------------------------- |
| `QUERY`       | `string|function` | The query to execute                                         |
| `beforeQuery` | `function`        | Lifecycle hook; prepares variables and options for the query |
| `afterQuery`  | `function`        | Lifecycle hook; sanitizes data returned from the query       |
| `Loading`     | `component`       | If the request is in flight, render this component           |
| `Empty`       | `component`       | If there's no data (`null` or `[]`), render this component   |
| `Failure`     | `component`       | If something went wrong, render this component               |
| `Success`     | `component`       | If the data has loaded, render this component                |

Only `QUERY` and `Success` are required. If you don't export `Empty`, empty results are sent to `Success`, and if you don't export `Failure`, error is output to the console.

`Loading`, `Empty`, `Failure`, and `Success` all have access to the same set of props, with `Failure` and `Success` getting exclusive access to `error` and `data` respectively. So, in addition to displaying the right component, a Cell funnels the right props to the right component.

This prop set is composed of 1) what's returned from Apollo Client's `Query` component, which is quite a few things&mdash;see their [API reference](https://www.apollographql.com/docs/react/api/react-components/#render-prop-function) for the full list (note that, as we just mentioned, `error` and `data` are only available to `Failure` and `Success` respectively. And Cells use `loading` to decide when to show `Loading`, so you don't get that one either)&mdash;and 2) props passed down from the parent component in good ol' React fashion.

### QUERY

`QUERY` can be a string or a function. Note that it's totally more than ok to have more than one root query. Here's an example of that:

```javascript{7-10}
export const QUERY = gql`{
  query {
    posts {
      id
      title
    }
    authors {
      id
      name
    }
  }
}
```

So in this case, both `posts` and `authors` would be available to `Success`:

```js
export const Success = ({ posts, authors }) => {
  // render logic with posts and authors
}
```

If `QUERY` is a function, it has to return a valid GraphQL syntax tree.
Use a function if your queries need to be more dynamic:

<!-- Source: https://community.redwoodjs.com/t/custom-github-jwt-auth-with-redwood-auth-advice-needed/610 -->
But what about variables? Well, Cells are setup to use any props they receive from their parent as variables (things are setup this way in `beforeQuery`). For example, here `BlogPostCell` takes a prop, `numberToShow`, so `numberToShow` is just available to your `QUERY`:

```javascript{7}
import BlogPostsCell from 'src/components/BlogPostsCell'

const HomePage = () => {
  return (
    <div>
      <h1>Home</h1>
      <BlogPostsCell numberToShow={3} />
    </div>
  )
}

export default HomePage
```

```javascript{2-3}
export const QUERY = gql`
  query($numberToShow: Int!) {
    posts(numberToShow: $numberToShow) {
      id
      title
    }
  }
`
```

This means you can think backwards about your Cell's props from your SDL: whatever the variables in your SDL are, that's what your Cell's props should be.

### beforeQuery

`beforeQuery` is a lifecycle hook. The best way to think about it is as an API for configuring Apollo Client's `Query` component (so you might want to check out Apollo's [docs](https://www.apollographql.com/docs/react/api/react-components/#query) for it).

By default, `beforeQuery` gives any props passed from the parent component to `Query` so that they're available as variables for `QUERY`. It'll also set the fetch & next-fetch policies to `'cache-and-network'` & `'cache-first'` since we felt that matched the behavior users want most of the time.

<!-- Source: https://github.com/redwoodjs/redwood/issues/717 -->
```javascript
export const beforeQuery = (props) => {
  return { variables: props, fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first' }
}
```

For example, if you wanted to turn on Apollo's polling option, and prevent caching, you could export something like this (see Apollo's docs on [polling](https://www.apollographql.com/docs/react/data/queries/#polling) and [caching](https://www.apollographql.com/docs/react/data/queries/#setting-a-fetch-policy))

<!-- Source: https://github.com/redwoodjs/redwood/issues/717 -->
```javascript
export const beforeQuery = (props) => {
  return { variables: props, fetchPolicy: 'no-cache', pollInterval: 2500 }
}
```

### afterQuery

`afterQuery` is a lifecycle hook. It runs just before data gets to `Success`.
Use it to sanitize data returned from `QUERY` before it gets there.

By default, `afterQuery` just returns the data as it is:

```javascript
export const afterQuery = (data) => ({...data})
```

### Loading

If the request is in flight, a Cell renders `Loading`.

For a production example, navigate to predictcovid.com, the first site made with Redwood. Usually, when you first navigate there, you'll see most of the dashboard spinning. Those are `Loading` components in action!

When you're developing locally, you can catch your Cell waiting to hear back for a moment if set your speed in the Inspector's **Network** tab to something like "Slow 3G".

But why bother with Slow 3G when Redwood comes with Storybook? Storybook makes developing components like `Loading` (and `Failure`) a breeze. We don't have to put up with hacky workarounds like Slow 3G or intentionally breaking our app just to develop our components.

### Empty

A Cell renders this component if there's no data.

What do we mean by no data? We mean if the response is 1) `null` or 2) an empty array (`[]`). There's actually four functions in [createCell.tsx](https://github.com/redwoodjs/redwood/blob/main/packages/web/src/components/createCell.tsx) dedicated just to figuring this out:

```javascript
// createCell.tsx

const isDataNull = (data: DataObject) => {
  return dataField(data) === null
}

const isDataEmptyArray = (data: DataObject) => {
  const field = dataField(data)
  return Array.isArray(field) && field.length === 0
}

const dataField = (data: DataObject) => {
  return data[Object.keys(data)[0]]
}

const isEmpty = (data: DataObject) => {
  return isDataNull(data) || isDataEmptyArray(data)
}
```

### Failure

A Cell renders this component if something went wrong. You can quickly see this in action (it's easy to break things) if you add a nonsense field to your `QUERY`:

```javascript{6}
const QUERY = gql`
  query {
    posts {
      id
      title
      nonsense
    }
  }
`
```

But, like `Loading`, Storybook is probably a better place to develop this.

<!-- In development, we have it so that errors blanket the page.
In production, failed cells won't break your app, they'll just be empty divs... -->

### Success

If everything went well, a Cell renders `Success`.

As mentioned, Success gets exclusive access to the `data` prop. But if you try to destructure it from props, you'll notice that it doesn't exist. This is because Redwood adds another layer of convenience: in [createCell.tsx](https://github.com/redwoodjs/redwood/blob/main/packages/web/src/components/createCell.tsx#L149), Redwood spreads `data` (using the spread operator, `...`) into `Success` so that you can just destructure whatever data you were expecting from your `QUERY` directly.

So, if you're querying for `posts` and `authors`, instead of doing:

```js
export const Success = ({ data }) => {
  const { posts, authors } = data

  // render logic with posts and authors
  ...
}
```

Redwood does:

```js
export const Success = ({ posts, authors }) => {
  // render logic with posts and authors
  ...
}
```

Note that you can still pass any other props to `Success`. After all, it's still just a React component.

### When should I use a Cell?

A good rule of thumb for when to use a Cell is if your component needs some data from a database or other service that may be delayed in responding. Let Redwood worry about juggling what is displayed when. You just focus on what those things should look like.

<!-- Source: https://github.com/redwoodjs/redwood/pull/413 -->
For one-off queries, there's always `useApolloClient`. This hook returns the client, which you can use to make queries:

```javascript
client = useApolloClient()
client.query({
  query: gql`
    ...
  `
})
```

### Can I Perform a Mutation in a Cell?

Absolutely. We do so in our [example todo app](https://github.com/redwoodjs/example-todo/blob/f29069c9dc89fa3734c6f99816442e14dc73dbf7/web/src/components/TodoListCell/TodoListCell.js#L26-L44).
We also don't think it's an anti-pattern to do so. Far from it—your cells might end up containing a lot of logic and really serve as the hub of your app in many ways.

It's also important to remember that, besides exporting certain things with certain names, there aren't many rules around Cells&mdash;everything you can do in a regular component still goes.

## How Does Redwood Know a Cell is a Cell?

You just have to end a filename in "Cell" right? Well, while that's basically correct, there is one other thing you should know.

Redwood looks for all files ending in "Cell" (so if you want your component to be a Cell, its filename does have to end in "Cell"), but if the file 1) doesn't export a const named `QUERY` and 2) has a default export, then it'll be skipped.

When would you want to do this? If you just want a file to end in "Cell" for some reason. Otherwise, don't worry about it!

<!-- Source: https://github.com/redwoodjs/redwood/pull/597 -->
<!-- Source: https://github.com/redwoodjs/redwood/pull/554 -->
<!-- Code: https://github.com/redwoodjs/redwood/blob/60cb628d5f369d62607fa2f47c694d9a5c00540d/packages/core/config/babel-preset.js#L132-L136 -->
<!-- Code: https://github.com/redwoodjs/redwood/blob/60cb628d5f369d62607fa2f47c694d9a5c00540d/packages/core/src/babel-plugin-redwood-cell.ts#L58-L60 -->

## Advanced Example: Implementing a Cell Yourself

If we didn't do all that built-time stuff for you, how might you go about implementing a Cell yourself?

Consider the [example from the Tutorial](https://learn.redwoodjs.com/docs/tutorial/cells#our-first-cell) where we're fetching posts:

```javascript
export const QUERY = gql`
  query {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>No posts yet!</div>

export const Failure = ({ error }) => (
  <div>Error loading posts: {error.message}</div>
)

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article>
      <h2>{post.title}</h2>
      <div>{post.body}</div>
    </article>
  ))
}
```

And now let's say that Babel isn't going to come along and assemble our exports into a higher-order component. What might we do?

We'd probably do something like this:

<!-- {35,39,44,47,49} -->
```javascript
const QUERY = gql`
  query {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

const Loading = () => <div>Loading...</div>

const Empty = () => <div>No posts yet!</div>

const Failure = ({ error }) => (
  <div>Error loading posts: {error.message}</div>
)

const Success = ({ posts }) => {
  return posts.map((post) => (
    <article>
      <h2>{post.title}</h2>
      <div>{post.body}</div>
    </article>
  ))
}

const isEmpty = (data) => {
  return isDataNull(data) || isDataEmptyArray(data)
}

export const Cell = () => {
  return (
    <Query query={QUERY}>
      {({ error, loading, data }) => {
        if (error) {
          if (Failure) {
            return <Failure error={error} />
          } else {
            console.error(error)
          }
        } else if (loading) {
          return <Loading />
        } else if (data) {
          if (typeof Empty !== 'undefined' && isEmpty(data)) {
            return <Empty />
          } else {
            return <Success {...data} />
          }
        } else {
          throw 'Cannot render Cell: graphQL success but `data` is null'
        }
      }}
    </Query>
  )
}
```

That's a lot of code. A lot of imperative code too.

We're basically just dumping the contents of [createCell.tsx](https://github.com/redwoodjs/redwood/blob/main/packages/web/src/components/createCell.tsx) into this file. Can you imagine having to do this every time you wanted to fetch data that might be delayed in responding? Yikes.
