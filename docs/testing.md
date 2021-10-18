# Testing

Testing. For some it's an essential part of their development workflow. For others it's something they know they *should* do, but for whatever reason it hasn't struck their fancy yet. For others still it's something they ignore completely, hoping the whole concept will go away. But tests are here to stay, and maybe Redwood can change some opinions about testing being awesome and fun.

## Introduction to Testing

If you're already familiar with the ins and outs of testing and just want to know how to do it in Redwood, feel free to [skip ahead](#redwood-and-testing). Or, keep reading for a refresher. In the following section, we'll build a simple test runner from scratch to help clarify the concepts of testing in our minds.

## Building a Test Runner

The idea of testing is pretty simple: for each "unit" of code you write, you write additional code that exercises that unit and makes sure it works as expected. What's a "unit" of code? That's for you to decide: it could be an entire class, a single function, or even a single line! In general, the smaller the unit, the better. Your tests will stay fast and focused on just one thing, which makes them easy to update when you refactor. The important thing is that you start *somewhere* and codify your code's functionality in a repeatable, verifiable way.

Let's say we write a function that adds two numbers together:

```javascript
const add = (a, b) => {
  return a + b
}
```

You test this code by writing another piece of code (which usually lives in a separate file and can be run in isolation), just including the functionality from the real codebase that you need for the test to run. For our examples here we'll put the code and its test side-by-side so that everything can be run at once. Our first test will call the `add()` function and make sure that it does indeed add two numbers together:

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

### Running a Test

