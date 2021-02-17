# Testing

Testing. For some it's an essential part of their development workflow. For others it's something they know they *should* do, but for whatever reason it hasn't grabbed their fancy yet. For still others it's something they ignore completely, hoping the whole concept will go away. But tests are here to stay, and maybe Redwood can change some opinions about testing being awesome and fun.

## Introduction to Testing

If you're already familiar with the ins and outs of testing and just want to know how to do it in Redwood, feel free to [skip ahead](#redwood-and-testing). Or, keep reading for a refresher.

The idea of testing is pretty simple: for each "unit" of code you write, you write additional code that exercises that unit and makes sure it works as expected. What's a "unit" of code? That's for you to decide: it could be an entire class, a single function, or even a single line! In general the smaller the unit of code that you're testing, the better. Your tests will stay fast and focused on just one thing, which makes them easy to update when you refactor your code. The important thing is that you start *somewhere* and codify your code's functionality in a repeatable, verifyable way.

### A Simple Test

Let's say we write a function that adds two numbers together:

```javascript
const add = (a, b) => {
  return a + b
}
```

You test this code by writing another piece of code which usually lives in a separate file and can be run in isolation, just including the functionality from the real codebase that you need in order to test it. For our examples here we'll put the code and its test side-by-side so that everything can be run at once. Our first test will call the `add()` function and make sure that what it does indeed add two numbers together as expected:

```javascript{5-9}
const add = (a, b) => {
  return a + b
}

if (add(1, 1) === 2) {
  console.log('pass')
} else {
  console.error('fail')
}
```

Pretty simple, right? The secret is that this simple check *is the basis of all testing*. Yes, that's it. So no matter how convoluted and theoretical the discussions on testing get, just remember that at the end of the day you're testing whether a condition is true or false.

