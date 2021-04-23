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

When deployed, a custom serverless function is an open API endpoint and is your responsibility to secure appropriately.

That means that that anyone can access your function and perform any tasks it's asked to do. In many cases, this is completely appropriate and desired behavior. 

But, in some cases, for example when the function interacts with third parties, like sending email, or when it retrieves sensitive information from a database, you may want to ensure that only verified requests from trusted sources can invoke your function.

And, in some other cases, you may even want to limit how often the function is called over s set period of time to avoid denial-of-service-type attacks.

### Webhooks

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

### Other considerations
#### Visibility via Logging
* todo
#### Rate Limiting
* todo

* Denial-of-Service. Example, if query db, consume all connections.
#### IP Address Whitelisting
* todo

