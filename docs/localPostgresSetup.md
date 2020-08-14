# Local Postgres Setup

RedwoodJS uses a SQLite database by default. While SQLite makes local development easy, you're
likely going to want to run the same database setup you use on production. Here's how to set up
Postgres.

## Install Postgres

Ensure you have Postgres installed and running on your machine. If you're on a Mac, we recommend
Homebrew:

```bash
brew install postgres
```

Follow the instructions provided. If you're using another platform, See
[prisma.io/docs/guides/database-workflows/setting-up-a-database/postgresql](https://www.prisma.io/docs/guides/database-workflows/setting-up-a-database/postgresql).


## Create Postgresql User

A default PostgresSQL installation always includes the `postgres` superuser. Initially, you must connect to PostgreSQL as the postgres user until you create other users (which are also referred to as roles).

To create new roles, follow [this](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04#step-3-%E2%80%94-creating-a-new-role).

## Update the Prisma Schema

Tell Prisma to use a Postgres database instead of SQLite by updating the `provider` attribute in your
`schema.prisma` file:

```prisma
// prisma/schema.prisma
datasource DS {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
```

## Connect to Postgres

Add a `DATABASE_URL` to your `.env` file with the URL of the database you'd like to use locally. The
following example uses `redwoodblog_dev` for the database. It also has `postgres` setup as a
superuser for ease of use.
```env
DATABASE_URL="postgresql://postgres@localhost/redwoodblog_dev?connection_limit=1"
```

Note the `connection_limit` parameter. This is [recommended by Prisma](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/deployment#recommended-connection-limit) when working with
relational databases in a Serverless context. You should also append this parameter to your production
`DATABASE_URL` when configuring your deployments.

> Note: local postgres server will need manual start/stop -- this is not handled automatically by RW CLI in a manner similar to sqlite

### Base URL and path

Here is an example of the structure of the base URL and the path using placeholder values in uppercase letters:
```bash
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```
The following components make up the base URL of your database, they are always required:
| Name | Placeholder | Description |
| ------ | ------ | ------|
| Host | `HOST`| IP address/domain of your database server, e.g. `localhost` |
| Port | `PORT` | Port on which your database server is running, e.g. `5432` |
| User | `USER` | Name of your database user, e.g. `postgres` |
| Password | `PASSWORD` | password of your database user |
| Database | `DATABASE` | Name of the database you want to use, e.g. `redwoodblog_dev` |

## Migrations
If you've already created migrations using SQLite, you just need to run migrations again:

```bash
yarn rw db up
```

If you haven't created migrations yet, use `save`:

```bash
yarn rw db save
```

Both commands will create and migrate the Postgres database you specified in your `.env`.


Here are our recommendations in case you need a tool to manage your databases:
- [Beekeeper Studio](https://www.beekeeperstudio.io/) (Linux, Mac, Windows - Open Source)
- [TablePlus](https://tableplus.com/) (Mac, Windows)
