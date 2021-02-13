# Serverless Functions

Redwood looks for serverless functions in the directory specified by your `redwood.toml`&mdash;`api/src/functions` by default. Each function is mapped to a URI based on its filename. For exmaple, you can find `api/src/functions/graphql.js` at `http://localhost:8911/graphql`.

## Creating Serverless Functions

Creating serverless functions is easy with Redwood's function generator:

```terminal
yarn rw g function <name>
```

It'll give you a stub that exports a handler that returns a status code&mdash;the bare minimum you need to get going: 

```js
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: '${name} function',
    }),
  }
}

```

## The handler

For a lambda function to be a lambda function, it must export a handler that returns a status code. The handler recevies two arguments: `event` and `context`. Whatever it returns is the `response`.

Note that you can use code in `api/src` in your serverless function, such as importing the `db` from `src/lib/db`.

## Developing locally

When you're developing locally, the dev server watches the `api` directory for modifications; when it detects any, it reimports all the modules.
