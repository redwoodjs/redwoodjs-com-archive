# Security

RedwoodJS wants you to be able build and deploy secure and  applications takes the topic of security seriously.

* [RedwoodJS Security](https://github.com/redwoodjs/redwood/security) on GitHub
* [CodeQL code scanning](https://github.com/features/security)
* [Authentication](/docs/authentication)
* [Webhook signature verification](/docs/webhooks)
* [Ways to keep your serverless functions secure](/docs/serverless-functions#security-considerations)
* [Environment variables for secure keys and tokens](/docs/environment-variables)

> Note: While the RedwoodJS framework offers the tools, practices and information to keep your application secure, it remains your responsibility to put these in place. Proper password, token, key protection using disciplined communication, password management systems and environment management services like [Doppler](https://www.doppler.com) are strongly encouraged,

## GraphQL

GraphQL is a fundamental part of the RedwoodJS api. 

For details on how RedwoodJS uses GraphQL and handles important security considerations, please see: [GraphQL Security](/docs/graphql#security) section in the RedwoodJS documentation.

## Functions

When deployed, a custom [serverless function](/docs/serverless-functions) is an open API endpoint and is your responsibility to secure appropriately.

That means that that anyone can access your function and perform any tasks it's asked to do. In many cases, this is completely appropriate and desired behavior. But, there are often times you need to restrict access to a function and RedwoodJS can help you do that using a [variety of methods and approaches](/docs/serverless-functions#security-considerations).

For details on how to keep your functions secure, please see: [Serverless functions & Security considerations](/docs/serverless-functions#security-considerations) section in the RedwoodJS documentation.

## Webhooks

[Webhooks](/docs/webhooks) are a common way that third-party services notify your RedwoodJS application when an event of interest happens. 

They are a form of messaging and automation allows web applications to communicate with each other and send real-time data from one application to another whenever a given event occurs.

Since each of these webhooks will call a function endpoint in your RedwoodJS api, you need to ensure that these run **only when they should**. That means you need to:

* Verify it comes from the place you expect
* Trust the party 
* Know the payload sent in the hook hasn't been tampered with
* Ensure that the hook isn't reprocessed or replayed 

For details on how to keep your incoming webhooks secure and how to sign your outgoing webhooks, please see: [Webhooks](/docs/webhooks) section in the RedwoodJS documentation.