You can [run that code with Node](https://nodejs.dev/learn/run-nodejs-scripts-from-the-command-line) or just copy/paste it into the [web console of a browser](https://developers.google.com/web/tools/chrome-devtools/console/javascript). You can also run it in a dedicated web development environment like JSFiddle. Switch to the **Javascript** tab below to see the code:

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/2/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

> Note that you'll see `document.write()` in the JSFiddle examples instead of `console.log`; this is just so that you can actually see something in the **Result** tab, which is HTML output.

You should see "pass" written to the output. To verify that our test is working as expected, try changing the `+` in the `add()` function to a `-` (effectively turning it into a `subtract()` function) and run the test again. Now you should see "fail".

### Terminology

Let's get to some terminology:

* The entire code block that checks the functionality of `add()` is what's considered a single **test**
* The specific check that `add(1, 1) === 2` is known as an **assertion**
* The `add()` function itself is the **subject** of the test, or the code that is **under test**
* The value you expect to get (in our example, that's the number `2`) is sometimes called the **expected value**
* The value you actually get (whatever the output of `add(1, 1)` is) is sometimes called the **actual** or **received value**
* The file that contains the test is a **test file**
* Multiple test files, all run together, is known as a **test suite**
* You'll generally run your test files and suites with another piece of software. In Redwood that's Jest, and it's known as a **test runner**
* The amount of code you have that is exercised by tests is referred to as **coverage** and is usually reported as a percentage. If every single line of code is touched as a result of running your test suite then you have 100% coverage!

This is the basic idea behind all the tests you'll write: when you add code, you'll add another piece of code that uses the first and verifies that the result is what you expect.

Tests can also help drive new development. For example, what happens to our `add()` function if you leave out one of the arguments? We can drive these changes by writing a test of what we *want* to happen, and then modify the code that's being tested (the subject) to make it satisfy the assertion(s).

### Expecting Errors

So, what does happen if we leave off an argument when calling `add()`? Well, what do we *want* to happen? We'll answer that question by writing a test for what we expect. For this example let's have it throw an error. We'll write the test first that expects the error:

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

This is interesting because we actually *expect* an error to be thrown, but we don't want that error to stop the test suite in it's tracks—we want the error to be raised, we just want to make sure it's exactly what we expect it to be! So we'll surround the code that's going to error in a try/catch block and inspect the error message. If it's what we want, then the test actually passes.

> Remember: we're testing for what we *want* to happen. Usually you think of errors as being "bad" but in this case we *want* the code to throw an error, so if it does, that's actually good! Raising an error passes the test, not raising the error (or raising the wrong error) is a failure.

Run this test and what happens? (If you previously made a change to `add()` to see the test fail, change it back now):

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/6/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

Where did *that* come from? Well, our subject `add()` didn't raise any errors (Javascript doesn't care about the number of arguments passed to a function) and so it tried to add `1` to `undefined`, and that's Not A Number. We didn't think about that! Testing is already helping us catch edge cases.

To respond properly to this case we'll make one slight modification: add another "fail" log message if the code somehow gets past the call to `add(1)` *without* throwing an error:

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

We also added a little more information to the "fail" messages so we know which one we encountered. Try running that code again and you should see "fail: no error thrown" in the console.

<iframe width="100%" height="300" src="//jsfiddle.net/cannikin/mgy4ja1q/7/embedded/result,js/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0" class="border"></iframe>

Now we'll actually update `add()` to behave as we expect: by throwing an error if less than two arguments are passed.

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

We've covered passing too few arguments, what if we pass too many? We'll leave writing that test as homework, but you should have everything you need, and you won't even need any changes to the `add()` function to make it work!

### Our Test Runner Compared to Jest

Our tests are a little verbose (10 lines of code to test that the right number of arguments were passed). Luckily, the test runner that Redwood uses, Jest, provides a simpler syntax for the same assertions. Here's the complete test file, but using Jest's provided helpers:

```javascript
describe('add()', () => {
  it('adds two numbers', () => {
    expect(add(1, 1)).toEqual(2)
  })

  it('throws an error for too few arguments', () => {
    expect(() => add(1)).toThrow('add requires 2 arguments')
  })
})
```

Jest lets us be very clear about our subject in the first argument to the `describe()` function, letting us know what we're testing. Note that it's just a string and doesn't have to be exactly the same as the function/class you're testing (but usually is for clarity).

Likewise, each test is given a descriptive name as the first argument to the `it()` functions ("it" being the subject under test). Functions like `expect()` and `toEqual()` make it clear what values we expect to receive when running the test suite. If the expectation fails, Jest will indicate that in the output letting us know the name of the test that failed and what went wrong (the expected and actual values didn't match, or an error was thrown that we didn't expect).

Jest also has a nicer output than our cobbled-together test runner using `console.log`:

![image](https://user-images.githubusercontent.com/300/105783200-c6974680-5f2a-11eb-98af-d1884ecf2f99.png)

Are you convinced? Let's keep going and see what Redwood brings to the table.

## Redwood and Testing

Redwood relies on several packages to do the heavy lifting, but many are wrapped in Redwood's own functionality which makes them even better suited to their individual jobs:

* [Jest](https://jestjs.io/)
* [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
* [Mock Service Worker](https://mswjs.io/) or **msw** for short.

Redwood Generators get your test suite bootstrapped. Redwood also includes [Storybook](https://storybook.js.org/), which isn't technically a test suite, but can help in other ways.

Let's explore each one and how they're integrated with Redwood.

### Jest

[Jest](https://jestjs.io/) is Redwood's test runner. By default, starting Jest via `yarn rw test` will start a watch process that monitors your files for changes and re-runs the test(s) that are affected by that changed file (either the test itself, or the subject under test).

### React Testing Library

[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) is an extension of [DOM Testing Library](https://testing-library.com/docs/dom-testing-library/intro), adding functionality specifically for React. React Testing Library lets us render a single component in isolation and test that expected text is present or a certain HTML structure has been built.

### Mock Service Worker

Among other things, Mock Service Worker (msw) lets you simulate the response from API calls. Where this comes into play with Redwood is how the web-side constantly calls to the api-side using GraphQL: rather than make actual GraphQL calls, which would slow down the test suite and put a bunch of unrelated code under test, Redwood uses MSW to intercept GraphQL calls and return a canned response, which you include in your test.

### Storybook

Storybook itself doesn't appear to be related to testing at all—it's for building and styling components in isolation from your main application—but it can serve as a sanity check for an overlooked part of testing: the user interface. Your tests will only be as good as you write them, and testing things like the alignment of text on the page, the inclusion of images, or animation can be very difficult without investing huge amounts of time and effort. These tests are also very brittle since, depending on how they're written, they can break without any code changes at all! Imagine an integration with a CMS that allows a marketing person to make text/style changes. These changes will probably not be covered by your test suite, but could make your site unusable depending on how bad they are.

Storybook can provide a quick way to inspect all visual aspects of your site without the tried-and-true method of having a QA person log in and exercise every possible function. Unfortunately, checking those UI elements is not something that Storybook can automate for you, and so can't be part of a continuous integration system. But it makes it *possible* to do so, even if it currently requires a human touch.

### Redwood Generators

Redwood's generators will include test files for basic functionality automatically with any Components, Pages, Cells, or Services you generate. These will test very basic functionality, but they're a solid foundation and will not automatically break as soon as you start building out custom features.

## Test Commands

You can use a single command to run your entire suite :

```terminal
yarn rw test
```

This will start Jest in "watch" mode which will continually run and monitor the file system for changes. If you change a test or the component that's being tested, Jest will re-run any associated test file. This is handy when you're spending the afternoon writing tests and always want to verify the code you're adding without swapping back and forth to a terminal and pressing `↑` `Enter` to run the last command again.

To start the process without watching, add the `--no-watch` flag:

```terminal
yarn rw test --no-watch
```

This one is handy before committing some changes to be sure you didn't inadvertently break something you didn't expect, or before a deploy to production.


### Filtering what tests to run

You can run only the web- or api-side test suites by including the side as another argument to the command:

```terminal
yarn rw test web
yarn rw test api
```

Let's say you have a test file called `CommentForm.test.js`. In order to only watch and run tests in this file you can run

```terminal
yarn rw test CommentForm
```

If you need to be more specific, you can combine side filters, with other filters

```terminal
yarn rw test api Comment
```
which will only run test specs matching "Comment" in the API side

## Testing Components

Let's start with the things you're probably most familiar with if you've done any React work (with or without Redwood): components. The simplest test for a component would be matching against the exact HTML that's rendered by React (this doesn't actually work so don't bother trying):

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

### Queries

In most cases you will want to exclude the design elements and structure of your components from your test. Then you're free to redesign the component all you want without also having to make the same changes to your test suite. Let's look at some of the functions that React Testing Library provides (they call them "[queries](https://testing-library.com/docs/queries/about/)") that let you check for *parts* of the rendered component, rather than a full string match.

#### getByText()

In our **&lt;Article&gt;** component it seems like we really just want to test that the title of the product is rendered. *How* and *what it looks like* aren't really a concern for this test. Let's update the test to just check for the presence of the title itself:

```javascript{3,7-9}
// web/src/components/Article/Article.test.js

import { render, screen } from '@redwoodjs/testing'

describe('Article', () => {
  it('renders an article', () => {
    render(<Article article={ title: 'Foobar' } />)

    expect(screen.getByText('Foobar')).toBeInTheDocument()
  })
})
```

Note the additional `screen` import. This is a convenience helper from React Testing Library that automatically puts you in the `document.body` context before any of the following checks.

We can use `getByText()` to find text content anywhere in the rendered DOM nodes. `toBeInTheDocument()` is a [matcher](https://jestjs.io/docs/en/expect) added to Jest by React Testing Library that returns true if the `getByText()` query finds the given text in the document.

So, the above test in plain English says "if there is any DOM node containing the text 'Foobar' anywhere in the document, return true."

#### queryByText()

Why not use `getByText()` for everything? Because it will raise an error if the text is *not* found in the document. That means if you want to explicitly test that some text is *not* present, you can't—you'll always get an error.

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

If we're only displaying the summary of an article then we'll only show the first 100 characters with an ellipsis on the end ("...") and include a link to "Read more" to see the full article. A reasonable test for this component would be that when the `summary` prop is `true` then the "Read more" text should be present. If `summary` is `false` then it should *not* be present. That's where `queryByText()` comes in (relevant test lines are highlighted):

```javascript{18,24}
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

#### getByRole() / queryByRole()

`getByRole()` allows you to look up elements by their "role", which is an ARIA element that assists in accessibility features. Many HTML elements have a [default role](https://www.w3.org/TR/html-aria/#docconformance) (including `<button>` and `<a>`) but you can also define one yourself with a `role` attribute on an element.

Sometimes it may not be enough to say "this text must be on the page." You may want to test that an actual *link* is present on the page. Maybe you have a list of users' names and each name should be a link to a detail page. We could test that like so:

```javascript
it('renders a link with a name', () => {
  render(<List data={[{ name: 'Rob' }, { name: 'Tom' }]} />)

  expect(screen.getByRole('link', { name: 'Rob' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Tom' })).toBeInTheDocument()
})
```

`getByRole()` expects the role (`<a>` elements have a default role of `link`) and then an object with options, one of which is `name` which refers to the text content inside the element. Check out [the docs for the `*ByRole` queries](https://testing-library.com/docs/queries/byrole).

If we wanted to eliminate some duplication (and make it easy to expand or change the names in the future):

```javascript
it('renders a link with a name', () => {
  const data = [{ name: 'Rob' }, { name: 'Tom' }]

  render(<List data={data} />)

  data.forEach((datum) => {
    expect(screen.getByRole('link', { name: data.name })).toBeInTheDocument()
  })
})
```

But what if we wanted to check the `href` of the link itself to be sure it's correct? In that case we can capture the `screen.getByRole()` return and run expectations on that as well (the `forEach()` loop has been removed here for simplicity):

```javascript{2,6-8}
import { routes } from '@redwoodjs/router'

it('renders a link with a name', () => {
  render(<List data={[{ id: 1, name: 'Rob' }]} />)

  const element = screen.getByRole('link', { name: data.name })
  expect(element).toBeInTheDocument()
  expect(element).toHaveAttribute('href', routes.user({ id: data.id }))
})
```

> **Why so many empty lines in the middle of the test?**
>
> You may have noticed a pattern of steps begin to emerge in your tests:
>
> 1. Set variables or otherwise prepare some code
> 2. `render` or execute the function under test
> 3. `expect`s to verify output
>
> Most tests will contain at least the last two, but sometimes all three of these parts, and in some communities it's become standard to include a newline between each "section". Remember the acronym SEA: setup, execute, assert.

#### Other Queries/Matchers

There are several other node/text types you can query against with React Testing Library, including `title`, `role` and `alt` attributes, form labels, placeholder text, and more. If you still can't access the node or text you're looking for there's a fallback attribute you can add to any DOM element that can always be found: `data-testid` which you can access using `getByTestId`, `queryByTestId` and others (but it involves including that attribute in your rendered HTML always, not just when running the test suite).

Here's a cheatsheet from React Testing Library with the various permutations of `getBy`, `queryBy` and siblings: https://testing-library.com/docs/react-testing-library/cheatsheet/

The full list of available matchers like `toBeInTheDocument()` and `toHaveAttribute()` don't seem to have nice docs on the Testing Library site, but you can find them in the [README](https://github.com/testing-library/jest-dom) inside the main repo.

In addition to testing for static things like text and attributes, you can also fire events and check that the DOM responds as expected. Read more about [user-events](https://testing-library.com/docs/ecosystem-user-event), [jest-dom](https://testing-library.com/docs/ecosystem-jest-dom) and more at the [official Testing Library docs site](https://testing-library.com/docs/).

### Mocking GraphQL Calls

If you're using GraphQL inside your components, you can mock them to return the exact response you want and then focus on the content of the component being correct based on that data. Returning to our **&lt;Article&gt;** component, let's make an update where only the `id` of the article is passed to the component as a prop and then the component itself is responsible for fetching the content from GraphQL:

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

#### mockGraphQLQuery()

Redwood provides the test function `mockGraphQLQuery()` for providing the result of a given named GraphQL. In this case our query is named `getArticle` and we can mock that in our test as follows:

```javascript{8-16,20}
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
        }
      }
    })

    render(<Article id={1} />)

    expect(await screen.findByText('Foobar')).toBeInTheDocument()
  })
})
```

We're using a new query here, `findByText()`, which allows us to find things that may not be present in the first render of the component. In our case, when the component first renders, the data hasn't loaded yet, so it will render only "Loading..." which does *not* include the title of our article. Without it the test would immediately fail, but `findByText()` is smart and waits for subsequent renders or a maximum amount of time before giving up.

Note that you need to make the test function `async` and put an `await` before the `findByText()` call. Read more about `findBy*()` queries and the higher level `waitFor()` utility [here](https://testing-library.com/docs/dom-testing-library/api-async).

The function that's given as the second argument to `mockGraphQLQuery` will be sent a couple of arguments. The first&mdash;and only one we're using here&mdash;is `variables` which will contain the variables given to the query when `useQuery` was called. In this test we passed an `id` of `1` to the **&lt;Article&gt;** component when test rendering, so `variables` will contain `{id: 1}`. Using this variable in the callback function to `mockGraphQLQuery` allows us to reference those same variables in the body of our response. Here we're making sure that the returned article's `id` is the same as the one that was requested:

```javascript{3}
return {
  article: {
    id: variables.id,
    title: 'Foobar',
    body: 'Lorem ipsum...',
  }
}
```

Along with `variables` there is a second argument: an object which you can destructure a couple of properties from. One of them is `ctx` which is the context around the GraphQL response. One thing you can do with `ctx` is simulate your GraphQL call returning an error:

```javascript
mockGraphQLQuery('getArticle', (variables, { ctx }) => {
  ctx.error({ message: 'Error' })
})
```

You could then test that you show a proper error message in your component:

```javascript{4,8-10,21,27}
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

#### mockGraphQLMutation()

Similar to how we mocked GraphQL queries, we can mock mutations as well. Read more about GraphQL mocking in our [Mocking GraphQL requests](/docs/mocking-graphql-requests.html) docs.

### Mocking Auth

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

This test is a little more explicit in that it expects an actual `<button>` element to exist and that it's label (name) be "Login". Being explicit with something as important as the login button can be a good idea, especially if you want to be sure that your site is friendly to screen-readers or another assistive browsing devices.

#### mockCurrentUser() on the Web-side

How do we test that when a user *is* logged in, it outputs a message welcoming them, and that the button is *not* present? Similar to `mockGraphQLQuery()` Redwood also provides a `mockCurrentUser()` which tells Redwood what to return when the `getCurrentUser()` function of `api/src/lib/auth.js` is invoked:

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

Here we call `mockCurrentUser()` before the `render()` call. Right now our code only references the `name` of the current user, but you would want this object to include everything a real user contains, maybe an `email` and an array of `roles`.

We introduced `waitFor()` which waits for a render update before passing/failing the expectation. Although `findByRole()` will wait for an update, it will raise an error if the element is not found (similar to `getByRole()`). So here we had to switch to `queryByRole()`, but that version isn't async, so we added `waitFor()` to get the async behavior back.

> Figuring out which assertions need to be async and which ones don't can be frustrating, we know. If you get a failing test when using `screen` you'll see the output of the DOM dumped along with the failure message, which helps find what went wrong. You can see exactly what the test saw (or didn't see) in the DOM at the time of the failure.
>
> If you see some text rendering that you're sure shouldn't be there (because maybe you have a conditional around whether or not to display it) this is a good indication that the test isn't waiting for a render update that would cause that conditional to render the opposite output. Change to a `findBy*` query or wrap the `expect()` in a `waitFor()` and you should be good to go!

You may have noticed above that we created two tests, one for checking the button and one for checking the "welcome" message. This is a best practice in testing: keep your tests as small as possible by only testing one "thing" in each. If you find that you're using the word "and" in the name of your test (like "does not render a login button *and* renders a welcome message") that's a sign that your test is doing too much.

#### Mocking Roles

By including a list of `roles` in the object returned from `mockCurrentUser()` you are also mocking out calls to `hasRole()` in your components so that they respond correctly as to whether `currentUser` has an expected role or not.

Given a component that does something like this:

```javascript
const { currentUser, hasRole } = useAuth()

return (
  { hasRole('admin') && <button onClick={deleteUser}>Delete User</button> }
)
```

You can test both cases (user does and does not have the "admin" role) with two separate mocks:

```javascript
mockCurrentUser({ roles: ['admin'] })
mockCurrentUser({ roles: [] })
```

That's it!

### Handling Duplication

We had to duplicate the `mockCurrentUser()` call and duplication is usually another sign that things can be refactored. In Jest you can nest `describe` blocks and include setup that is shared by the members of that block:

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

      render(<HomePage />)
    })

    it('does not render a login button when logged in', async () => {
      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'Login' })
        ).not.toBeInTheDocument()
      })
    })

    it('renders a welcome message when logged in', async () => {
      expect(await screen.findByText('Welcome back Rob')).toBeInTheDocument()
    })
  })
})
```

While the primordial developer inside of you probably breathed a sign of relief seeing this refactor, heed this warning: the more deeply nested your tests become, the harder it is to read through the file and figure out what's in scope and what's not by the time your actual test is invoked. In our test above, if you just focused on the last test, you would have no idea that `currentUser` is being mocked. Imagine a test file with dozens of tests and multiple levels of nested `describe`s&mdash;it becomes a chore to scroll through and mentally keep track of what variables are in scope as you look for nested `beforeEach()` blocks.

Some schools of thought say you should keep your test files flat (that is, no nesting) which trades ease of readability for duplication: when flat, each test is completely self contained and you know you can rely on just the code inside that test to determine what's in scope. It makes future test modifications easier because each test only relies on the code inside of itself. You may get nervous thinking about changing 10 identical instances of `mockCurrentUser()` but that kind of thing is exactly what your IDE is good at!

> For what it's worth, your humble author endorses the flat tests style.

## Testing Pages & Layouts

Pages and Layouts are just regular components so all the same techniques apply!

## Testing Cells

Testing Cells is very similar to testing components: something is rendered to the DOM and you generally want to make sure that certain expected elements are present.

Two situations make testing Cells unique:

1. A single Cell can export up to four separate components
2. There's a GraphQL query taking place

The first situation is really no different than regular component testing: you just test more than one component in your test. For example:

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

Here we're exporting four components and if you created this Cell with the [Cell generator](https://redwoodjs.com/docs/cli-commands.html#cell) then you'll already have four tests that make sure that each component renders without errors:

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

You might think that "rendering without errors" is a pretty lame test, but it's actually a great start. In React something usually renders successfully or fails spectacularly, so here we're making sure that there are no obvious issues with each component.

You can expand on these tests just as you would with a regular component test: by checking that certain text in each component is present.

### Cell Mocks

When the **&lt;Success&gt;** component is tested, what's this `standard()` function that's passed as the `article` prop?

If you used the Cell generator, you'll get a `mocks.js` file along with the cell component and the test file:

```javascript
// web/src/components/ArticleCell.mocks.js

