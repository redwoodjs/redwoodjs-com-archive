# Custom Function

You may not have noticed, but when you're making GraphQL calls you're actually calling a [Function](https://docs.netlify.com/functions/overview/) on the API side (not to be confused with a Javascript `function`). Capital F Functions are meant to be deployed to serverless endpoints like AWS Lambda. (We're using Netlify's nomenclature when we call them Functions.)

Did you know you can create your own Functions that do whatever you want? Normally we recommend that if you have custom behavior, even if it's unrelated to accessing the database, that you make it available as a GraphQL type so that your entire application has one, unified API interface. But rules were meant to be broken!

How about a custom function that returns the timestamp from the server?

## Creating a Function

Step one is to actually create the custom Function. Naturally, we have a generator for that. Let's call our custom Function "serverTime":

```terminal
yarn rw g function serverTime
```

That will create a shell for you that you can test out right away. Make sure your dev server is running with `yarn rw dev` and point your browser to `http://localhost:8910/.netlify/functions/serverTime`

![serverTime Function output](https://user-images.githubusercontent.com/300/81349715-69462700-9075-11ea-87c0-a8a1c564a1b6.png)

> Since Redwood currently plays nicely with Netlify we use the same proxy path that Netlify does for functions, `/.netlify/functions`. If you are deploying somewhere else you can change this in  `redwood.toml` in the root of your app.

## Getting the Time

Let's get the current time and return it in the body of our handler:

```javascript{6}
// api/src/functions/serverTime.js

export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: new Date()
  }
}
```

![Time output screenshot](https://user-images.githubusercontent.com/300/81352089-87faec80-907a-11ea-96f7-bb05345a86d7.png)

> Here we're using a [Chrome extension](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) which formats data that could be identified as JSON in a nicer way. In this case the date is wrapped in quotes, which is valid JSON, so the extension kicks in and formats it.

How about we make sure the response is a JSON object:

```javascript{6-7}
// api/src/functions/serverTime.js

export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json ' },
    body: JSON.stringify({ time: new Date() }),
  }
}
```

![JSON time output screenshot](https://user-images.githubusercontent.com/300/81352131-9fd27080-907a-11ea-8db0-6308a4c48b5f.png)

> Note that Node.js does not yet have ES module support, but we use Babel to transpile during the build phase so you can still use `import` syntax for external packages in your Functions.

### Bonus: Filtering by Request Method

Since you are most definitely an elite hacker you probably noticed that our new endpoint is available via all HTTP methods: **GET**, **POST**, **PATCH**, etc. In the spirit of [REST](https://www.codecademy.com/articles/what-is-rest) this endpoint should really only be accessible via a **GET**.

> Again, because you're an elite hacker you definitely said "excuse me, actually this endpoint should respond to **HEAD** and **OPTIONS** methods as well." Okay fine, but this is meant to be a quick introduction, cut us some slack! Why don't you write a recipe for us and open a PR, smartypants??

If you inspect the `event` argument being sent into `handler` we can get all kinds of juicy details on this request:

```javascript{4}
// api/src/functions/serverTime.js

export const handler = async (event, context) => {
  console.log(event)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json ' },
    body: JSON.stringify({ time: new Date() }),
  }
}
```

Take a look in the terminal window where you're running `yarn rw dev` to see the output:

```json
{
  httpMethod: 'GET',
  headers: {
    host: 'localhost:8911',
    connection: 'keep-alive',
    'cache-control': 'max-age=0',
    dnt: '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
  },
  path: '/serverTime',
  queryStringParameters: {},
  body: '',
  isBase64Encoded: false
}
```

That first entry is what we want, `httpMethod`. Let's check the method and return a 404 if it isn't a **GET**:

```javascript{4-6}
// api/src/functions/serverTime.js

export const handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 404 }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json ' },
    body: JSON.stringify({ time: new Date() }),
  }
}
```

It's tough to test other HTTP methods in the browser without installing an extension, but we can do it from the command line with curl:

```terminal
$ curl -XPOST http://localhost:8911/serverTime -I
```

You should see:

```terminal
HTTP/1.1 404 Not Found
X-Powered-By: Express
Date: Thu, 07 May 2020 22:33:55 GMT
Connection: keep-alive
Content-Length: 0
```

And just to be sure, let's make that same request with a GET (curl's default method):

```terminal
$ curl http://localhost:8911/serverTime
```

```
{"time":"2020-05-07T22:36:12.973Z"}
```

> If you leave the `-I` flag on then curl will default to a HEAD request! Okay fine, you were right elite hacker!

### Super Bonus: Callback Hell

By default Redwood likes the async/await version of Function handlers, but you can also use the callback version. In that case your Function would look something like:

```javascript{3,5,8,12}
// api/src/functions/serverTime.js

export const handler = (event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, { statusCode: 404 })
  }

  callback(null, {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json ' },
    body: JSON.stringify({ time: new Date() }),
  })
}
```

Yeah, kinda gross. What's with that `null` as the first parameter? That's used if your handler needs to return an error. More on callback-based handlers can be found in [Netlify's docs](https://docs.netlify.com/functions/build-with-javascript/#format).

The callback syntax may not be *too* bad for this simple example. But, if you find yourself dealing with Promises inside your handler, and you choose to go use callback syntax, you may want to lie down and rethink the life choices that brought you to this moment. If you still want to use callbacks you had better hope that time travel is invented by the time this code goes into production, so you can go back in time and prevent yourself from ruining your own life. You will, of course, fail because you already choose to use callbacks the first time so you must have been unsuccessful in stopping yourself when you went back.

Trust us, it's probably best to just stick with async/await instead of tampering with spacetime.

### Conclusion

We hope this gave you enough info to get started with custom functions, and learned a little something about the futility of trying to change the past. Now go out and build something awesome!
