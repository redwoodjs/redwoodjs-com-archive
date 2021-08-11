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

## Testing

You can write tests and scenarios for your serverless functions very much like you would for services, but it's important to properly mock the information that the function `handler` needs.

To help you mock the `event` and `context` information, we've provided several api testing fixture utilities: 

|Mock  |Usage |
|---|-|
| `mockHttpEvent`  | Use this to mock out the http request `event` that is received by your function in unit tests. Here you can set `headers`, `httpMethod`, `queryStringParameters` as well as the `body` and if the body `isBase64Encoded`. The `event` contains information from the invoker as JSON-formatted string whose structure will vary. See [Working with AWS Lambda proxy integrations for HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) for the payload format.|
| `mockContext` | Use this function to mock the http `context`. Your function handler receives a context object with properties that provide information about the invocation, function, and execution environment. See [AWS Lambda context object in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html) for what context properties you can mock.
| `mockSignedWebhook` | Use this function to mock a signed webhook. This is a specialized `mockHttpEvent` mock that also signs the payload and adds a signature header needed to verify that the webhook is trustworthy. See [How to Receive and Verify an Incoming Webhook](https://redwoodjs.com/docs/webhooks#how-to-receive-and-verify-an-incoming-webhook) to learn more about signing and verifying webhooks.



### Testing Serverless Functions

```typescript
// api/src/functions/divide/divide.ts

import type { APIGatewayEvent, Context } from 'aws-lambda'

/**
 * Divide two integers: a dividend and a divisor
 *
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation function, and execution environment.
 *
 * @param @dividend Integer The dividend is required in the event's querystring
 * @param @divisor Integer The divisor is required in the event's querystring
 *
 * @returns a JSON payload containing a message along the dividend, divisor and quotient
 * @returns an error if the dividend or divisor is missing, or unable to divide the two numbers
 */
export const handler = async (event: APIGatewayEvent, _context: Context) => {
  // sets the default response
  let statusCode = 200
  let message = ''

  try {

    // get the two numbers to divide from the event query string
    const dividend = event.queryStringParameters.dividend
    const divisor = event.queryStringParameters.divisor

    // make sure the values to divide are provided
    if (dividend === undefined || divisor === undefined) {
      statusCode = 400
      message = `Please specify both a dividend and divisor.`
      throw Error(message)
    }

    // divide the two numbers
    const quotient = parseInt(dividend) / parseInt(divisor)
    message = `${dividend} / ${divisor} = ${quotient}`

    // check if the numbers could be divided
    if (quotient === Infinity || isNaN(quotient)) {
      statusCode = 500
      message = `Sorry. Could not divide ${dividend} by ${divisor}`
      throw Error(message)
    }

    return {
      statusCode,
      body: {
        message,
        dividend,
        divisor,
        quotient,
      },
    }
  } catch (error) {
    return {
      statusCode,
      body: {
        message: error.message,
      },
    }
  }
}

```

#### Serverless Function Unit Tests

```javascript
// api/src/functions/divideBy/divide.test.ts

import { mockHttpEvent } from '@redwoodjs/testing/api'
import { handler } from './divide'

describe('divide serverless function',  () => {
  it('divides two numbers successfully', async () => {
    const httpEvent = mockHttpEvent({
      queryStringParameters: {
        dividend: '20',
        divisor: '5',
      },
    })

    const result = await handler(httpEvent, null)
    const body = result.body

    expect(result.statusCode).toBe(200)
    expect(body.message).toContain('=')
    expect(body.quotient).toEqual(4)
  })

  it('requires a dividend', async () => {
    const httpEvent = mockHttpEvent({
      queryStringParameters: {
        divisor: '0',
      },
    })

    const result = await handler(httpEvent, null)
    const body = result.body
    expect(result.statusCode).toBe(400)
    expect(body.message).toContain('Please specify both')
    expect(body.quotient).toBeUndefined
  })

  it('requires a divisor', async () => {
    const httpEvent = mockHttpEvent({
      queryStringParameters: {
        dividend: '10',
      },
    })

    const result = await handler(httpEvent, null)
    const body = result.body

    expect(result.statusCode).toBe(400)
    expect(body.message).toContain('Please specify both')
    expect(body.quotient).toBeUndefined
  })

  it('cannot divide by 0', async () => {
    const httpEvent = mockHttpEvent({
      queryStringParameters: {
        dividend: '20',
        divisor: '0',
      },
    })

    const result = await handler(httpEvent, null)
    const body = result.body

    expect(result.statusCode).toBe(500)
    expect(body.message).toContain('Could not divide')
    expect(body.quotient).toBeUndefined
  })
})

```

### Testing Webhooks


```js
// /api/db/schema.prisma

model Order {
  id             Int      @id @default(autoincrement())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  trackingNumber String
  status         String   @default("UNKNOWN")

  @@unique([trackingNumber, status])
}
```


```ts
import type { APIGatewayEvent } from 'aws-lambda'
import {
  verifyEvent,
  VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'
import { db } from 'src/lib/db'

/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * Important: When deployed, a custom serverless function is an open API endpoint and
 * is your responsibility to secure appropriately.
 *
 * @see {@link https://redwoodjs.com/docs/serverless-functions#security-considerations|Serverless Function Considerations}
 * in the RedwoodJS documentation for more information.
 *
 * @typedef { import('aws-lambda').APIGatewayEvent } APIGatewayEvent
 * @typedef { import('aws-lambda').Context } Context
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */

export const handler = async (event: APIGatewayEvent) => {
  let currentOrderStatus = 'UNKNOWN'

  try {
    const options = {
      signatureHeader: 'X-Webhook-Signature',
    } as VerifyOptions

    verifyEvent('sha256Verifier', {
      event,
      secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME',
      options,
    })

    // Safely use the validated webhook payload body
    const body = JSON.parse(event.body)
    const trackingNumber = body.trackingNumber
    const status = body.status

    // You can only update the status if the order's current status allows
    switch(status) {
      case 'PLACED':
        currentOrderStatus = 'UNKNOWN'
        break
      case 'SHIPPED':
        currentOrderStatus = 'PLACED'
        break
      case 'DELIVERED':
        currentOrderStatus = 'SHIPPED'
        break
      default:
        currentOrderStatus = 'UNKNOWN'
    }

    // updated the order with the new status using the trackingNumber provided
    const order = await db.order.update({
      where: { trackingNumber_status: {trackingNumber, status: currentOrderStatus }},
      data: { status: status },
    })

    return {
      statusCode: 200, // Success!!!
      body: JSON.stringify({
        order,
        message: `Updated order ${order.id} to ${order.status} at ${order.updatedAt}`
      }),
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return {
        statusCode: 401, // Unauthorized
      }
    } else {
      return {
        statusCode: 500, // An error
        body: JSON.stringify({
          error: error.message,
          message: `Unable to update the order status`
        }),
      }
    }
  }
}
```

##### Webhook Test Scenarios

```ts
// api/src/functions/updateOrderStatus/updateOrderStatus.scenarios.ts

export const standard = defineScenario({
  order: {
    placed: { trackingNumber: '1ZP1LC3D0Rd3R000001', status: 'PLACED' },
    shipped: { trackingNumber: '1ZSH1PP3D000002', status: 'SHIPPED' },
    delivered: { trackingNumber: '1ZD31IV3R3D000003', status: 'DELIVERED' },
  },
})
```

#### Webhook Unit Tests

```ts
// api/src/functions/updateOrderStatus/updateOrderStatus.scenarios.ts

import type { APIGatewayEvent, APIGatewayProxyEventHeaders } from 'aws-lambda'

import { mockSignedWebhook } from '@redwoodjs/testing/api'
import { handler } from './updateOrderStatus'

describe('updates an order via a webhook', () => {
  scenario('with a shipped order, updates the status to DELIVERED', async (scenario) => {
    const order = scenario.order.shipped

    const payload = {trackingNumber: order.trackingNumber, status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, signatureType: 'sha256Verifier',
                       signatureHeader: 'X-Webhook-Signature',
                       secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200)
    expect(body.message).toContain(`Updated order ${order.id}`)
    expect(body.message).toContain(`to ${payload.status}`)
    expect(body.order.id).toEqual(order.id)
    expect(body.order.status).toEqual(payload.status)
  })

  scenario('with an invalid signature header, the webhook is unauthorized', async (scenario) => {
    const order = scenario.order.placed

    const payload = {trackingNumber: order.trackingNumber, status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, signatureType: 'sha256Verifier',
                       signatureHeader: 'X-Webhook-Signature-Invalid',
                       secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)

    expect(result.statusCode).toBe(401)
  })

  scenario('with the wrong webhook secret the webhook is unauthorized', async (scenario) => {
    const order = scenario.order.placed

    const payload = {trackingNumber: order.trackingNumber, status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, signatureType: 'sha256Verifier',
                       signatureHeader: 'X-Webhook-Signature',
                       secret: 'MY-NAME-IS-WERNER-BRANDES-VERIFY-ME' })

    const result = await handler(event)

    expect(result.statusCode).toBe(401)
  })

  scenario('when the tracking number cannot be found, returns an error', async (scenario) => {
    const order = scenario.order.placed

    const payload = {trackingNumber: '1Z-DOES-NOT-EXIST', status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, signatureType: 'sha256Verifier',
                       signatureHeader: 'X-Webhook-Signature',
                       secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)

    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(500)
    expect(body).toHaveProperty('error')
  })

  scenario('when the order has not yet shipped, returns an error', async (scenario) => {
    const order = scenario.order.placed

    const payload = {trackingNumber: order.trackingNumber, status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, signatureType: 'sha256Verifier',
                       signatureHeader: 'X-Webhook-Signature',
                       secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)

    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(500)
    expect(body).toHaveProperty('error')
    expect(body.message).toEqual('Unable to update the order status')
  })


  scenario('when the order has already been delivered, returns an error', async (scenario) => {
    const order = scenario.order.delivered

    const payload = {trackingNumber: order.trackingNumber, status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, signatureType: 'sha256Verifier',
                       signatureHeader: 'X-Webhook-Signature',
                       secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)

    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(500)
    expect(body).toHaveProperty('error')
    expect(body.message).toEqual('Unable to update the order status')
  })
})
```

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

### Other considerations

In addition to securing your serverless functions, you may consider logging, rate limiting and whitelisting as ways to protect your functions from abuse or misuse.

#### Visibility via Logging

Logging in production — and monitoring for suspicious activity, unknown IP addresses, errors, etc. — can be a critical part of keeping your serverless functions and your application safe.

Third-party log services like [logFlare](https://logflare.app/), [Datadog](https://www.datadoghq.com/) and [LogDNA](https://www.logdna.com/) all have features that store logs for inspection, but also can trigger alerts and notifications if something you deem untoward occurs.

See [Logger](/docs/logger) in the RedwoodJS docs for more information about how to setup and use logging services.

#### Rate Limiting

Rate limiting (or throttling) how often a function executes by a particular IP addresses or user account is a common way of stemming api abuse (for example, a distributed Denial-of-Service, or DDoS, attack).

As LogRocket [says]((https://blog.logrocket.com/rate-limiting-node-js/)):

> Rate limiting is a very powerful feature for securing backend APIs from malicious attacks and for handling unwanted streams of requests from users. In general terms, it allows us to control the rate at which user requests are processed by our server.

API Gateways like [Kong](https://docs.konghq.com/hub/kong-inc/rate-limiting/) offer plugins to configure how many HTTP requests can be made in a given period of seconds, minutes, hours, days, months, or years.

Currently, RedwoodJS does not offer rate limiting in the framework, but your deployment target infrastructure may. This is a feature RedwoodJS will investigate for future releases.

For more information about Rate Limiting in Node.js, consider:

* [Understanding and implementing rate limiting in Node.js](https://blog.logrocket.com/rate-limiting-node-js/) on LogRocket


#### IP Address Whitelisting

Because the `event` passed to the function handler contains the request's IP address, you could decide to whitelist only certain known and trusted IP addresses. 

```js

const ipAddress = ({ event }) => {
  return (
    event?.headers?.['client-ip'] ||
    event?.requestContext?.identity?.sourceIp ||
    'localhost'
  )
}
```

If the IP address in the event does not match, then you can raise an error and return `401 Unauthorized` status.