You can [run that code with Node](https://nodejs.dev/learn/run-nodejs-scripts-from-the-command-line) or just copy/paste it into the [web console of a browser](https://developers.google.com/web/tools/chrome-devtools/console/javascript). You can also run it in a dedicated web development environment like JSFiddle. Switch to the **Javascript** tab to see the code:

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/2/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

(Note that you'll see `document.write()` in the JSFiddle examples instead of `console.log` so that you can actually see something in the **Result** tab, which is HTML output.)

You should see a "pass" written to the output. To verify that our test is working as expect, try changing the `+` in the `add()` function to a `-` (effectively turning it into a `subtract()` function) and run the test again. Now you should see "fail".

Let's get to some terminology:

* The entire code block that checks the functionality of `add()` is what's considered a single "test"
* The specific check that `add(1, 1) === 2` is known as an "assertion"
* The `add()` function itself is the "subject" of the test, or the code that is "under test"
* The value you expect to get (in our example, that's the number `2`) is sometimes called the "expected value"
* The value you actually get back (whatever the output of `add(1, 1)` is) is sometimes called the "actual value"
* The file that contains the test is a "test file"
* Mutliple test files, all run together, is known as a "test suite"
* You'll generally run your test files and suites by another piece of software: in the case of Redwood that's Jest, and it's known as a "test runner"

This is the basic idea behind all tests you will write: add some new code, and add another piece of code that uses the first and verifies that the result is what you expect.

Tests can also help drive new development. For example, what happens to our `add()` function if you leave out one of the arguments? We can drive these changes by writing a test of what we *want* to happen, and then modify the code that's being tested (the subject) to make it satisy the assertion(s) in a test.

So, what does happens if we leave off an argument when calling `add()`? Well, what do we *want* to happen? We'll answer that question by writing a test for what we expect. For this example let's have it throw an error. We'll write the test first that expects the error:

```javascript
try {
  add(1)
} catch (e) {
  if (e === 'add() requires two arguments') {
    console.log('pass')
  } else {
    console.error('fail')
  }
}
```

This is interesting because we actually *expect* an error to be thrown, but we don't want that error to stop the test suite in it's tracks—we want the error raises, we just want to make sure it's exactly what we expect it to be! So we'll surround the code that is going to error in a try/catch block and inspect the message on the error. If it's what we want, then the test actually passes.

Run this test and what happens? (If you previously made a change to `add()` to see the test fail, change it back now):

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/6/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

Where did *that* come from? Well, our subject `add()` didn't raise any errors (Javascript doesn't care about the number of arguments passed to a function) and so it tried to add `1` to `undefined`. We didn't think about that! Testing is already helping us catch edge cases.

To respond properly to this case in our test we'll make one slight modification: add another "fail" log message if the code somehow gets past the call to `add(1)` without throwing an error:

```javascript{3,8}
try {
  add(1)
  console.error('fail: no error thrown')
} catch (e) {
  if (e === 'add() requires two arguments') {
    console.log('pass')
  } else {
    console.error('fail: wrong error')
  }
}
```

Here we added a litle more information to the "fail" messages so we know which one we encountered. Try running that code again and you should see "fail: no error thrown" in the console.

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/7/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

Now we'll update `add()` to behave as we expect: by throwing an error if less than two arguments are passed.

```javascript
const add = (...nums) => {
  if (nums.length !== 2) {
    throw 'add() requires two arguments'
  }
  return nums[0] + nums[1]
}
```

Javascript doesn't have a simple way to check how many arguments were passed to a function, so we've converted the incoming arguments to an array via [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) and then we check the length of that instead.

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/10/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

Our tests are a little verbose (10 lines of code to test that the right number of arguments were sent in). Luckily, the test runner that Redwood uses, Jest, provides a simpler syntax for the same assertions. Here's the complete test file, but using Jest's provided helpers:

```javascript
describe('add()', () => {
  it('adds two numbers', () => {
    expect(add(1, 1)).toEqual(2)
  })

  it('throws an error on incorrect argument count', () => {
    expect(add(1)).toThrow('add requires 2 arguments')
  })
})
```

Jest lets us be very clear about our subject in the first argument to the `describe()` function, letting us know what we're testing. Likewise, each test is given a descriptive name as the first argument to the `it()` functions ("it" being the subject under test). Functions like `expect()` and `toEqual()` make it clear what values we expect to receive when running the test suite. If the expectation fails, Jest will indicate that in the output letting us know the name of the test that failed and what went wrong (the expected and actual values didn't match, or an error was thrown that we didn't expect).

Jest also has a nicer output than our cobbled together test runner using `console.log`:

![image](https://user-images.githubusercontent.com/300/105783200-c6974680-5f2a-11eb-98af-d1884ecf2f99.png)

Are you convinced? Let's keep going and see what Redwood brings to the table.

## Redwood and Testing

Redwood relies on several packages to do the heavy lifting, but many are wrapped in Redwood's own functionality which makes them even better suited to their individual jobs:

* Jest
* React Testing Library
* Mock Service Worker (MSW)

Redwood Generators get your test suite bootstrapped. Redwood also includes Storybook, which isn't technically a test suite, but can help in other ways.

Let's explore each one and how they're integrated with Redwood.

### Jest

[Jest](https://jestjs.io/) is the test runner that Redwood uses. By default, starting Jest will start a watch process that monitors your files for changes and re-runs the test(s) that are affected by that changed file (either the test itself, or the subject under test).

### React Testing Library

[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) is an extension of [DOM Testing Library](https://testing-library.com/docs/dom-testing-library/intro), adding functionality specifically for React. Using React Testing Library will let us render a single component in isolation and test that, for example, expected text is present or a certain HTML structure has been built.

### Mock Service Worker

Mock Service Worker (MSW) lets you simulate the response from API calls, among other things. This comes into play with Redwood where the web-side is constantly calling to the api-side in the form of GraphQL. Rather than make actual GraphQL calls, which would slow down the test suite and put a bunch of unrelated code under test, Redwood makes use of MSW to intercept GraphQL calls and return a canned response, which you include in your test.

### Redwood Generators

Redwood's generators will include test files for basic functionality automatically with any components, pages, cells, or services you generate. These will test very basic functionality, but they're a solid foundation and will not automatically break as soon as you start building out custom features.

### Storybook

Storybook itself doesn't appear to be related to testing at all—it's for building and styling components in isolation from your main application. But it can serve as a sanity check for an overlooked part of testing: the user interface. Your tests will only be as good as you write them, and testing things like the alignment of text on the page, the inclusion of images, or animation can be very difficult without investing huge amounts of time and effort. These tests are also very brittle since, depending on how they are written, can break without any code changes at all! Imagine an integration with a CMS that allows a marketing person to make text/style changes. These changes will probably not be covered in your test suite, but could make your site unusable depending on how bad they are.

Storybook can provide a quick way to inspect all visual aspects of your site without the tried-and-true method of having a QA person log in and exercise every possible function on the site. Unfortunately, checking those UI elements is not something that Storybook can automate for you, and so can't be part of a continuous integration system. But it makes it *possible* to do so, even if it currently requires a human touch.

## Testing Components

Let's start with the things you're probably most familiar with if you'd done any React work (with or without Redwood): components. The simplest test for a component would be matching against the exact HTML that's rendered by React (this doesn't actually work so don't bother trying):

```javascript
// web/src/components/Article/Article.js

const Article = ({ article }) => {
  return <article>{ article.title }</article>
}

// web/src/components/Article/Article.test.js
import { render } from '@redwoodjs/testing'
import Article from 'src/components/Article'

describe('Article', () => {
  it('renders an article', () => {
    expect(render(<Article article={ title: 'Foobar' } />))
      .toEqual('<article>Foobar</article>')
  })
})
```

This test (if it worked) would prove that you are indeed rendering an article. But it's also extremely brittle: any change to the component, even adding a `className` attribute for styling, will cause the test to break. That's not ideal, especially when you're just starting out building your components and will constantly be making changes as you improve them.

> Why do we keep saying this test won't work? Because as far as we can tell there's no easy way to simply render to a string. `render` actually returns an object that has several functions for testing different parts of the output. Those are what we'll look into in the next section.

In most cases you will want to exclude the design elements and structure of your components from your test. Then you're free to redesign the component all you want without also having to make the same changes to your test suite. Let's look at some of the functions that React Testing Library provides (they call them "[queries](https://testing-library.com/docs/queries/about/)") that let you check for *parts* of the rendered component, rather than a full string match.

### getByText()

In our **&lt;Article&gt;** component it seems like we really just want to test that the title of the product is rendered. *How* and *what it looks like* aren't really a concern for this test. Let's update the test to just check for the presence of the title itself:

```javascript{3,7-8}
// web/src/components/Article/Article.test.js

import { render, screen } from '@redwoodjs/testing'

describe('Article', () => {
  it('renders an article', () => {
    render(<Article article={ title: 'Foobar' } />)
    expect(screen.getByText('Foobar')).toBeInTheDocument()
  })
})
```

Note the additional `screen` import. This is a convience helper from React Testing Library (RTL) that automatically puts you in the `document.body` context before any of the following checks.

We can use `getByText()` to find text content anywhere in the rendered DOM nodes. `toBeInTheDocument()` is an [assertion](https://jestjs.io/docs/en/expect) added to Jest by RTL that returns true if the `getByText()` query finds the given text in the document.

So, the above test in plain English says "if there is any DOM node containing the text "Foobar" anywhere in the document, return true."

### queryByText()

Why not use `getByText()` for everything? Because it will raise an error if the text is *not* found in the document. That means if you want to explictly test that some text is NOT present, you can't—you'll always get an error.

Consider an update to our **&lt;Article&gt;** component:

```javascript
// web/src/components/Article/Article.js

import { Link, routes } from '@redwoodjs/router'

const Article = ({ article, summary }) => {
  return (
    <article>
      <h1>{article.title}</h1>
      <div>
        {summary ? article.body.substring(0, 100) + '...' : article.body}
        {summary && <Link to={routes.article(article.id)}>Read more</Link>}
      </div>
    </article>
  )
}

export default Article
```

If we're only displaying the summary of an article then we'll only show the first 100 characters with an ellipsis on the end ("...") and include a link to "Read more" to see the full article. A reasonable test for this component would be that when the `summary` prop is `true` then the "Read more" text should be present on in the component. If `summary` is `false` then it should *not* be present. That's where `queryByText()` comes in (relevant test lines are highlighted):

```javascript{15,19}
// web/src/components/Article/Article.test.js

import { render, screen } from '@redwoodjs/testing'
import Article from 'src/components/Article'

describe('Article', () => {
  const article = { id: 1, title: 'Foobar', body: 'Lorem ipsum...' }

  it('renders the title of an article', () => {
    render(<Article article={article} />)
    expect(screen.getByText('Foobar')).toBeInTheDocument()
  })
  it('renders a summary version', () => {
    render(<Article article={article} summary={true} />)
    expect(screen.getByText('Read more')).toBeInTheDocument()
  })
  it('renders a full version', () => {
    render(<Article article={article} summary={false} />)
    expect(screen.queryByText('Read more')).not.toBeInTheDocument()
  })
})
```

### Other Test Types

There are several other node/text types you can query against with RTL including `title`, `role` and `alt` attributes, form labels, placeholder text, and more. If you still can't access the node or text you're looking for there is a fallback attribute you can add to any DOM element and that can always be found: `data-testid` which you can access by `getByTestId`, `queryByTestId` and others (but it involves including that attribute in your rendered HTML always, not just when running the test suite).

Here's a cheatsheet from React Testing Library with the various permuations of `getBy`, `queryBy` and siblings: https://testing-library.com/docs/react-testing-library/cheatsheet/

In addition to testing for static things like text and attributes, you can also fire events and check that the DOM responds as expected. Read more about [user-events](https://testing-library.com/docs/ecosystem-user-event), [jest-dom](https://testing-library.com/docs/ecosystem-jest-dom) and more at the [official Testing Library docs site](https://testing-library.com/docs/).

### Mocking GraphQL Calls

If you are using GraphQL inside of your components you can mock them to return the exact response you want and then focus on the content of the component being correct based on that data. Returning to our **&lt;Article&gt;** component, let's make an update where only the `id` of the article is passed to the component as a prop and then the component itself is responsible for fetching the content from GraphQL:

> Normally we recommend using a cell for exactly this functionality, but for the sake of completeness we're showing how to test when doing GraphQL queries the manual way!

```javascript
// web/src/components/Article/Article.js

import { useQuery } from '@redwoodjs/web'

const GET_ARTICLE = gql`
  query getArticle($id: Int!) {
    article(id: $id) {
      id
      title
      body
    }
  }
`

const Article = ({ id }) => {
  const { data } = useQuery(GET_ARTICLE, { variables: { id } })

  if (data) {
    return (
      <article>
        <h1>{data.article.title}</h1>
        <div>{data.article.body}</div>
      </article>
    )
  } else {
    return 'Loading...'
  }
}

export default Article
```

Redwood provides a function `mockGraphQLQuery()` for providing the result of a given named GraphQL. In this case our query is named `getArticle` so we can mock that in our test as follows:

```javascript{8-16,19}
// web/src/components/Article/Article.test.js

import { render, screen } from '@redwoodjs/testing'
import Article from 'src/components/Article'

describe('Article', () => {
  it('renders the title of an article', async () => {
    mockGraphQLQuery('getArticle', (variables) => {
      return {
        article: {
          id: variables.id,
          title: 'Foobar',
          body: 'Lorem ipsum...',
        },
      }
    })

    render(<Article id={1} />)
    expect(await screen.findByText('Foobar')).toBeInTheDocument()
  })
})
```

We're using a new query here, `findByText()` which allows us to find things that may not be present in the first render of the component. In our case when the component first renders the data hasn't loaded yet, so it will render only "Loading..." which does *not* include the title of our article. So without `findByText()` the test will immediately fail. `findByText()` is smart and waits for subsequent renders or a maximum amount of time before giving up.

Note that you need to make the test function `async` and put an `await` before the `findByText()` call. Read more about `findBy*()` queries and the higher level `waitFor()` [here](https://testing-library.com/docs/dom-testing-library/api-async).

The function that's given as the second argument to `mockGraphQLQuery` will be sent a couple of arguments. The first, and only one we're using here, is `variables` which will contain the variables given to the query when `useQuery` was called. In this test we passed an `id` of `1` to the **&lt;Article&gt;** component when test rendering, so `variables` will contain `{id: 1}`. Using this variable in the callback function to `mockGraphQLQuery` allows us to reference those same variables in the body of our response. Here we're making sure that the returned article's `id` is the same as the one that was requested:

```javascript{3}
return {
  article: {
    id: variables.id,
    title: 'Foobar',
    body: 'Lorem ipsum...',
  }
}
```

Along with `variables` there is a second argument: an object which you can destructure a couple of properties from. One of them is `ctx` which is the context around the GraphQL response. One thing you can do with `ctx` is to simulate your GraphQL call returning an error:

```javascript
mockGraphQLQuery('getArticle', (variables, { ctx }) => {
  ctx.error({ message: 'Error' })
})
```

You could then test that you show a proper error message in your component:

```javascript{4,8-10,21,26}
// web/src/components/Article/Article.js

const Article = ({ id }) => {
  const { data, error } = useQuery(GET_ARTICLE, {
    variables: { id },
  })

  if (error) {
    return <div>Sorry, there was an error</div>
  }

  if (data) {
    // ...
  }
}

// web/src/components/Article/Article.test.js

it('renders an error message', async () => {
  mockGraphQLQuery('getArticle', (variables, { ctx }) => {
    ctx.error({ message: 'Error' })
  })

  render(<Article id={1} />)
  expect(await screen.findByText('Sorry, there was an error')).toBeInTheDocument()
})
```

Similar to how we mocked GraphQL queries, we can mock mutations as well. Read more about GraphQL mocking in our [Mocking GraphQL requests](/docs/mocking-graphql-requests.html) docs.

### Mocking currentUser

Most applications will eventually add [Authentication/Authorization](https://redwoodjs.com/docs/authentication) to the mix. How do we test that a component behaves a certain way when someone is logged in, or has a certain role?

Consider the following component (that happens to be a page) which displays a "welcome" message if the user is logged in, and a button to log in if they aren't:

```javascript
// web/src/pages/HomePage/HomePage.js

import { useAuth } from '@redwoodjs/auth'

const HomePage = () => {
  const { isAuthenticated, currentUser, logIn } = useAuth()

  return (
    <>
      <header>
        { isAuthenticated && <h1>Welcome back {currentUser.name}</h1> }
      </header>
      <main>
        { !isAuthenticated && <button onClick={logIn}>Login</button> }
      </main>
    </>
  )
}
```

If we didn't do anything special, there would be no user logged in and we could only ever test the not-logged-in state:

```javascript
// web/src/pages/HomePage/HomePage.test.js

import { render, screen } from '@redwoodjs/testing'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders a login button', () => {
    render(<HomePage />)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })
})
```

> `getByRole()` allows you to look up elements by their role, which is an ARIA element that assists in accessiblity features. Many HTML elements have a [default role](https://www.w3.org/TR/html-aria/#docconformance) (including `<button>`) but you can also fine it yourself with a `role` attribute.

This test is a little more explicit in that it expects an actual `<button>` element to exist and that it's label (name) be "Login". Being explicit with something as important as the login button can be a good idea, especially if you want to be sure that your site is friendly to screenreaders or another assitive browsing devices.

Now how do we test that when a user *is* logged in, it outputs a message welcoming them, and that the button is *not* present? Similar to `mockGraphQLQuery()` Redwood also provides a `mockCurrentUser()` which tells Redwood what to return when the `getCurrentUser()` function of `api/src/lib/auth.js` is invoked:

```javascript
// web/src/pages/HomePage/HomePage.test.js

import { render, screen, waitFor } from '@redwoodjs/testing'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders a login button when logged out', () => {
    render(<HomePage />)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('does not render a login button when logged in', async () => {
    mockCurrentUser({ name: 'Rob' })
    render(<HomePage />)
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Login' })
      ).not.toBeInTheDocument()
    })
  })

  it('renders a welcome message when logged in', async () => {
    mockCurrentUser({ name: 'Rob' })
    render(<HomePage />)
    expect(await screen.findByText('Welcome back Rob')).toBeInTheDocument()
  })
})
```

Here we call `mockCurrentUser()` before the `render()` call. Right now our code only references the `name` of the current user, but you would want this object to include everything a real user contains, maybe an `email` and an array of `roles`. In fact, by including a list of `roles`, you are also mocking out calls to `hasRole()` in your components so that they respond correctly as to whether `currentUser` has an expected role or not.

We also introduced a new function, `waitFor()` which will wait for render update before passing/failing the expectation. Although `findByRole()` will wait for an update, it will raise an error if the element is not found (similar to `getByRole()`). So here we had to switch to `queryByRole()` but that version isn't async, so we added `waitFor()` to get the async behavior back.

You may have noticed above that we created two tests, one for checking the button and one for checking the "welcome" message. This is a best practice in testing: keep your tests as small as possible and only testing one thing each. If you find that you're using the word "and" in the name of your test (like "does not render a login button *and* renders a welcome message") that's a sign that your test is doing too much.

We had to duplicate our `mockCurrentUser()` call and duplication is usually another sign that things can be refactored. In Jest you can nest `describe` blocks and include setup that is shared by the members of that block:

```javascript
describe('HomePage', () => {
  describe('logged out', () => {
    it('renders a login button when logged out', () => {
      render(<HomePage />)
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })
  })

  describe('log in', () => {
    beforeEach(() => {
      mockCurrentUser({ name: 'Rob' })
    })

    it('does not render a login button when logged in', async () => {
      render(<HomePage />)
      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'Login' })
        ).not.toBeInTheDocument()
      })
    })

    it('renders a welcome message when logged in', async () => {
      render(<HomePage />)
      expect(await screen.findByText('Welcome back Rob')).toBeInTheDocument()
    })
  })
})
```

However, nest with caution: the more deeply nested your tests are the harder it is to read through the file and figure out what's in scope and what's not by the time your actual test is invoked. In our test above, if you just focused on the last test, you would have no idea that `currentUser` is being mocked. Imagine a test file with dozens of tests and it becomes a chore to scroll through and mentally keep track of what variables are in scope as you look for nested `beforeEach()` blocks.

Some schools of thought say you should keep your test files flat (that is, no nesting) which trades ease of readibility and refactoring for duplication: each test is completely self contained and you know you can rely on just the code inside that test to determine what's in scope. It makes future test updates much easier. For what it's worth, your humble author endorses this view!

## Testing Pages & Layouts

Pages and Layouts are just regular components so all the same techniques apply!

## Testing Cells

Testing cells is very similar to testing components: something is rendered to the DOM and you generally want to make sure that certain expected elements are present.

Two situations make testing cells unique:

1. A single cell can export up to four separate components
2. There will always be a GraphQL query taking place

The first situation is really no different than regular component testing, you just test more than one component in your test. For example:

```javascript
// web/src/components/ArticleCell/ArticleCell.js

import Article from 'src/components/Article'

export const QUERY = gql`
  query GetArticle($id: Int!) {
    article(id: $id) {
      id
      title
      body
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => <div>Error: {error.message}</div>

export const Success = ({ article }) => {
  return <Article article={article} />
}
```

Here we're exporting four components and if you created this cell with the [cell generator](https://redwoodjs.com/docs/cli-commands.html#cell) then you'll already have four tests that make sure that each component renders without errors:

```javascript
// web/src/components/ArticleCell/ArticleCell.test.js

import { render, screen } from '@redwoodjs/testing'
import { Loading, Empty, Failure, Success } from './ArticleCell'
import { standard } from './ArticleCell.mock'

describe('ArticleCell', () => {
  it('renders Loading successfully', () => {
    expect(() => {
      render(<Loading />)
    }).not.toThrow()
  })

  it('renders Empty successfully', async () => {
    expect(() => {
      render(<Empty />)
    }).not.toThrow()
  })

  it('renders Failure successfully', async () => {
    expect(() => {
      render(<Failure error={new Error('Oh no')} />)
    }).not.toThrow()
  })

  it('renders Success successfully', async () => {
    expect(() => {
      render(<Success article={standard().article} />)
    }).not.toThrow()
  })
})
```

You might think that "rendering without errors" is a pretty lame test but this is actually a great start. In React something usually renders successfully or fails spectacularly, so here we're making sure that there are no obvious issues with each component.

You can expand on these tests by checking for certain text in each component is present, just as you would with a regular component test. But, if you're paying close attention you may have noticed something amiss: a cell runs a GraphQL query before rendering the **&lt;Success&gt;** component, but there's no `mockGraphQLQuery()` present in this test. How does that work? Enter **Cell Mocks**.

### Cell Mocks

To save you from having to write a custom `mockGraphQLQuery()` for each cell test, Redwood will do that for you. You just define the data that you want returned by the GraphQL queries, export the data from functions in a separate "mocks" file, and then tell each test which mock function's data you want to use.

Again, if you used the cell generator, you'll get a `mocks.js` file along with the cell component and the test file:

```javascript
// web/src/components/ArticleCell.mocks.js

export const standard = () => ({
  article: {
    id: 1,
    title: 'Foobar',
    body: 'Lorem ipsum...'
  }
})
```

Each mock will start with a `standard()` function which has special significance (more on that later). The return of this function is the data you want to be returned from the GraphQL `QUERY` defined at the top of your cell.

> Something to note is that the structure of the data returned by your `QUERY` and the structure of the object returned by the mock is in no way required to be identical as far as Redwood is concerned. You could be querying for an `article` but have the mock return an `animal` and the test will happily pass. Redwood just intercepts the GraphQL query and returns the mock data. This is something to keep in mind if you make major changes to your `QUERY`—be sure to make similar changes to your returned mock data or you could get falsely passing tests!

Once you start testing more scenarios you can add custom mocks functions with different names for use in your tests. For example, maybe you have a case where an article has no body, only a title, and you want to be sure that your component still renders correctly. You could create an additional mock that simulates this condition:

```javascript
// web/src/components/ArticleCell.mocks.js

export const standard = () => ({
  article: {
    id: 1,
    title: 'Foobar',
    body: 'Lorem ipsum...'
  }
})

export const missingBody = {
  article: {
    id: 2,
    title: 'Barbaz',
    body: null
  }
}
```

And then you just reference that new mock in your test:

```javascript
// web/src/components/ArticleCell/ArticleCell.test.js

import { render, screen } from '@redwoodjs/testing'
import { Loading, Empty, Failure, Success } from './ArticleCell'
import { standard, missingBody } from './ArticleCell.mock'

describe('ArticleCell', () => {
  /// other tests...

  it('Success renders successfully', async () => {
    expect(() => {
      render(<Success article={standard().article} />)
    }).not.toThrow()
  })


  it('Success renders successfully without a body', async () => {
    expect(() => {
      render(<Success article={missingBody.article} />)
    }).not.toThrow()
  })
})
```

Note that this second mock simply returns an object instead of a function. In the simplest case all you need your mock to return is an object. But there are cases where you may want to include logic in your mock, and in these cases you'll appreciate the function container. Especially in the following scenario...

### Testing Components That Include Cells and the `standard()` Mock

Consider the case where you have a page which renders a cell inside of it. You write a test for the page (using regular component testing techniques mentioned above). But if the page includes a cell, and a cell wants to run a GraphQL query, what happens when the page is rendered?

This is where the specially named `standard()` mock comes into play: the GraphQL query in the cell will be intercepted and the response will be *the content of the `standard()` mock*. This means that no matter how deeply nested your component/cell structure becomes, you can count on every cell in that stack rendering in a predictiable way.

And this is where `standard()` being a function becomes important. The GraphQL call is intercepted behind the scenes with the same `mockGraphQLQuery()` function we learned about [earlier](#mocking-graphql). And since it's using that same function, the second argument (the function which runs to return the mocked data) recieves the same arguments (`variables` and an object with keys like `ctx`).

So, all of that is to say that when `standard()` is called it will receive the variables and context that goes along with every GraphQL query, and you can make use of that data in the `standard()` mock. So that means it's possible to, for example, look at the `variables` that were passed in and conditionally return a different mock.

Perhaps you have a products page that renders either in stock or out of stock products. You could simulate one product that's in stock (has an `inventory > 0` and one that's out by checking for the id and returning in stock items for even numbered product ids and out of stock items for odd numbered:

```javascript
// web/src/components/ProductCell/ProductCell.mock.js

export const standard = (variables) => {
  if (variables.status === 'instock') {
    return {
      products: [
        {
          id: variables.id,
          name: 'T-shirt',
          inventory: 100
        }
      ]
    }
  } else {
    return {
      products: [
        {
          id: variables.id,
          title: 'Hat',
          inventory: 0
        }
      ]
    }
  }
})
```

Assuming you had a **&lt;ProductPage&gt;** component:

```javascript
// web/src/components/ProductCell/ProductCell.mock.js

import ProductCell from 'src/components/ProductCell'

const ProductPage = ({ status }) => {
  return {
    <div>
      <h1>{ status === 'instock' ? 'In Stock' : 'Out of Stock' }</h1>
      <ProductsCell status={status} />
    </div>
  }
}
```

Which, in your page test, would let you do something like:

```javascript
// web/src/pages/ProductPage/ProductPage.test.js

import { render, screen } from '@redwoodjs/testing'
import ArticleCell from 'src/components/ArticleCell'

describe('ProductPage', () => {
  it('renders in stock products', () => {
    render(<ProductPage status='instock' />)
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('renders out of stock products', async () => {
    render(<ProductPage status='outofstock' />)
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })
})
```

Be aware that if you do this, and continue to use the `standard()` mock in your regular cell tests, you'll either need to start passing in `variables` yourself:

```javascript{8}
// web/src/components/ArticleCell/ArticleCell.test.js

describe('ArticleCell', () => {
  /// other tests...

  test('Success renders successfully', async () => {
    expect(() => {
      render(<Success article={standard({ id: 1 }).article} />)
    }).not.toThrow()
  })
})
```

Or conditionally check that `variables` exists at all before basing any logic on them:

```javascript{4,15}
// web/src/components/ArticleCell/ArticleCell.mock.js

export const standard = (variables) => {
  if (variables && variables.id % 2 === 0) {
    return {
      article: {
        id: variables.id,
        title: 'Even article',
        body: 'Lorem ipsum...'
      }
    }
  } else {
    return {
      article: {
        id: variables?.id || 1,
        title: 'Odd article',
        body: 'Dolar sit amet...'
      }
    }
  }
})
```

## Testing Services

### The Test Database

### Scenarios
