# Webhooks

Webhooks are a way one system can notify another when something happens.

You can see examples of these when:

* Netlify successfully [deploys a site](https://docs.netlify.com/site-deploys/notifications/#outgoing-webhooks)
* Someone [pushes a PR to GitHub](https://docs.github.com/en/developers/webhooks-and-events/creating-webhooks)
* Someone [posts in Discourse](https://meta.discourse.org/t/setting-up-webhooks/49045)
* Stripe [completes a purchase](https://stripe.com/docs/webhooks)
* A cron/scheduled task wants to invoke a long running [background function on Netlify](https://docs.netlify.com/functions/background-functions/)
* and more like IFTTT and Zapier

Since each of these webhooks will call a function endpoint in your RedwoodJS api, you'd want to ensure that only that these run only when it should. That means you need to:

* verify it comes from the place you expect
* can trust the party 
* know the payload sent in the hook hasn't been tampered with
* and (sometimes) ensure that the hook isn't re-processed or replayed


### Verification Methods


#### RedwoodJS Authentication Header
* requireAuth()



#### Json Web Token Verification 

* todo
#### Secret Header
* verify secret via header

#### Webhook Signature Header
Webhooks have a few ways of letting you know they should be trusted and the most common way is by sending along a "signature" in a header. They typically sign the payload with some secret key (in a few ways) and expect you to validate the signature before processing the payload.

Common signature verification methods are:

* SHA256 (GitHub and Discourse)
* JWT (Netlify)
* Timestamp scheme (Stripe/ Redwood default)
* Plaintext secret key (custom)

RedwoodJS implements [signatureVerifiers](https://github.com/dthyresson/redwood/tree/dt-secure-handler/packages/api/src/auth/verifiers) for each of the above methods.


Each implement a `sign` and `verify` method.

##### GitHub Approach
* todo
##### Stripe Approach
* todo
##### JSON Web Signature (JWS)
* todo

#### Webhook Example

The `secureHandler` exports [sign, verify, receiveAndVerify, with options](https://github.com/dthyresson/redwood/blob/dt-secure-handler/packages/api/src/functions/secureHandler.ts) to help lookup the verifier needed and to find the signature on the event to verify. It also implements a `skipVerifier` that always verifies.

The lookup is similar to the way AuthClients and decoders are looked up.

If the signature fails verification, a `WebhookSignError` is raised which can be caught to returns a `401` unauthorized.

This demonstrates how to verify the signature of a Discourse webhook via `receiveAndVerify` with `VerifyOptions` that denote the Discourse signature header and the `sha256Verifier`.

For info on Discourse webhooks, see: https://meta.discourse.org/t/setting-up-webhooks/49045

> Verify and parse webhook event
> Let’s dive in how it works so you can build yourself one. The flow is simple.
>
> Check out X-Discourse-Event-Id and X-Discourse-Event-Type to see whether you are interested. X-Discourse-Event also shows the internal event hook.
> Get payload by reading Content-Length and Content-Type.
> Compute sha256 HMAC of raw payload.
> To be noted, X-Discourse-Event-Signature consists of sha256= and hmac of raw payload.

```js
import { receiveAndVerify, VerifyOptions } from '@redwoodjs/api'

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

export const handler = async (event, _context) => {
  logger.info('Invoked discourseWebhook function')

  const options = {
    type: 'sha256Verifier',
    signatureHeader: 'X-Discourse-Event-Signature',
  } as VerifyOptions

  receiveAndVerify({ event, secret: 'redwoodjs-secret', options })

  logger.debug({ payload: JSON.parse(event.body) }, 'Body payload')

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: 'discordWebhook function',
    }),
  }
}
```