export const standard = () => ({
  article: {
    id: 42,
  }
})
```

Each mock will start with a `standard()` function which has special significance (more on that later). The return of this function is the data you want to be returned from the GraphQL `QUERY` defined at the top of your cell.

> Something to note is that the structure of the data returned by your `QUERY` and the structure of the object returned by the mock is in no way required to be identical as far as Redwood is concerned. You could be querying for an `article` but have the mock return an `animal` and the test will happily pass. Redwood just intercepts the GraphQL query and returns the mock data. This is something to keep in mind if you make major changes to your `QUERY`—be sure to make similar changes to your returned mock data or you could get falsely passing tests!

Why not just include this data inline in the test? We're about to reveal the answer in the next section, but before we do just a little more info about working with these `mocks.js` file...

Once you start testing more scenarios you can add custom mocks with different names for use in your tests. For example, maybe you have a case where an article has no body, only a title, and you want to be sure that your component still renders correctly. You could create an additional mock that simulates this condition:

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

### Testing Components That Include Cells

Consider the case where you have a page which renders a cell inside of it. You write a test for the page (using regular component testing techniques mentioned above). But if the page includes a cell, and a cell wants to run a GraphQL query, what happens when the page is rendered?

This is where the specially named `standard()` mock comes into play: the GraphQL query in the cell will be intercepted and the response will be *the content of the `standard()` mock*. This means that no matter how deeply nested your component/cell structure becomes, you can count on every cell in that stack rendering in a predictable way.

And this is where `standard()` being a function becomes important. The GraphQL call is intercepted behind the scenes with the same `mockGraphQLQuery()` function we learned about [earlier](#mocking-graphql). And since it's using that same function, the second argument (the function which runs to return the mocked data) receives the same arguments (`variables` and an object with keys like `ctx`).

So, all of that is to say that when `standard()` is called it will receive the variables and context that goes along with every GraphQL query, and you can make use of that data in the `standard()` mock. That means it's possible to, for example, look at the `variables` that were passed in and conditionally return a different object.

Perhaps you have a products page that renders either in stock or out of stock products. You could inspect the `status` that's passed into via `variables.status` and return a different inventory count depending on whether the calling code wants in-stock or out-of-stock items:

```javascript
// web/src/components/ProductCell/ProductCell.mock.js

