# Prisma

Prisma is one of Redwood's core technologies. 

Prisma itself is a suite of tools.
Of those, Redwood uses Prisma Client, Migrate, and Studio. (Which is nearly all of them!)
Of those, Client is the one that's most important for you to grok, with Migrate coming in as a close second.

## Prisma in Redwood 

The Prisma-specific files and directories in a Redwood Project are:

| Files and Directories             | Description                               |
|:------------------------------|:------------------------------------------|
| `api/db`                      | Where your schema and migrations live     |
| `api/src/lib/db.js`           | Where your Prisma Client lives            |
| `node_modules/.prisma/client` | Where your Prisma Client _actually_ lives |

The last one is subtle, hidden, and maybe even a little counterintuitive. 
But it's something you really should know about, as it contains all your types!

## Configuring Prisma Client

You can configure Prisma Client in `api/src/lib/db.js` (here the relevant Prisma docs are **Reference** > **Tools & Interface** > **Prisma Client** > [**Constructor**](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/constructor)):

```javascript{4}
// api/src/lib/db.js
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()
```
