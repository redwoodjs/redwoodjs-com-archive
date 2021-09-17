# Prisma

Prisma is one of Redwood's core technologies. 

Prisma itself is a suite of tools.
Of those, Redwood uses Prisma Client, Migrate, and Studio. (Which is nearly all of them!)
Of those, Client is the one that's most important for you to grok, with Migrate coming in as a close second.

## Prisma in Redwood 

The Prisma-specific files and directories in a Redwood Project are:

| File or Directory             | Description                               |
|:------------------------------|:------------------------------------------|
| `api/db`                      | Where your schema and migrations live     |
| `api/src/lib/db.js`           | Where your Prisma Client lives            |
| `node_modules/.prisma/client` | Where your Prisma Client _actually_ lives |

The last one is subtle, hidden, and maybe even a little counterintuitive. 
But it's something you really should know about, as it contains all your types!

## Configuring Prisma Client

You can configure your Prisma Client in `api/src/lib/db.js` (here the relevant Prisma docs are **Reference** > **Tools & Interface** > **Prisma Client** > [**Constructor**](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/constructor)):

```javascript{9}
// api/src/lib/db.js

import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()
```

Redwood doesn't do any configuring for you out of the box. 
All `db.js` does is instantiate the Prisma Client as `db` and export it (for your Services—it's how they talk to the database).

If you're really stuck and/or need to see what's going on at a more granular level for any reason, you can log anything you want with `log` and `db.on`:

```javascript
export const db = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
})

db.on(...)
```