export const standard = (variables) => {
  return {
    products: [
      {
        id: variables.id,
        name: 'T-shirt',
        inventory: variables.status === 'instock' ? 100 : 0
      }
    ]
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
      render(<Success article={standard({ status: 'instock' }).article} />)
    }).not.toThrow()
  })
})
```

Or conditionally check that `variables` exists at all before basing any logic on them:

```javascript{4,15}
// web/src/components/ArticleCell/ArticleCell.mock.js

export const standard = (variables) => {
  return {
    product: {
      id: variables?.id || 1,
      name: 'T-shirt',
      inventory: variables && variables.status === 'instock' ? 100 : 0
    }
  }
})
```

## Testing Forms

> An alternative explanation, written in TypeScript and featuring a Storybook example, [can be found on the RedwoodJS forum](https://community.redwoodjs.com/t/testing-forms-using-testing-library-user-event/2058).

To test our forms, we can make use of of the [`@testing-library/user-event`](https://testing-library.com/docs/ecosystem-user-event/) library which helps us approximate the the events that would actually happen in the browser if a real user were interacting with our forms. For example, calling `userEvent.click(checkbox)` toggles a checkbox as if a user had clicked it.

### Installing `@testing-library/user-event`

`user-event` can be installed in the web side of your application by running:

```bash
yarn workspace web add -D @testing-library/user-event

