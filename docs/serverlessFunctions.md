# Serverless Functions

<!-- `redwood.toml`&mdash;`api/src/functions` by default.  -->

Redwood looks for serverless functions in `api/src/functions`. Each function is mapped to a URI based on its filename. For example, you can find `api/src/functions/graphql.js` at `http://localhost:8911/graphql`.

## Creating Serverless Functions

Creating serverless functions is easy with Redwood's function generator:

```terminal
yarn rw g function <name>
```

This will generate a stub serverless function in the folder `api/src/functions/<name>`, along with a test and an empty scenarios file.

_Example of a bare minimum handler you need to get going:_
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

> Just a note here, we call them 'serverless' but they can also be used on 'serverful' hosted environments too, such as Render or Heroku.
## The handler

For a lambda function to be a lambda function, it must export a handler that returns a status code. The handler receives two arguments: `event` and `context`. Whatever it returns is the `response`, which should include a `statusCode` at the very least.

> **File/Folder Structure**
>
>  For example, with a target function endpoint name of /hello, you could save the function file in one of the following ways:
> - `./api/src/functions/hello.{js,ts}`
> - `./api/src/functions/hello/hello.{js,ts}`
> - `./api/src/functions/hello/index.{js,ts}`
>
> Other files in the folder will _not_ be exposed as an endpoint

### Re-using/Sharing code
You can use code in `api/src` in your serverless function, some examples:

```js
// importing `db` directly
import { db } from 'src/lib/db'

// importing services
import { update } from 'src/services/subscriptions'

// importing a custom shared library
import { reportError } from 'src/lib/errorHandling'
```
If you just want to move some logic into another file, that's totally fine too!

```bash
api/src
├── functions
│   ├── graphql.ts
│   └── helloWorld
│       ├── helloWorld.scenarios.ts
│       ├── helloWorld.test.ts
│       └── helloWorld.ts     # <-- imports hellWorldLib
│       └── helloWorldLib.ts  # <-- exports can be used in the helloWorld
```

## Developing locally

When you run `yarn rw dev` - it'll watch for changes and make your functions available at:
- `localhost:8911/{functionName}` and
- `localhost:8910/.redwood/functions/{functionName}` (used by the web side).

