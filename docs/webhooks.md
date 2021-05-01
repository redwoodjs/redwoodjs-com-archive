# Webhooks

Webhooks are a common way that third-party services notify your RedwoodJS application when an event of interest happens. 

They are a form of messaging and automation allows web applications to communicate with each other and send real-time data from one application to another whenever a given event occurs.

The third-party considers these "outgoing Webhooks" and therefore your application receives "incoming Webhooks".

When your RedwoodJS api side receives information in an incoming Webhook, the app can parse it, process it, save it or any other action needed.

Webhooks are different from other integration methods in that your third-party pushes new events instead of your application pulling or polling for new data.

## Examples of Webhooks

Some examples of outgoing Webhooks are:

* Netlify successfully [deploys a site](https://docs.netlify.com/site-deploys/notifications/#outgoing-webhooks)
* Someone [pushes a PR to GitHub](https://docs.github.com/en/developers/webhooks-and-events/creating-webhooks)
* Someone [posts in Discourse](https://meta.discourse.org/t/setting-up-webhooks/49045)
* Stripe [completes a purchase](https://stripe.com/docs/webhooks)
* A cron/scheduled task wants to invoke a long running [background function on Netlify](https://docs.netlify.com/functions/background-functions/)
* and more webhook integrations via services like [IFTTT](https://ifttt.com/maker_webhooks), [Pipedream](https://pipedream.com/docs/api/rest/webhooks/) and [Zapier](https://zapier.com/apps/webhook/integrations)

Since each of these webhooks will call a function endpoint in your RedwoodJS api, you need to ensure that these run **only when they should**. That means you need to:

* Verify it comes from the place you expect
* Trust the party 
* Know the payload sent in the hook hasn't been tampered with
* Ensure that the hook isn't reprocessed or replayed (sometimes)

That is, you need to **verify your incoming webhooks**.

## Verifying Webhooks with RedwoodJS Made Easy

The RedwoodJS [`api/webhooks` package](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/webhooks/index.ts) makes it easy to receive and verify incoming Webhooks by implementing many of the most commonly used Webhook signature verifiers.

### Webhook Verification

Webhooks have a few ways of letting you know they should be trusted and the most common way is by sending along a "signature" in a header. They typically sign the payload with some secret key (in a few ways) and expect you to validate the signature before processing the payload.

###  Webhook Signature Verifiers

Common signature verification methods are:

* SHA256 ([GitHub](https://docs.github.com/en/developers/webhooks-and-events/securing-your-webhooks#validating-payloads-from-github) and [Discourse](https://meta.discourse.org/t/setting-up-webhooks/49045))
* SHA1 ([Vercel](https://vercel.com/docs/integrations?query=webhook%20sha1#webhooks/securing-webhooks))
* JWT ([Netlify](https://docs.netlify.com/site-deploys/notifications/#outgoing-webhooks))
* Timestamp Scheme ([Stripe](https://stripe.com/docs/webhooks/best-practices) / Redwood default)
* Secret Key (Custom, [Orbit](https://docs.orbit.love/docs/webhooks))

RedwoodJS adds a way to do no verification as well of testing or in the case your third party doesn't sign the payload.

* SkipVerifier (bypass verification, or no verification)

RedwoodJS implements [signatureVerifiers](https://github.com/dthyresson/redwood/tree/dt-secure-handler/packages/api/src/auth/verifiers) for each of these so you can get started integrating your app with third-parties right away.

```js
export type SupportedVerifiers =
  | SkipVerifier
  | SecretKeyVerifier
  | Sha1Verifier
  | Sha256Verifier
  | Sha1Verifier
  | TimestampSchemeVerifier
  | JwtVerifier
```

Each `SupportedVerifier` implements a method to `sign` and `verify` a payload with a secret (if needed).

When the webhook needs [creates a verifier](https://github.com/dthyresson/redwood/blob/b3b21a4a2c7a96ac8d1fd8b078a9869d3f2f1cec/packages/api/src/auth/verifiers/index.ts#L12) in order to `verifyEvent`, `verifySignature` or `signPayload` it does so via:

```js
createVerifier(type, options)
```

where type is one of the support verifier and `VerifyOptions` sets the options the verifier needs to sign or verify.

```js
/**
 * VerifyOptions
 *
 * Used when verifying a signature based on the verifier's requirements
 *
 * @param {string} signatureHeader - Optional Header that contains the signature to verify
 * will default to DEFAULT_WEBHOOK_SIGNATURE_HEADER
 * @param {number} timestamp - Optional timestamp in msec
 * @param {number} tolerance - Optional tolerance in msec
 * @param {string} issuer - Options JWT issuer for JWTVerifier
 */
export interface VerifyOptions {
  signatureHeader?: string
  timestamp?: number
  tolerance?: number
  issuer?: string
}
```

## How to Receive and Verify an Incoming Webhook using a RedwoodJS Function

The `api/webhooks` package exports [verifyEvent and verifySignature](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/webhooks/index.ts) to apply [verification method](https://github.com/redwoodjs/redwood/tree/main/packages/api/src/auth/verifiers) and verify the event or or some portion of the event payload with a signature as defined in its [VerifyOptions](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/webhooks/index.ts).

If the signature fails verification, a `WebhookSignError` is raised which can be caught to returns a `401` unauthorized.

Typically, for each integration you will define

* the events that trigger the Webhook
* or the schedule via cron/conditions to send the Webhook
* a secret
* the endpoint to send the Webhook (ie, your RedwoodJS function api endpoint)

When the third-party creates the outgoing Webhook payload, they will sign that payload (typically the event request body) and add that signature to the request headers with some key.

When the RedwoodJS api endpoint/function receives the request (incoming Webhook), it can extract the signature using the signature header key set in `VerifyOptions`, use the appropriate verifier, and validate the payload to ensure it comes from a trusted source.

Note that: 

* `verifyEvent` will detect if the event body is base64 encoded, then decode and validate the payload with teh signature verifier
* signatureHeader specified in `VerifyOptions` will be converted to lowercase when fetching the signature from teh event headers

You can then use the payload data with confidence in your function.
### SHA256 Verifier (used by GitHub, Discourse)

SHA256 HMAC is one of the most popular signatures and is currently used by:

* [GitHub](https://docs.github.com/en/developers/webhooks-and-events/securing-your-webhooks#validating-payloads-from-github)
* [Discourse](https://meta.discourse.org/t/setting-up-webhooks/49045)

When your secret token is set, GitHub uses it to create a hash signature with each payload. This hash signature is included with the headers of each request as `X-Hub-Signature-256`.

For Discourse, when an event is triggered, it `POST`s a webhook with `X-Discourse-Event-Signature` in the HTTP header to your endpoint. It’s computed by SHA256. 

```js
import type { APIGatewayEvent } from 'aws-lambda'
import {
  verifyEvent,
  VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'

import { logger } from 'src/lib/logger'

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
  const discourseInfo = { webhook: 'discourse' }
  const webhookLogger = logger.child({ discourseInfo })

  webhookLogger.trace('Invoked discourseWebhook function')

  try {
    const options = {
      signatureHeader: 'X-Discourse-Event-Signature',
    } as VerifyOptions

    verifyEvent('sha256Verifier', {
      event,
      secret: process.env.DISCOURSE_WEBHOOK_SECRET,
      options,
    })

    webhookLogger.debug({ headers: event.headers }, 'Headers')

    const payload = JSON.parse(event.body)

    webhookLogger.debug({ payload }, 'Body payload')

    // Safely use the validated webhook payload

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: payload,
      }),
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      webhookLogger.warn('Unauthorized')

      return {
        statusCode: 401,
      }
    } else {
      webhookLogger.error({ error }, error.message)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      }
    }
  }
}
```

### SHA1 Verifier (used by Vercel)
* [Vercel](https://vercel.com/docs/integrations?query=webhook%20sha1#webhooks/securing-webhooks)

Vercel signs its webhooks with SHA also base64 encodes the event.

RedwoodJS `verifyEvent` will detect is the event is base64 encoded, decode and then validate the payload with the signature.

```js
import type { APIGatewayEvent } from 'aws-lambda'
import {
  verifyEvent,
  VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'

import { logger } from 'src/lib/logger'

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
  const vercelInfo = { webhook: 'vercel' }
  const webhookLogger = logger.child({ vercelInfo })

  webhookLogger.trace('Invoked vercelWebhook function')

  try {
    const options = {
      signatureHeader: 'x-vercel-signature',
    } as VerifyOptions

    verifyEvent('sha256Verifier', {
      event,
      secret: process.env.DISCOURSE_WEBHOOK_SECRET,
      options,
    })

    webhookLogger.debug({ headers: event.headers }, 'Headers')

    const payload = JSON.parse(event.body)

    webhookLogger.debug({ payload }, 'Body payload')

    // Safely use the validated webhook payload

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: payload,
      }),
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      webhookLogger.warn('Unauthorized')

      return {
        statusCode: 401,
      }
    } else {
      webhookLogger.error({ error }, error.message)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      }
    }
  }
}
```
### TimestampScheme Verifier (used by Stripe)

The TimestampScheme verifier now only signs the payload with a secret (SHA256), but also includes a timestamp to prevent [replay attacks](https://en.wikipedia.org/wiki/Replay_attack) and a scheme (ie, a version) to further protect webhooks.

A replay attack is when an attacker intercepts a valid payload and its signature, then re-transmits them. To mitigate such attacks, third-parties like Stripe includes a timestamp in the Stripe-Signature header. Because this timestamp is part of the signed payload, it is also verified by the signature, so an attacker cannot change the timestamp without invalidating the signature. If the signature is valid but the timestamp is too old, you can have your application reject the payload.

When verifying, there is a default tolerance of five minutes between the timestamp and the current time but you can override this default by setting the [`tolerance` option](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/auth/verifiers/timestampSchemeVerifier.ts) in the `VerifyOptions` passed to the verifier to another value (in seconds).

Also, if for some reason you need to adjust the timestamp used to compare the tolerance to a different time (say in the past), then you may override this setting the [`timestamp` option](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/auth/verifiers/timestampSchemeVerifier.ts) in the `VerifyOptions` passed to the verifier.

* [Stripe](https://stripe.com/docs/webhooks/best-practices)
* Used in a Cron Job that triggers a Webhook periodically to background task via a serverless function

The TimestampScheme is particularly useful when used with cron jobs because if for some reason the webhook is delayed between when it is created and sent/received your app can discard it and thus old information would not risk overwriting newer data.

```js
import type { APIGatewayEvent } from 'aws-lambda'

import {
  verifyEvent,
  VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'
import { logger } from 'src/lib/logger'
import { perform } from 'src/lib/orbit/jobs/loadActivitiesJob'

/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * @typedef { import('aws-lambda').APIGatewayEvent } APIGatewayEvent
 * @typedef { import('aws-lambda').Context } Context
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */
export const handler = async (event: APIGatewayEvent) => {
  const webhookInfo = { webhook: 'loadOrbitActivities-background' }

  const webhookLogger = logger.child({ webhookInfo })

  webhookLogger.trace('>> in loadOrbitActivities-background')

  try {
    const options = {
      signatureHeader: 'RW-Webhook-Signature',
      // You may override these defaults
      // tolerance: 60_000,
      // timestamp: new Date().getDate() - 1,
    } as VerifyOptions

    verifyEvent('timestampSchemeVerifier', {
      event,
      secret: process.env.WEBHOOK_SECRET,
      options,
    })

    await perform()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: `loadOrbitActivities scheduled job invoked at ${Date.now()}`,
      }),
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      webhookLogger.warn(
        { webhook: 'loadOrbitActivities-background' },
        'Unauthorized'
      )
      return {
        statusCode: 401,
      }
    } else {
      webhookLogger.error(
        { webhook: 'loadOrbitActivities-background', error },
        error.message
      )
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      }
    }
  }
}
```

### JWT Signature (used by Netlify)

* [Netlify Outgoing Webhooks](https://docs.netlify.com/site-deploys/notifications/#outgoing-webhooks)

The benefits JSON Web Token (JWT) Verifier is that not only does it cryptographically compare teh signature to the payload to ensure it has not been tampered with but given the added JWT claims like `issuer` and `expires` you can trust that the Webhook was sent by a trusted sounds and is not out of date.

Here, the `VerifyOptions` not only specify the expected signature header, but allow will check that the `iss` claim is netlify.

```js
    const options = {
      signatureHeader: 'X-Webhook-Signature',
      issuer: 'netlify',
    } as VerifyOptions
```

See: [Introduction to JSON Web Tokens](https://jwt.io/introduction) for more information.

```js
import type { APIGatewayEvent } from 'aws-lambda'
import {
  verifyEvent,
  VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'

import { logger } from 'src/lib/logger'

/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * @typedef { import('aws-lambda').APIGatewayEvent } APIGatewayEvent
 * @typedef { import('aws-lambda').Context } Context
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */
export const handler = async (event: APIGatewayEvent) => {
  const netlifyInfo = {
    webhook: 'verifyNetlifyWebhook',
    headers: event.headers['x-netlify-event'],
  }
  const webhookLogger = logger.child({ netlifyInfo })

  try {
    webhookLogger.debug('Received Netlify event')

    const options = {
      signatureHeader: 'X-Webhook-Signature',
      issuer: 'netlify',
    } as VerifyOptions

    verifyEvent('jwtVerifier', {
      event,
      secret: process.env.NETLIFY_DEPLOY_WEBHOOK_SECRET,
      options,
    })
    const payload = JSON.parse(event.body)

    // Safely use the validated webhook payload

    webhookLogger.debug({ payload }, 'Now I can do things with the payload')

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: payload,
      }),
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      webhookLogger.warn('Unauthorized')
      return {
        statusCode: 401,
      }
    } else {
      webhookLogger.error({ error }, error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      }
    }
  }
}
```

### Secret Key Verifier (used by Orbit)

* [Orbit](https://docs.orbit.love/docs/webhooks)

The Secret Key verifiers acts very much like a password. It doesn't perform some cryptographic comparison of the signature with the payload received, but rather simple checks if the expected key or token is present.

```js
//import type { APIGatewayEvent, Context } from 'aws-lambda'
import {
  verifyEvent,
  // VerifyOptions,
  WebhookVerificationError,
} from '@redwoodjs/api/webhooks'

import { deserialize } from 'deserialize-json-api'
import { parser, persister } from 'src/lib/orbit/loaders/activityLoader'

import { logger } from 'src/lib/logger'

const webhookDetails = (event) => {
  const webhook = 'orbitWebhook-background'
  const orbitEvent = event.headers['x-orbit-event'] || ''
  const orbitEventId = event.headers['x-orbit-event-id'] || ''
  const orbitEventType = event.headers['x-orbit-event-type'] || ''
  const orbitUserAgent = event.headers['user-agent'] || ''
  const orbitSignature = event.headers['x-orbit-signature'] || ''

  return {
    webhook,
    orbitEvent,
    orbitEventId,
    orbitEventType,
    orbitUserAgent,
    orbitSignature,
  }
}

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
export const handler = async (event) => {
  const orbitInfo = webhookDetails(event)

  const webhookLogger = logger.child({ orbitInfo })

  webhookLogger.info(`>> in webhook`)

  try {
    const options = {
      signatureHeader: 'X-Orbit-Signature',
    }

    verifyEvent('sha256Verifier', {
      event,
      secret: process.env.ORBIT_WEBHOOK_SECRET,
      options,
    })

    if (orbitInfo.orbitEventType === 'activity:created') {
      const parsedActivity = parseEventPayload(event)

      // Safely use the validated webhook payload

      return {
        statusCode: 200,
        body: JSON.stringify({
          data: 'orbitWebhook done',
        }),
      }
    } else {
      webhookLogger.warn(
        `Unsupported Orbit Event Type: ${orbitInfo.orbitEventType}`
      )
      return {
        statusCode: 400,
        body: JSON.stringify({
          data: `Unsupported Orbit Event Type: ${orbitInfo.orbitEventType}`,
        }),
      }
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      webhookLogger.warn('Unauthorized')
      return {
        statusCode: 401,
      }
    } else {
      webhookLogger.error({ error }, error.message)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      }
    }
  }
}
```

### Skip Verifier (used by Livestorm)

[Livestorm](https://support.livestorm.co/article/119-webhooks) sends webhooks, but does not sign them with a secret.

Here, you can use the `skipVerifier` -- or choose not to validate altogether, but setting up to `verifyEvent` would let you quickly change the verification method if their changes.

You can also use the `skipVerifier` in testing or in `dev` so that you needn't share your secrets with other developers.

In that case, you might set `WEBHOOK_VERIFICATION=skipVerifier` and use the envar in `verifyEvent(process.env.WEBHOOK_VERIFICATION, { event })`.

```js
import type { APIGatewayEvent } from 'aws-lambda'
import { verifyEvent, WebhookVerificationError } from '@redwoodjs/api/webhooks'

import { logger } from 'src/lib/logger'

/**
 * The handler function is your code that processes http request events.
 * You can use return and throw to send a response or error, respectively.
 *
 * @typedef { import('aws-lambda').APIGatewayEvent } APIGatewayEvent
 * @typedef { import('aws-lambda').Context } Context
 * @param { APIGatewayEvent } event - an object which contains information from the invoker.
 * @param { Context } context - contains information about the invocation,
 * function, and execution environment.
 */
export const handler = async (event: APIGatewayEvent) => {
  const livestormInfo = { webhook: 'livestorm' }
  const webhookLogger = logger.child({ livestormInfo })

  webhookLogger.trace('Livestorm')

  webhookLogger.debug({ event: event }, 'The Livestorm event')

  // Use the webhook payload
  // Note: since the payload is not signed, you may want to validate other header info

  try {
    verifyEvent('skipVerifier', { event })

    const data = JSON.parse(event.body)

    webhookLogger.debug({ payload: data }, 'Data from Livestorm')

    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
      }),
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      webhookLogger.warn('Unauthorized')

      return {
        statusCode: 401,
      }
    } else {
      webhookLogger.error({ error }, error.message)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      }
    }
  }
}
```

## How to Sign a Payload for an Outgoing Webhook event in RedwoodJS

The `api/webhooks` package exports [signPayload](https://github.com/redwoodjs/redwood/blob/main/packages/api/src/webhooks/index.ts) that will sign a payload using a [verification method](https://github.com/redwoodjs/redwood/tree/main/packages/api/src/auth/verifiers) and create your "webhook signature".

Once you have the signature, you can 

* add the signature to your request http headers 
* with a signature key of your choosing 
* and then post the request to the endpoint 
* that needs to be sent the event

```js
import got from 'got'
import { signPayload } from '@redwoodjs/api/webhooks'

const YOUR_OUTGOING_WEBHOOK_DESTINATION_URL = 'https://example.com/receive'
const YOUR_WEBHOOK_SIGNATURE = process.env.WEBHOOK_SIGNATURE

export const sendOutGoingWebhooks = async ({ payload }) => {
  const signature = signPayload('timestampSchemeVerifier', {
    payload,
    secret,
  })

  await got.put(
    YOUR_OUTGOING_WEBHOOK_DESTINATION_URL,
    {
      responseType: 'json',

      json: {
        payload,
      },
      headers: {
        YOUR_WEBHOOK_SIGNATURE: signature,
      },
    }
  )
}
```
## More Information

For more information about Webhooks, please consider the following resources:

* [Webhook.site lets you easily inspect, test and automate (with the visual Custom Actions builder, or WebhookScript) any incoming HTTP request or e-mail.](https://webhook.site/#!/)
* [What is a Webhook](https://simonfredsted.com/1583) by Simon Fredsted
* [About Webhooks](https://docs.github.com/en/developers/webhooks-and-events/about-webhooks) on GitHub
* [What are Webhooks? A simple guide to connection apps with webhooks](https://zapier.com/blog/what-are-webhooks/) on Zapier
* [What are Webhooks? Easy Explanation & Tutorial](https://snipcart.com/blog/what-are-webhooks-explained-example) on Snipcart
* [What are Webhooks and Why You Can’t Afford to Ignore Them](https://www.chargebee.com/blog/what-are-webhooks-explained/) on Charbee
* [What is a webhook: How they work and how to set them up](https://www.getvero.com/resources/webhooks/) on Vero
