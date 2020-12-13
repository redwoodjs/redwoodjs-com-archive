# Serverless Functions

The dev server looks for "lambda functions" in the directory
(default: `./api/src/functions`) specified by your `redwood.toml`
configuration file.

Each lambda function is mapped to a URI based on their filename, as
an example: `./api/src/functions/graphql.js` would be accessible
at `http://localhost:8911/graphql`.

The `./api` directory is watched for modifications, when they are
detected the modules are reimported.

You can use code in `./api/src` e.g. `import { db } from 'src/lib/db'`

A lambda function must export a `handler`. You can execute the
supplied callback function to return a response:

```js
export const handler = (event, context) => {
  return { statusCode: 200, body: 'Hello, world' }
}
```
