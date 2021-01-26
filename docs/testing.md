# Testing

Testing. For some it's an essential part of their development workflow. For others it's something they know they *should* do, but for whatever reason testing hasn't grabbed their fancy yet. For still others it's something they ignore completely, hoping the whole concept will go away. But tests are here to stay, and maybe Redwood can change some opinions about testing being awesome and fun.

## Introduction to Testing

If you're already familiar with the ins and outs of testing and just want to know how to do it in Redwood, feel free to [skip ahead](#redwood-and-testing). Or, keep reading for a refresher.

The idea of testing is pretty simple: for each "unit" of code you write, you write additional code that exercises that unit and makes sure it works as expected. What's a "unit" of code? That's for you to decide! It could be a class, a single function, or even a single line! In general the smaller the unit of code that you're testing the better—your tests will stay fast and focused on just one thing, which makes them easy to update when you refactor your code. The important thing is that you start *somewhere* and codify your code's functionality in a repeatable, verifyable way.

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

Where did *that* come from? Well, our subject `add()` didn't raise any errors (Javascript doesn't care about the number of arguments passed to a function) and so it tried to add `1` to `undefined`. We didn't think about that! See, testing is already helping us catch edge cases.

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

## What to Test

## Testing Services

### The Test Database

### Scenarios

## Testing Cells

### Mocks

## Testing Components

### Mocking GraphQL
