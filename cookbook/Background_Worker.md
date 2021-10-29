# Creating a Background Worker with Exec and Faktory

In this cookbook, we'll use Redwood's [exec feature](/docs/cli-commands#exec) to create a background worker using a library called [Faktory](https://contribsys.com/faktory/).

At a high level, Faktory is a language-agnostic, persistent background-job server.
You can run the server [with Docker](https://github.com/contribsys/faktory/wiki/Docker).

For our client, we'll use this [node library](https://github.com/jbielick/faktory_worker_node) to send jobs from our Redwood app to our Faktory server.

## Creating the Faktory Worker

Let's create our faktory worker
First, make the worker script:

```
yarn rw g script faktoryWorker
```

We'll start by registering a task called `postSignupTask` in our worker:

```javascript
// scripts/faktoryWorker.js

const { postSignupTask } from '$api/src/lib/tasks'
import { logger } from '$api/src/lib/logger'

const faktory = require('faktory-worker')

faktory.register('postSignupTask', async (taskArgs) => {
  logger.info("running postSignupTask in background worker")
  await postSignupTask(taskArgs)
})

export default async ({ _args }) => {
  const worker = await faktory
    .work({
      url: process.env.FAKTORY_URL,
    })
    .catch((error) => {
      logger.error(`worker failed to start: ${error}`)
      process.exit(1)
    })

  worker.on('fail', ({ _job, error }) => {
    logger.error(`worker failed to start: ${error}`)
  })
}
```

This won't work yet as we haven't made `postSignupTask` in `api/src/lib/tasks.js` or set the `FAKTORY_URL`.
Set `FAKTORY_URL` in `.env` to where your Docker server's at.

In `postSignupTask`, we may want to perform operations that need to contact external services, such as sending an email.
For this type of work, we typically don't want to hold up the request/response cycle and can perform in the background. 

```javascript
// api/src/lib/tasks.js

export const postSignupTask = async ({ userId, emailPayload }) => {
  // Send a welcome email to new user.
  await sendEmailWithTemplate({
    ...emailPayload,
    TemplateModel: {
      ...emailPayload.TemplateModel,
    },
  })
}
```

Once we've created our task, we need to call it in the right place.
For this task, it makes sense to call it right after the user has completed their signup.
This is an example of a service that'll be most likely called through a GraphQL Mutation.

```javascript
// src/services/auth.js

const faktory = require('faktory-worker')

export const signUp = async ({ input }) => {
  // Perform all the signup operations, such as creating an entry in the DB and auth provider
  // ...

  // The, send our task to the Faktory server
  const client = await faktory.connect()
  await client.job('postSignupTask', { ...taskArgs, }).push()
  await client.close()
}

```

That's it—we're done!
Run your Faktory server using Docker and run the worker using `yarn rw exec faktoryWorker`.

If your Faktory server in running and you have set the `FAKTORY_URL` correctly, you'll see the server pick up the jobs and your worker process the job.