# Serverless Functions

<!-- `redwood.toml`&mdash;`api/src/functions` by default.  -->

> ⚠ **Work in Progress** ⚠️
>
> There's more to document here. In the meantime, you can check our [community forum](https://community.redwoodjs.com/search?q=serverless%20functions) for answers.
>
> Want to contribute? Redwood welcomes contributions and loves helping people become contributors.
> You can edit this doc [here](https://github.com/redwoodjs/redwoodjs.com/blob/main/docs/serverlessFunctions.md).
> If you have any questions, just ask for help! We're active on the [forums](https://community.redwoodjs.com/c/contributing/9) and on [discord](https://discord.com/channels/679514959968993311/747258086569541703).

Redwood looks for serverless functions in `api/src/functions`. Each function is mapped to a URI based on its filename. For example, you can find `api/src/functions/graphql.js` at `http://localhost:8911/graphql`.

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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: '${name} function',
    }),
  }
}
```

## The handler

For a lambda function to be a lambda function, it must export a handler that returns a status code. The handler receives two arguments: `event` and `context`. Whatever it returns is the `response`, which should include a `statusCode` at the very least.

Note that you can use code in `api/src` in your serverless function, such as importing the `db` from `src/lib/db`.

## Developing locally

When you're developing locally, the dev server watches the `api` directory for modifications; when it detects any, it re-imports all the modules.

## Security considerations

When deployed, **a custom serverless function is an open API endpoint and is your responsibility to secure appropriately**. 🔐

That means _anyone_ can access your function and perform any tasks it's asked to do. In many cases, this is completely appropriate and desired behavior.

But, in some cases, for example when the function interacts with third parties, like sending email, or when it retrieves sensitive information from a database, you may want to ensure that only verified requests from trusted sources can invoke your function.

And, in some other cases, you may even want to limit how often the function is called over a set period of time to avoid denial-of-service-type attacks.

### Authentication

If you invoke your function from your web side, you can use `requireAuth()` to ensure that function is allowed to execute by passing your auth provider's access token and the provider method in the request headers:

```
auth-provider: <your provider>
authorization: Bearer <access_token>
```

This will then decode the Bearer token and check to see if the request is authorized.

```js
import { requireAuth } from 'src/lib/auth'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/api'

export const handler = async (event, context) => {
  try {
    requireAuth({ role: 'admin' })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: 'Permitted',
      }),
    }
  } catch (e) {
    if (e instanceof AuthenticationError) {
      return {
        statusCode: 401,
      }
    } else if (e instanceof ForbiddenError) {
      return {
        statusCode: 403,
      }
    } else {
      return {
        statusCode: 400,
      }
    }
  }
}
```

### Webhooks

If your function receives an incoming Webhook from a third party, see [Webhooks](/docs/webhooks) in the RedwoodJS documentation to verify and trust its payload.

### Returning Binary Data

By default, RedwoodJS functions return strings or JSON. If you need to return binary data, your function will need to encode it as Base64 and then set the `isBase64Encoded` response parameter to `true`. Note that this is best suited to relatively small responses. The entire response body will be loaded into memory as a string, and many serverless hosting environments will limit your function to eg. 10 seconds, so if your file takes longer than that to process and download it may get cut off. For larger or static files, it may be better to upload files to an object store like S3 and generate a [presigned URL](https://stackoverflow.com/questions/38831829/nodejs-aws-sdk-s3-generate-presigned-url) that the client can use to download the file directly.

Here's an example of how to return a binary file from the filesystem:

```typescript
// api/src/functions/myCustomFunction.ts

import type { APIGatewayEvent, Context } from 'aws-lambda'
import fs from 'fs'

export const handler = async (event: APIGatewayEvent, context: Context) => {
  const file = await fs.promises.readFile('/path/to/image.png')

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': file.length,
    },
    body: file.toString('base64'),
    isBase64Encoded: true,
  }
}
```

### Other considerations

In addition to securing your serverless functions, you may consider logging, rate limiting and whitelisting as ways to protect your functions from abuse or misuse.

#### Visibility via Logging

Logging in production — and monitoring for suspicious activity, unknown IP addresses, errors, etc. — can be a critical part of keeping your serverless functions and your application safe.

Third-party log services like [logFlare](https://logflare.app/), [Datadog](https://www.datadoghq.com/) and [LogDNA](https://www.logdna.com/) all have features that store logs for inspection, but also can trigger alerts and notifications if something you deem untoward occurs.

See [Logger](/docs/logger) in the RedwoodJS docs for more information about how to setup and use logging services.

#### Rate Limiting

Rate limiting (or throttling) how often a function executes by a particular IP addresses or user account is a common way of stemming api abuse (for example, a distributed Denial-of-Service, or DDoS, attack).

As LogRocket [says](https://blog.logrocket.com/rate-limiting-node-js/):

> Rate limiting is a very powerful feature for securing backend APIs from malicious attacks and for handling unwanted streams of requests from users. In general terms, it allows us to control the rate at which user requests are processed by our server.

API Gateways like [Kong](https://docs.konghq.com/hub/kong-inc/rate-limiting/) offer plugins to configure how many HTTP requests can be made in a given period of seconds, minutes, hours, days, months, or years.

Currently, RedwoodJS does not offer rate limiting in the framework, but your deployment target infrastructure may. This is a feature RedwoodJS will investigate for future releases.

For more information about Rate Limiting in Node.js, consider:

- [Understanding and implementing rate limiting in Node.js](https://blog.logrocket.com/rate-limiting-node-js/) on LogRocket

#### IP Address Whitelisting

Because the `event` passed to the function handler contains the request's IP address, you could decide to whitelist only certain known and trusted IP addresses.

```js
const ipAddress = ({ event }) => {
  return event?.headers?.['client-ip'] || event?.requestContext?.identity?.sourceIp || 'localhost'
}
```

If the IP address in the event does not match, then you can raise an error and return `401 Unauthorized` status.