Note that the `.redwood/functions` path is determined by your setting in your [redwood.toml](https://redwoodjs.com/docs/app-configuration-redwood-toml#apiUrl) - and is used both in development and in the deployed Redwood app


## Testing

You can write tests and scenarios for your serverless functions very much like you would for services, but it's important to properly mock the information that the function `handler` needs.

To help you mock the `event` and `context` information, we've provided several api testing fixture utilities:

|Mock  |Usage |
|---|-|
| `mockHttpEvent`  | Use this to mock out the http request `event` that is received by your function in unit tests. Here you can set `headers`, `httpMethod`, `queryStringParameters` as well as the `body` and if the body `isBase64Encoded`. The `event` contains information from the invoker as JSON-formatted string whose structure will vary. See [Working with AWS Lambda proxy integrations for HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) for the payload format.|
| `mockContext` | Use this function to mock the http `context`. Your function handler receives a context object with properties that provide information about the invocation, function, and execution environment. See [AWS Lambda context object in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html) for what context properties you can mock.
| `mockSignedWebhook` | Use this function to mock a signed webhook. This is a specialized `mockHttpEvent` mock that also signs the payload and adds a signature header needed to verify that the webhook is trustworthy. See [How to Receive and Verify an Incoming Webhook](https://redwoodjs.com/docs/webhooks#how-to-receive-and-verify-an-incoming-webhook) to learn more about signing and verifying webhooks.

### How to Test Serverless Functions

Let's learn how to test a serverless function by first creating a simple function that divides two numbers.

As with all serverless lambda functions, the handler accepts an `APIGatewayEvent` which contains information from the invoker.
That means it will have the HTTP headers, the querystring parameters, the method (GET, POST, PUT, etc), cookies, and the body of the request.
See [Working with AWS Lambda proxy integrations for HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) for the payload format.

Let's generate our function:

```terminal
yarn rw generate function divide
```

We'll use the querystring to pass the `dividend` and `divisor` to the function handler on the event as seen here to divide 10 by 2.

```terminal
// request
http://localhost:8911/divide?dividend=10&divisor=2
```

If the function can successfully divide the two numbers, the function returns a body payload back in the response with a [HTTP 200 Success](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) status:

```terminal
// response
{"message":"10 / 2 = 5","dividend":"10","divisor":"2","quotient":5}
```

And, we'll have some error handling to consider the case when either the dividend or divisor is missing and return a [HTTP 400 Bad Request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) status code; or, if we try to divide by zero or something else goes wrong, we return a [500  Internal Server Error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500).


```typescript
// api/src/functions/divide/divide.ts

import type { APIGatewayEvent } from 'aws-lambda'

export const handler = async (event: APIGatewayEvent) => {
  // sets the default response
  let statusCode = 200
  let message = ''

  try {

    // get the two numbers to divide from the event query string
    const { dividend, divisor } = event.queryStringParameters

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

Sure, you could launch a browser or use Curl os some other manual approach and try out various combinations to test the success and error cases, but we want to automate the tests as part of our app's CI.

That means we need to write some tests.
#### Function Unit Tests

To test a serverless function, you'll work with the test script associated with the function. You'll find it in the same directory as your function:

```terminal
api
├── src
│   ├── functions
│   │   ├── divide
│   │   │   ├── divide.ts
│   │   │   ├── divide.test.ts
```

The setup steps are to:

* write your test cases by mocking the event using `mockHttpEvent` to contain the information you want to give the handler
* invoke the handler with the mocked event
* extract the result body
* test that the values match what you expect

The boilerplate steps are generated automatically for you by the function generator
Let's look at a series of tests that mock the event with different information in each.

First, let's write a test that divides 20 by 5 and we'll expect to get 4 as the quotient:

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

    const result = await handler(httpEvent)
    const body = result.body

    expect(result.statusCode).toBe(200)
    expect(body.message).toContain('=')
    expect(body.quotient).toEqual(4)
  })
```

Then we can also add a test to handle the error when we don't provide a dividend:

```javascript
  // api/src/functions/divideBy/divide.test.ts
  it('requires a dividend', async () => {
    const httpEvent = mockHttpEvent({
      queryStringParameters: {
        divisor: '5',
      },
    })

    const result = await handler(httpEvent)
    const body = result.body
    expect(result.statusCode).toBe(400)
    expect(body.message).toContain('Please specify both')
    expect(body.quotient).toBeUndefined
  })

```

And finally, we can also add a test to handle the error when we try to divide by 0:

```javascript
  it('cannot divide by 0', async () => {
    const httpEvent = mockHttpEvent({
      queryStringParameters: {
        dividend: '20',
        divisor: '0',
      },
    })

    const result = await handler(httpEvent)
    const body = result.body

    expect(result.statusCode).toBe(500)
    expect(body.message).toContain('Could not divide')
    expect(body.quotient).toBeUndefined
  })
})

```

The `divide` function is a simple example, but you can use the `mockHttpEvent` to set any event values you handler needs to test more complex functions.

You can also `mockContext` and pass the mocked `context` to the handler and even create scenario data if your function interacts with your database. For an example of using scenarios when test functions, please look at a specialized serverless function: the [webhook below](https://redwoodjs.com/docs/serverless-functions#how-to-test-webhooks).
#### Running Function Tests

To run an individual serverless function test:

```terminal
yarn rw test api divide
```

When the test run completes (and succeeds), you see the results:

```terminal
 PASS   api  api/src/functions/divide/divide.test.ts (12.69 s)
  divide serverless function
    ✓ divides two numbers successfully (153 ms)
    ✓ requires a dividend (48 ms)
    ✓ requires a divisor (45 ms)
    ✓ cannot divide by 0 (47 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        13.155 s
Ran all test suites matching /divide.test.ts|divide.test.ts|false/i.
```

If the test fails, you can update your function or test script and the test will automatically re-run.

### Using Test Fixtures

Often times your serverless function will have a variety of test cases, but because it may not interact with the database, you don't want to use scenarios (since that creates records in your test database). But, you still want a way to define these cases in a more declarative way for readability and maintainability -- and you can using fixtures.

First, let's create a fixture for the `divide` function alongside your function and test as `divide.fixtures.ts`:

```terminal
api
├── src
│   ├── functions
│   │   ├── divide
│   │   │   ├── divide.ts
│   │   │   ├── divide.test.ts
│   │   │   ├── divide.fixtures.ts // <-- your fixture
```

Let's define a fixture for a new test case: when the function is invoked, but it is missing a divisor:

```js
// api/src/functions/divide/divide.fixtures.ts

import { mockHttpEvent } from '@redwoodjs/testing/api'

export const missingDivisor = () => mockHttpEvent({
  queryStringParameters: {
    dividend: '20',
  },
})
```

The `missingDivisor()` fixture constructs and mocks the event for the test case -- that is, we don't provide a divisor value in the querystring parameters in the mocked http event.

Now, let's use this fixture in a test by providing the handler with the event we mocked in the fixture:

```js
// api/src/functions/divide/divide.test.ts
import { missingDivisor } from './divide.fixtures'

describe('divide serverless function',  () => {
// ... other test cases

  it('requires a divisor', async () => {
    const result = await handler(missingDivisor())

    const body = result.body

    expect(result.statusCode).toBe(400)
    expect(body.message).toContain('Please specify both')
    expect(body.quotient).toBeUndefined
  })

// ...
})

```

Now, if we decide to change the test case date, we simply modify the fixture and re-run our tests.

You can then define multiple fixtures to define all the cases in a central place, export each, and then use in your tests for more maintainable and readable tests.
### How to Test Webhooks

[Webhooks](https://redwoodjs.com/docs/webhooks#webhooks) are specialized serverless functions that will verify a signature header to ensure you can trust the incoming request and use the payload with confidence.

> **Note:** Want to learn more about webhooks? See a [Detailed discussion of webhooks](https://redwoodjs.com/docs/webhooks) to find out how webhooks can give your app the power to create complex workflows, build one-to-one automation, and sync data between apps.

In the following example, we'll have the webhook interact with our app's database, so we can see how we can use **scenario testing** to create data that the handler can access and modify.

> **Why testing webhooks is hard**
>
>Because your webhook is typically sent from a third-party's system, manually testing webhooks can be difficult. For one thing, you often have to create some kind of event in their system that will trigger the event -- and you'll often have to do that in a production environment with real data. Second, for each case you'll have to find data that represents each case and issue a hook for each -- which can take a lot of time and is tedious. 
>
>Also, you'll be using production secrets to sign the payload. And finally, since your third-party needs to send you the incoming webhook you'll most likely have to launch a local tunnel to expose your development machine publicly in order to receive them.
>
>Instead, we can automate and mock the webhook to contain a signed payload that we can use to test the handler.
>
> By writing these tests, you can iterate and implement the webhook logic much faster and easier without having to rely on a third party to send you data, or setting up tunneling, or triggering events on the external system.


For our webhook test example, we'll create a webhook that updates a Order's Status by looking up the order by its Tracking Number and then updating the status to by Delivered (if our rules allow it).

Because we'll be interacting with data, our app has an `Order` model defined in the Prisma schema that has a unique `trackingNumber` and `status`:

```js
// /api/db/schema.prisma

model Order {
  id             Int      @id @default(autoincrement())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  trackingNumber String   @unique
  status         String   @default("UNKNOWN")

  @@unique([trackingNumber, status])
}
```

Let's generate our webhook function:

```terminal
yarn rw generate function updateOrderStatus
```

```terminal
api
├── src
│   ├── functions
│   │   ├── updateOrderStatus
│   │   │   ├── updateOrderStatus.ts
│   │   │   ├── updateOrderStatus.scenarios.ts
│   │   │   ├── updateOrderStatus.test.ts

```

The `updateOrderStatus` webhook will expect:

* a signature header named `X-Webhook-Signature`
* that the signature in that header will signed using the [SHA256 method](https://redwoodjs.com/docs/webhooks#sha256-verifier-used-by-github-discourse)
* verify the signature and throw an [401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) error if the event cannot be trusted (that is, it failed signature verification)
* if verified, then proceed to
* find the order by the tracking number provided
* check that the order's current status allows the status to be changed
* and if so, update the error and return the order and message
* or if not, return a [500 internal server error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) with a message that the order couldn't be updated


```ts
import type { APIGatewayEvent } from 'aws-lambda'
import {
  verifyEvent,
  VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'
import { db } from 'src/lib/db'

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

    // updated the order with the new status 
    // using the trackingNumber provided
    const order = await db.order.update({
      where: { trackingNumber_status: { trackingNumber, 
                                        status: currentOrderStatus }},
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

#### Webhook Test Scenarios

Since our `updateOrderStatus` webhook will query an order by its tracking number and then attempt to update its status, we'll want to seed our test run with some scenario data that helps us have records we can use to test that the webhook does what we expect it to in each situation.

Let's create three orders for with different status:  `PLACED`, `SHIPPED`, and `DELIVERED`.

We'll use these to test that you cannot update an order to the delivered status unless it is currently "shipped:.

We can refer to these individual orders in our tests as `scenario.order.placed`, `scenario.order.shipped` , or `scenario.order.delivered`.

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

The webhook test setup needs to:

* import your api testing utilities, such as `mockSignedWebhook`
* import your function handler

In each test scenario we will:

* get the scenario order data
* create a webhook payload with a tracking number and a status what we want to change its order to
* mock and sign the webhook using `mockSignedWebhook` that specifies the verifier method, signature header, and the secret that will verify that signature
* invoke the handler with the mocked signed event
* extract the result body (and parse it since it will be JSON data)
* test that the values match what you expect


In our first scenario, we'll use the shipped order to test that we can update the order given a valid tracking number and change its status to delivered:

```ts
// api/src/functions/updateOrderStatus/updateOrderStatus.scenarios.ts
import { mockSignedWebhook } from '@redwoodjs/testing/api'
import { handler } from './updateOrderStatus'

describe('updates an order via a webhook', () => {
  scenario('with a shipped order, updates the status to DELIVERED', 
            async (scenario) => {

    const order = scenario.order.shipped

    const payload = { trackingNumber: order.trackingNumber,
                      status: 'DELIVERED' }

    const event = mockSignedWebhook({ payload,
                      signatureType: 'sha256Verifier',
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
```

But, we also want to test what happens if the webhook receives an invalid signature header like `X-Webhook-Signature-Invalid`.

Because the header isn't what the webhook expects (it wants to see a header named `X-Webhook-Signature`), this request is not verified and will return a 401 Unauthorized and not try to update the order at all.

> Note: For brevity we didn't test that the order's status wasn't changed, but that could be checked as well

```javascript

  scenario('with an invalid signature header, the webhook is unauthorized', 
            async (scenario) => {
    const order = scenario.order.placed

    const payload = { trackingNumber: order.trackingNumber, 
                      status: 'DELIVERED' }
    const event = mockSignedWebhook({ payload, 
                      signatureType: 'sha256Verifier',
                      signatureHeader: 'X-Webhook-Signature-Invalid',
                      secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)

    expect(result.statusCode).toBe(401)
  })
```

Next, we test what happens if the event payload is signed, but with a different secret than it expects; that is it was signed using the wrong secret (`MY-NAME-IS-WERNER-BRANDES-VERIFY-ME` and not `MY-VOICE-IS-MY-PASSPORT-VERIFY-ME`).

Again, we expect as 401 Unauthorized response.

```javascript

  scenario('with the wrong webhook secret the webhook is unauthorized', 
            async (scenario) => {
    const order = scenario.order.placed

    const payload = { trackingNumber: order.trackingNumber, 
                      status: 'DELIVERED' }
    const event = mockSignedWebhook({payload, 
                      signatureType: 'sha256Verifier',
                      signatureHeader: 'X-Webhook-Signature',
                      secret: 'MY-NAME-IS-WERNER-BRANDES-VERIFY-ME' })

    const result = await handler(event)

    expect(result.statusCode).toBe(401)
  })
```

Next, what happens if the order cannot be found? We'll try a tracking number that doesn't exist (that is we did not create it in our scenario order data):

```javascript

  scenario('when the tracking number cannot be found, returns an error', 
            async (scenario) => {
    const order = scenario.order.placed

    const payload = { trackingNumber: '1Z-DOES-NOT-EXIST', 
                      status: 'DELIVERED' }
    const event = mockSignedWebhook({payload, 
                      signatureType: 'sha256Verifier',
                      signatureHeader: 'X-Webhook-Signature',
                      secret: 'MY-VOICE-IS-MY-PASSPORT-VERIFY-ME' })

    const result = await handler(event)

    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(500)
    expect(body).toHaveProperty('error')
  })

```

Last, we want to test a business rule that says you cannot update an order to be delivered if it already is delivered

Therefore our scenario uses the `scenario.order.delivered` data where the order has a placed status.

> Note: you'll have additional tests here to check that if the order is placed you cannot update it to be delivered and if the order is shipped you cannot update to be placed, etc

```javascript
  scenario('when the order has already been delivered, returns an error', 
            async (scenario) => {
    const order = scenario.order.delivered

    const payload = { trackingNumber: order.trackingNumber, 
                      status: 'DELIVERED'}
    const event = mockSignedWebhook({payload, 
                      signatureType: 'sha256Verifier',
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

As with other serverless function testing, you can also `mockContext` and pass the mocked context to the handler if your webhook requires that information.

#### Running Webhook Tests

To run an individual webhook test:

```terminal
yarn rw test api updateOrderStatus
```

When the test run completes (and succeeds), you see the results:

```terminal
 PASS   api  api/src/functions/updateOrderStatus/updateOrderStatus.test.ts (10.3 s)
  updates an order via a webhook
    ✓ with a shipped order, updates the status to DELIVERED (549 ms)
    ✓ with an invalid signature header, the webhook is unauthorized (51 ms)
    ✓ with the wrong webhook secret the webhook is unauthorized (44 ms)
    ✓ when the tracking number cannot be found, returns an error (54 ms)
    ✓ when the order has not yet shipped, returns an error (57 ms)
    ✓ when the order has already been delivered, returns an error (73 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        10.694 s, estimated 36 s
Ran all test suites matching /updateOrderStatus.test.ts|updateOrderStatus.test.ts|false/i.
```

If the test fails, you can update your function or test script and the test will automatically re-run.

## Security considerations

When deployed, **a custom serverless function is an open API endpoint and is your responsibility to secure appropriately**. 🔐

That means _anyone_ can access your function and perform any tasks it's asked to do. In many cases, this is completely appropriate and desired behavior.

But, in some cases, for example when the function interacts with third parties, like sending email, or when it retrieves sensitive information from a database, you may want to ensure that only verified requests from trusted sources can invoke your function.

And, in some other cases, you may even want to limit how often the function is called over a set period of time to avoid denial-of-service-type attacks.

### Webhooks

If your function receives an incoming Webhook from a third party, see [Webhooks](https://redwoodjs.com/docs/webhooks) in the RedwoodJS documentation to verify and trust its payload.

### Returning Binary Data

By default, RedwoodJS functions return strings or JSON. If you need to return binary data, your function will need to encode it as Base64 and then set the `isBase64Encoded` response parameter to `true`. Note that this is best suited to relatively small responses. The entire response body will be loaded into memory as a string, and many serverless hosting environments will limit your function to eg. 10 seconds, so if your file takes longer than that to process and download it may get cut off. For larger or static files, it may be better to upload files to an object store like S3 and generate a [pre-signed URL](https://stackoverflow.com/questions/38831829/nodejs-aws-sdk-s3-generate-presigned-url) that the client can use to download the file directly.

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
