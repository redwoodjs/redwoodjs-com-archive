# Deploy

Redwood is designed for both serverless and traditional infrastructure deployments, offering a unique continuous deployment process in both cases:

1. code is committed to a repository on GitHub, GitLab, or Bitbucket, which triggers the deployment
2. the Redwood API Side and Web Side are individually prepared via a build process
3. during the build process, any database related actions are run (e.g. migrations)
4. the hosting provider deploys the built Web static assets to a CDN and the API code to a serverless backend (e.g. AWS Lambdas)

Currently, these are the officially supported deploy targets:
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com)
- [AWS-Serverless](https://serverless.com)
- [Render](https://render.com)

Redwood has a CLI generator that adds the code and configuration required by the specified provider (see the [CLI Doc](https://redwoodjs.com/docs/cli-commands#deploy-config) for more information):
```shell
yarn rw setup deploy <provider>
```

There are examples of deploying Redwood on other providers such as Google Cloud and direct to AWS. You can find more information by searching the [GitHub Issues](https://github.com/redwoodjs/redwood/issues) and [Forums](https://community.redwoodjs.com).


## General Deployment Setup
Deploying Redwood requires setup for the following four categories.

### 1. Host Specific Configuration
Each hosting provider has different requirements for how (and where) the deployment is configured. Sometimes you'll need to add code to your repository, configure settings in a dashboard, or both. You'll need to read the provider specific documentation.

The most important Redwood configuration is to set the `apiUrl` in your `redwood.toml` This sets the API path for your serverless functions specific to your hosting provider.

### 2. Build Command
The build command is used to prepare the Web and API for deployment. Additionally, other actions can be run during build such as database migrations. The Redwood build command must specify one of the supported hosting providers (aka `target`):

```shell
yarn rw deploy <target>
```

For example:

```shell
# Build command for Netlify deploy target
yarn rw deploy netlify
```

```shell
# Build command for Vercel deploy target
yarn rw deploy vercel
```


```shell
# Build command for AWS Lambdas using the https://serverless.com framework
yarn rw deploy aws serverless --side api
```

### 3. Prisma and Database
Redwood uses Prisma for managing database access and migrations. The settings in `api/prisma/schema.prisma` must include the correct deployment database, e.g. postgresql, and the database connection string.

To use PostgreSQL in production, include this in your `schema.prisma`:

```javascript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The `url` setting above accesses the database connection string via an environment variable, `DATABASE_URL`. Using env vars is the recommended method for both ease of development process as well as security best practices.

Whenever you make changes to your `schema.prisma`, you must run the following command:
```shell	
$ yarn rw prisma migrate dev # creates and applies a new Prisma DB migration	
```

> Note: when setting your production DATABASE_URL env var, be sure to also set any connection-pooling or sslmode parameters. For example, if using Supabase Postgres with pooling, then you would use a connection string similar to `postgresql://postgres:mydb.supabase.co:6432/postgres?sslmode=require&pgbouncer=true` that uses a specific 6432 port, informs Prisma to consider pgBouncer, and also to use SSL. See: [Connection Pooling](https://redwoodjs.com/docs/connection-pooling) for more info.



### 4. Environment Variables
Any environment variables used locally, e.g. in your `env.defaults` or `.env`, must also be added to your hosting provider settings. (See documentation specific to your provider.)

Additionally, if your application uses env vars on the Web Side, you must configure Redwood's build process to make them available in production. See the [Redwood Environment Variables doc](https://redwoodjs.com/docs/environment-variables) for instructions.


## Netlify Deploy

### Netlify tl;dr Deploy
If you simply want to experience the Netlify deployment process without a database and/or adding custom code, you can do the following:
1. create a new redwood project: `yarn create redwood-app ./netlify-deploy`
2. after your "netlify-deploy" project installation is complete, init git, commit, and add it as a new repo to GitHub, BitBucket, or GitLab
3. run the command `yarn rw setup deploy netlify` and commit and push changes
4. use the Netlify [Quick Start](https://app.netlify.com/signup) to deploy

### Netlify Complete Deploy Walkthrough
For the complete deployment process on Netlify, see the [Tutorial Deployment section](https://redwoodjs.com/tutorial/deployment).

## Render Deploy
Render is a unified cloud to build and run all your apps and websites with free SSL, a global CDN, private networks and auto deploys from Git — **database included**!
### Render tl;dr Deploy
If you simply want to experience the Render deployment process, including a Postgres or SQLite database, you can do the following:
1. create a new redwood project: `yarn create redwood-app ./render-deploy`
2. after your "render-deploy" project installation is complete, init git, commit, and add it as a new repo to GitHub or GitLab 
3. run the command `yarn rw setup deploy render`, use the flag `--database` to select from `postgresql`, `sqlite` or `none` to proceed without a database [default : `postgresql`]
4. follow the [Render Redwood Deploy Docs](https://render.com/docs/deploy-redwood) for detailed instructions

## Vercel Deploy

### Vercel CLI

1. Install the [Vercel CLI](https://vercel.com/cli) and run `vercel` to deploy.
2. Vercel will detect that you are using Redwood and will enable the correct settings for your deployment.
3. Your application is deployed! (e.g. [redwood-template.vercel.app](https://redwood-template.vercel.app/))

```bash
$ npm i -g vercel
$ vercel init redwoodjs
Vercel CLI
> Success! Initialized "redwoodjs" example in ~/your-folder.
- To deploy, `cd redwoodjs` and run `vercel`.
```

### Vercel for Git

1. Push your code to your git repository (GitHub, GitLab, BitBucket).
2. [Import your Redwood project](https://vercel.com/new) into Vercel.
3. Optional: Add `DATABASE_URL` to the Environment Variables if you're [using a database](#3-prisma-and-database).
4. Vercel will detect that you are using Redwood and will enable the correct settings for your deployment.
5. Your application is deployed! (e.g. [redwood-template.vercel.app](https://redwood-template.vercel.app/))

After your project has been imported and deployed, all subsequent pushes to branches will generate [Preview Deployments](https://vercel.com/docs/concepts/deployments/environments#preview), and all changes made to the Production Branch (commonly “main”) will result in a [Production Deployment](https://vercel.com/docs/concepts/deployments/environments#production).

Learn more about Vercel’s [Git Integration](https://vercel.com/docs/concepts/git).

## AWS Serverless Deploy
>The following instructions assume you have read the [General Deployment Setup](#general-deployment-setup) section above.

Deploying via AWS Serverless assumes that you have setup the [credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) for the Serverless Framework on your computer. In order to setup your Redwood project to use AWS Serverless run: `yarn rw setup deploy aws-serverless`

Once that's complete you can invoke a deployment via: `yarn rw deploy aws`. This command will take care of building, packaging, and shipping your AWS Serverless functions.
