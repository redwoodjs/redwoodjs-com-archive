# Connection Pooling

> ⚠ **Work in Progress** ⚠️
>
> There's more to document here. In the meantime, you can check our [community forum](https://community.redwoodjs.com/search?q=connection%20pooling) for answers.
>
> Want to contribute? Redwood welcomes contributions and loves helping people become contributors.
> You can edit this doc [here](https://github.com/redwoodjs/redwoodjs.com/blob/main/docs/connectionPooling.md).
> If you have any questions, just ask for help! We're active on the [forums](https://community.redwoodjs.com/c/contributing/9) and on [discord](https://discord.com/channels/679514959968993311/747258086569541703).

Production Redwood apps should enable connection pooling in order to properly scale with your Serverless functions.

## Supabase

For Postgres running on [Supabase](https://supabase.io) see: [PgBouncer is now available in Supabase](https://supabase.io/blog/2021/04/02/supabase-pgbouncer#using-connection-pooling-in-supabase).

All new Supabase projects include connection pooling using [PgBouncer](https://www.pgbouncer.org/).

## Heroku
For Postgres, see [Postgres Connection Pooling](https://devcenter.heroku.com/articles/postgres-connection-pooling).

Heroku does not officially support MySQL.


## Digital Ocean
For Postgres, see [How to Manage Connection Pools](https://www.digitalocean.com/docs/databases/postgresql/how-to/manage-connection-pools)

Connection Pooling for MySQL is not yet supported.

## AWS
Use [Amazon RDS Proxy](https://aws.amazon.com/rds/proxy) for MySQL or PostgreSQL.

From the [AWS Docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html#rds-proxy.limitations): 
>Your RDS Proxy must be in the same VPC as the database. The proxy can't be publicly accessible. 

Because of this limitation, with out-of-the-box configuration, you can only use RDS Proxy if you're deploying your Lambda Functions to the same AWS account. Alternatively, you can use RDS directly, but you might require larger instances to handle your production traffic and the number of concurrent connections.


## Why Connection Pooling?

Relational databases have a maximum number of concurrent client connections.

* Postgres allows 100 by default
* MySQL allows 151 by default

In a traditional server environment, you would need a large amount of traffic (and therefore web servers) to exhaust these connections, since each web server instance typically leverages a single connection.

In a Serverless environment, each function connects directly to the database, which can exhaust limits quickly. To prevent connection errors, you should add a connection pooling service in front of your database. Think of it as a load balancer.