> `@testing-library/dom`, `user-event's` dependency, is already provided by Redwood.

### Building a Form

Let's assume you've already created a component using `yarn rw g component`. This component is built using the `@redwoodjs/forms` package and provides a simple interface for using the form: we subscribe to changes via an `onSubmit` callback-prop.

```javascript
// NameForm.js
import { Form, Submit, TextField } from '@redwoodjs/forms'

const NameForm = ({ onSubmit }) => {
  return (
    <Form onSubmit={onSubmit}>
      <TextField
        name="name"
        placeholder="Name"
        validation={{
          required: true,
        }}
      />
      <TextField
        name="nickname"
        placeholder="Nickname"
        validation={{
          required: false,
        }}
      />
      <Submit>Submit</Submit>
    </Form>
  )
}

export default NameForm
```

### Testing the Form

Now, we can extend the `test` file which Redwood generated. We're going to want to:

1) Import `waitFor` from the `@redwoodjs/testing` library.
2) Add an import to `@testing-library/user-event` for its `default`.
3) Provide an `onSubmit` prop to our "renders successfully" test.

```javascript
// NameForm.test.js
import { render, screen, waitFor } from '@redwoodjs/testing'
import userEvent from '@testing-library/user-event'

import NameForm from './NameForm'

describe('NameForm', () => {
  it('renders successfully', () => {
    expect(() => {
      const onSubmit = jest.fn()

      render(<NameForm onSubmit={onSubmit} />)
    }).not.toThrow()
  })
})
```

Finally, we'll create three simple tests which ensure our form works as expected.

1) Does our component NOT submit when required fields are empty?
2) Does our component submit when required fields are populated?
3) Does our component submit, passing our (submit) handler the data we entered?

The important takeaways are:

* We use `await` because our form's state will change multiple times; otherwise, our `expect`-ation would trigger prematurely.
* We use `waitFor` because `user-event`'s methods are synchronous, which contradicts the above.
  * `waitFor` acts as our declaration of [`act`](https://reactjs.org/docs/test-utils.html#act), required when updating the state of a React component from a test.

```javascript
// NameForm.test.js
import { render, screen, waitFor } from '@redwoodjs/testing'
import userEvent from '@testing-library/user-event'

import NameForm from './NameForm'

describe('NameForm', () => {

  it('does not submit when required fields are empty', async () => {
    const onSubmit = jest.fn()

    render(<NameForm onSubmit={onSubmit} />)

    const submitButton = screen.getByText('Submit')

    await waitFor(() => userEvent.click(submitButton))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits when required fields are entered', async () => {
    const name = 'My Name'
    const nickname = ''

    const onSubmit = jest.fn()

    render(<NameForm onSubmit={onSubmit} />)

    const nameField = screen.getByPlaceholderText('Name')
    const submitButton = screen.getByText('Submit')

    await waitFor(() => userEvent.type(nameField, name))
    await waitFor(() => userEvent.click(submitButton))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(
      { name, nickname },
      expect.objectContaining({
        _reactName: 'onSubmit',
        type: 'submit',
      })
    )
  })

  it('submits with the expected, entered data', async () => {
    const name = 'My Name'
    const nickname = 'My Nickname'

    const onSubmit = jest.fn()

    render(<NameForm onSubmit={onSubmit} />)

    const nameField = screen.getByPlaceholderText('Name')
    const nicknameField = screen.getByPlaceholderText('Nickname')
    const submitButton = screen.getByText('Submit')

    await waitFor(() => userEvent.type(nameField, name))
    await waitFor(() => userEvent.type(nicknameField, nickname))
    await waitFor(() => userEvent.click(submitButton))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(
      { name, nickname },
      expect.objectContaining({
        _reactName: 'onSubmit',
        type: 'submit',
      })
    )
  })

// })
```

## Testing Services

Until now we've only tested things on the web-side of our app. When we test the api-side that means testing our Services.

In some ways testing a Service feels more "concrete" than testing components—Services deal with hard data coming out of a database or third party API, while components deal with messy things like language, layout, and even design elements.

Services will usually contain most of your business logic which is important to verify for correctness—crediting or debiting the wrong account number on the Services side could put a swift end to your business!

### The Test Database

To simplify Service testing, rather than mess with your development database, Redwood creates a test database that it executes queries against. By default this database will be located at the location defined by a `TEST_DATABASE_URL` environment variable and will fall back to `.redwood/test.db` if that var does not exist.

If you're using Postgres or MySQL locally you'll want to set that env var to your connection string for a test database in those services.

> Does anyone else find it confusing that the software itself is called a "database", but the container that actually holds your data is also called a "database," and you can have multiple databases (containers) within one instance of a database (software)?

When you start your test suite you may notice some output from Prisma talking about migrating the database. Redwood will automatically run `yarn rw prisma migrate dev` against your test database to make sure it's up-to-date.

### Writing Service Tests

A Service test can be just as simple as a component test:

```javascript
// api/src/services/users/users.js
export const createUser = ({ input }) => {
  return db.user.create({ data: input })
}

// api/src/services/users/users.test.js
import { createUser } from './users'

describe('users service', () => {
  it('creates a user', async () => {
    const record = await createUser({ name: 'David' })

    expect(record.id).not.toBeNull()
    expect(record.name).toEqual('David')
  })
})
```

This test creates a user and then verifies that it now has an `id` and that the name is what we sent in as the `input`. Note the use of `async`/`await`: although the service itself doesn't use `async`/`await`, when the service is invoked as a GraphQL resolver, the GraphQL provider sees that it's a Promise and waits for it to resolve before returning the response. We don't have that middleman here in the test suite so we need to `await` manually.

Did a user really get created somewhere? Yes: in the test database!

> In theory, it would be possible to mock out the calls to `db` to avoid talking to the database completely, but we felt that the juice wouldn't be worth the squeeze—you will end up mocking tons of functionality that is also under active development (Prisma) and you'd constantly be chasing your tail trying to keep up. So we give devs a real database to access and remove a whole class of frustrating bugs and false test passes/failures because of out-of-date mocks.

### Database Seeding

What about testing code that retrieves a record from the database? Easy, just pre-seed the data into the database first, then test the retrieval. **Seeding** refers to setting some data in the database that some other code requires to be present to get its job done. In a production deployment this could be a list of pre-set tags that users can apply to forum posts. In our tests it refers to data that needs to be present for our *actual* test to use.

In the following code, the "David" user is the seed. What we're actually testing is the `users()` and `user()` functions. We verify that the data returned by them matches the structure and content of the seed:

```javascript
it('retrieves all users', async () => {
  const data = await createUser({ name: 'David' })

  const list = await users({ id: data.id })

  expect(list.length).toEqual(1)
})

it('retrieves a single user', async () => {
  const data = await createUser({ name: 'David' })

  const record = await user({ id: data.id })

  expect(record.id).toEqual(data.id)
  expect(record.name).toEqual(data.name)
})
```

Notice that the string "David" only appears once (in the seed) and the expectations are comparing against values in `data`, not the raw strings again. This is a best practice and makes it easy to update your test data in one place and have the expectations continue to pass without edits.

Did your spidey sense tingle when you saw that exact same seed duplicated in each test? We probably have other tests that check that a user is editable and deletable, both of which would require the same seed again! Even more tingles! When there's obvious duplication like this you should know by now that Redwood is going to try and remove it.

### Scenarios

Redwood created the concept of "scenarios" to cover this common case. A scenario is a set of seed data that you can count on existing at the start of your test and removed again at the end. This means that each test lives in isolation, starts with the exact same database state as every other one, and any changes you make are only around for the length of that one test, they won't cause side-effects in any other.

When you use any of the generators that create a service (scaffold, sdl or service) you'll get a `scenarios.js` file alongside the service and test files:

```javascript
export const standard = defineScenario({
  user: {
    one: {
      data: {
        name: 'String',
      },
    },
    two: {
      data: {
        name: 'String',
      },
    }
  },
})
```

This scenario creates two user records. The generator can't determine the intent of your fields, it can only tell the datatypes, so strings get prefilled with just 'String'. What's up with the `one` and `two` keys? Those are friendly names you can use to reference your scenario data in your test.

The `data` key is one of Prisma's [create options](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#create). It's the same as in your Services—everything in the `one` and `two` keys actually just gets passed to Prisma's create. You can even create [relationships](https://redwoodjs.com/docs/testing.html#relationships) if you want.

Let's look at a better example. We'll update the scenario with some additional data and give them a more distinctive name:

```javascript
export const standard = defineScenario({
  user: {
    anthony: {
      data : {
        name: 'Anthony Campolo',
        email: 'anthony@redwoodjs.com'
      },
    },
    dom: {
      data: {
        name: 'Dom Saadi',
        email: 'dom@redwoodjs.com'
      },
    }
  },
})
```

Note that even though we are creating two users we don't use array syntax and instead just pass several objects. Why will become clear in a moment.

Now in our test we replace the `it()` function with `scenario()`:

```javascript
scenario('retrieves all users', async (scenario) => {
  const list = await users()

  expect(list.length).toEqual(Object.keys(scenario.user).length)
})

scenario('retrieves a single user', async (scenario) => {
  const record = await user({ id: scenario.user.dom.id })

  expect(record.id).toEqual(scenario.user.dom.id)
})
```

The `scenario` argument passed to the function contains the scenario data *after being inserted into the database* which means it now contains the real `id` that the database assigned the record. Any other fields that contain a database default value will be populated, included DateTime fields like `createdAt`. We can reference individual model records by name, like `scenario.user.dom`. This is why scenario records aren't created with array syntax: otherwise we'd be referencing them with syntax like `scenario.user[1]`. Yuck.

#### Named Scenarios

You may have noticed that the scenario we used was once again named `standard`. This means it's the "default" scenario if you don't specify a different name. This implies that you can create more than one scenario and somehow use it in your tests. And you can:

```javascript
export const standard = defineScenario({
  user: {
    anthony: {
      data : {
        name: 'Anthony Campolo',
        email: 'anthony@redwoodjs.com'
      },
    },
    dom: {
      data: {
        name: 'Dom Saadi',
        email: 'dom@redwoodjs.com'
      },
    }
  },
})

export const incomplete = defineScenario({
  user: {
    david: {
      data: {
        name: 'David Thyresson',
        email: 'dt@redwoodjs.com'
      },
    },
    forrest: {
      data: {
        name: '',
        email: 'forrest@redwoodjs.com'
      },
    }
  }
})
```

```javascript
scenario('incomplete', 'retrieves only incomplete users', async (scenario) => {
  const list = await users({ complete: false })
  expect(list).toMatchObject([scenario.user.forrest])
})
```

The name of the scenario you want to use is passed as the *first* argument to `scenario()` and now those will be the only records present in the database at the time the test to run. Assume that the `users()` function contains some logic to determine whether a user record is "complete" or not. If you pass `{ complete: false }` then it should return only those that it determines are not complete, which in this case includes users who have not entered their name yet. We seed the database with the scenario where one user is complete and one is not, then check that the return of `users()` only contains the user without the name.

#### Multiple Models

You're not limited to only creating a single model type in your scenario, you can populate every table in the database if you want.

```javascript
export const standard = defineScenario({
  product: {
    shirt: {
      data: {
        name: 'T-shirt',
        inventory: 5
      },
    }
  },
  order: {
    first: {
      data: {
        poNumber: 'ABC12345'
      },
    }
  },
  paymentMethod: {
    credit: {
      data: {
        type: 'Visa',
        last4: 1234
      },
    }
  }
})
```

And you reference all of these on your `scenario` object as you would expect

```javascript
scenario.product.shirt
scenario.order.first
scenario.paymentMethod.credit
```

#### Relationships

What if your models have relationships to each other? For example, a blog **Comment** has a parent **Post**. Scenarios are passed off to Prisma's [create](https://www.prisma.io/docs/concepts/components/prisma-client/crud#create) function, which includes the ability to create nested relationship records simultaneously:

```javascript
export const standard = defineScenario({
  comment: {
    first: {
      data: {
        name: 'Tobbe',
        body: 'But it uses some letters twice'
        post: {
          create: {
            title: 'Every Letter',
            body: 'The quick brown fox jumped over the lazy dog.'
          }
        }
      },
    }
  }
})
```

Now you'll have both the comment and the post it's associated to in the database and available to your tests. For example, to test that you are able to create a second comment on this post:

```javascript
scenario('creates a second comment', async (scenario) => {
  const comment = await createComment({
    input: {
      name: 'Billy Bob',
      body: "A tree's bark is worse than its bite",
      postId: scenario.comment.jane.postId,
    },
  })

  const list = await comments({ postId: scenario.comment.jane.postId })

  expect(list.length).toEqual(Object.keys(scenario.comment).length + 1)
})
```

`postId` is created by Prisma after creating the nested `post` model and associating it back to the `comment`.

Why check against `Object.keys(scenario.comment).length + 1` and not just `2`? Because if we ever update the scenario to add more records (maybe to support another test) this test will keep working because it only assumes what *it itself* did: add one comment to existing count of comments in the scenario.

You can also [include](https://www.prisma.io/docs/concepts/components/prisma-client/select-fields/) the post object (or `select` specific fields from it):

``` javascript
export const standard = defineScenario({
  comment: {
    first: {
      data: {
        name: 'Rob',
        body: 'Something really interesting'
        post: {
          create: {
            title: 'Brand new post',
            body: 'Introducing dbAuth'
          }
        }
      },
      include: {
        post: true
      }
    }
  }
})
```

Then you’ll have both the `comment` and its `post`:

```javascript
scenario('retrieves a comment with post', async (scenario) => {
  const comment = await commentWithPost({ id: scenario.comment.first.id })

  expect(comment.post.title).toEqual(scenario.comment.first.post.title)
})
```

####  Relationships with Existing Records

If your models have relationships and you need to connect new records to existing ones, using the object syntax just isn't going to cut it.

Consider a `Comment`: it has a parent `Post`, and both of them have an `Author`. Using the object syntax, there's no way of accessing the `authorId` of the `Author` we just created. We could potentially hardcode it, but that's bad practice.

```javascript
export const standard = defineScenario({
  post: {
    first: {
      data: {
        name: 'First Post',
        author: { create: { name: 'Kris' }},
        comments: {
          create: [
            {
              name: 'First Comment',
              body: 'String',
              authorId: // Here we want a different author...
            },
            {
              name: 'First Comment Response',
              body: 'String',
              authorId: // But here we want the same author as the post...
            },
          ],
        },
      }
    }),
  },
})
```

When you run into this, you can access an existing `scenario` record using the distinctive name key as a function that returns an object:

```javascript
export const standard = defineScenario({
  author: {
    kris: {
      data: { name: 'Kris' }
    }
    rob: {
      data: { name: 'rob' }
    }
  },
  post: {
    first: (scenario) => ({
     data: {
        name: 'First Post',
        authorId: scenario.author.kris.id,
        comments: {
          create: [
            {
              name: 'First Comment',
              body: 'String',
              authorId: scenario.author.rob.id,
            },
            {
              name: 'First Comment Response',
              body: 'String',
              authorId: scenario.author.kris.id,
            },
          ],
        },
      }
    }),
  },
})
```

Since [ES2015](https://tc39.es/ecma262/#sec-ordinaryownpropertykeys), object property keys are in ascending order of creation. This means that a key in `defineScenario` has access to key(s) created before it. We can leverage this like so:

```javascript
export const standard = defineScenario({
  user: {
    kris: {
      data: { name: 'Kris' }
    }
  },
  post: {
    first: (scenario) => ({
     // Here you have access to the user above via `scenario.user`
    }),
  },
  comment: {
    first: (scenario) => ({
      // Here you have access to both `scenario.user` and `scenario.post`
    })
  }
})
```

#### Which Scenarios Are Seeded?

Only the scenarios named for your test are included at the time the test is run. This means that if you have:

* `posts.test.js`
* `posts.scenarios.js`
* `comments.test.js`
* `comments.scenarios.js`

Only the posts scenarios will be present in the database when running the `posts.test.js` and only comments scenarios will be present when running `comments.test.js`. And within those scenarios, only the `standard` scenario will be loaded for each test unless you specify a differently named scenario to use instead.

During the run of any single test, there is only every one scenario's worth of data present in the database: users.standard *or* users.incomplete.

### mockCurrentUser() on the API-side

Just like when testing the web-side, we can use `mockCurrentUser()` to mock out the user that's currently logged in (or not) on the api-side.

Let's say our blog, when commenting, would attach a comment to a user record if that user was logged in while commenting. Otherwise the comment would be anonymous:

```javascript
// api/src/services/comments/comments.js

export const createComment = ({ input }) => {
  if (context.currentUser) {
    return db.comment.create({ data: { userId: context.currentUser.id, ...input }})
  } else {
    return db.comment.create({ data: input })
  }
}
```

We could include a couple of tests that verify this functionality like so:

```javascript
// api/src/services/comments/comments.test.js

scenario('attaches a comment to a logged in user', async (scenario) => {
  mockCurrentUser({ id: 123, name: 'Rob' })

  const comment = await createComment({
    input: {
      body: "It is the nature of all greatness not to be exact.",
      postId: scenario.comment.jane.postId,
    },
  })

  expect(comment.userId).toEqual(123)
})

scenario('creates anonymous comment if logged out', async (scenario) => {
  // currentUser will return `null` by default in tests, but it's
  // always nice to be explicit in tests that are testing specific
  // behavior (logged in or not)—future devs may not go in with the
  // same knowledge/assumptions as us!
  mockCurrentUser(null)

  const comment = await createComment({
    input: {
      body: "When we build, let us think that we build for ever.",
      postId: scenario.comment.jane.postId,
    },
  })

  expect(comment.userId).toEqual(null)
})
```

## Testing Functions

Testing [serverless functions](https://redwoodjs.com/docs/serverless-functions) and [webhooks](https://redwoodjs.com/docs/webhooks) can be difficult and time-consuming because you have to construct the event and context information that the function handler needs.

Webhook testing is even more complex because you might need to open a http tunnel to a running dev server to accept an incoming request, then you'll have to sign the webhook payload so that the request is trusted, and then you might even trigger events from your third-party service ... all manually. Every. Time.

Luckily, RedwoodJS has several api testing utilities to make [testing functions and webhooks](https://redwoodjs.com/docs/serverless-functions#how-to-test-serverless-functions) a breeze -- and without having to run a dev server.

> Want to learn to [How to Test Serverless Functions](https://redwoodjs.com/docs/serverless-functions#how-to-test-serverless-functions) and [Webhooks](https://?redwoodjs.com/docs/serverless-functions#how-to-test-webhooks)?
>
> We have an entire testing section in the [Serverless Functions documentation](https://redwoodjs.com/docs/serverless-functions) that will walk your through an example of a function and a webhook.

## Wrapping Up

So that's the world of testing according to Redwood. Did we miss anything? Can we make it even more awesome? Stop by [the community](https://community.redwoodjs.com) and ask questions, or if you've thought of a way to make this doc even better then [open a PR](https://github.com/redwoodjs/redwoodjs.com/pulls).

Now go out and create (and test!) something amazing!
