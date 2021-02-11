# Self-hosting Redwood: Serverfull

Do you prefer to host a Redwood app on your own server, the traditional serverfull way, instead of all this serverless magic? Well, you can! In this recipe we configure a Redwood app with PM2 and Nginx on a Linux server.

## Example

A code example can be found at: https://github.com/njjkgeerts/redwood-pm2

The example can be viewed live at: http://redwood-pm2.nickgeerts.com

## Requirements

You should have some basic knowledge of the following tools.

- Linux
- [Nginx](https://nginx.org/en/docs/)
- [Postgres](https://www.postgresql.org/docs/)
- [PM2](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)
- Node
- Yarn

## Configuration

### Project

Add Redwood's API server (in the API workspace) and PM2 (in the root with the -W flag) to your project.

```termninal
yarn workspace api add @redwoodjs/api-server
yarn add -D pm2 -W
```

Create a PM2 ecosystem configuration file. For clarity, it's recommended to rename `ecosystem.config.js` to something like `pm2.config.js`.

```terminal
yarn pm2 init
mv ecosystem.config.js pm2.config.js
```

Edit redwood.toml to change the API endpoint:

```toml
apiProxyPath = "/api"
```

Optionally, add some scripts to your top-level package.json.

```json
"scripts": {
  "deploy:setup": "pm2 deploy pm2.config.js production setup",
  "deploy": "pm2 deploy pm2.config.js production deploy"
}
```

### Linux server

Your server should have a user for deployment, which should be configured with an SSH key pair providing access to your production environment. In this example, the user is named `deploy`.

### Nginx

Your Nginx configuration file for the app should look something like this. Typically, this file would be stored at `/etc/nginx/sites-available/redwood-pm2` and is symbolically linked to `/etc/nginx/sites-enabled/redwood-pm2`.

Please note that the trailing slash in the proxy_pass value is essential to correctly map the API functions.

```nginx
server {
  server_name redwood-pm2.example.com;
  listen 80;

  location / {
    root /home/deploy/redwood-pm2/current/web/dist;
  }

  location /api/ {
    proxy_pass http://localhost:8911/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### PM2

The pm2.config.js file is used for PM2 settings. The most important variables are at the top. Note that the port is only used locally on the server and should match the port in the Nginx config.

```javascript
const name = 'redwood-pm2' // Name to use in PM2
const repo = 'git@github.com:njjkgeerts/redwood-pm2.git' // Link to your repo
const user = 'deploy' // Server user
const path = `/home/${user}/${name}` // Path on the server to deploy to
const host = 'example.com' // Server hostname
const port = 8911 // Port to use locally on the server
const build = `yarn install && yarn rw build && yarn rw prisma deploy`

module.exports = {
  apps: [
    {
      name,
      node_args: '-r dotenv/config',
      cwd: `${path}/current/`,
      script: 'node_modules/@redwoodjs/api-server/dist/index.js',
      args: `-f api/dist/functions --port ${port}`,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user,
      host,
      ref: 'origin/master',
      repo,
      path,
      ssh_options: 'ForwardAgent=yes',
      'post-deploy': `${build} && pm2 reload pm2.config.js --env production && pm2 save`,
    },
  },
}
```

> Note: if you need to seed tour production database during your first deployment, you'll need to add `&& yarn rw prisma db seed` to the end of your build command. But don't forget to remove it prior to subsequent deploys!

> Caveat: the API seems to only work in fork mode in PM2, not [cluster mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)

## Deploying

### Preparation

First, we need to create the PM2 directories.

```terminal
yarn install
yarn deploy:setup
```

Your server directories are now set. However, the `.env` settings are not yet configured. SSH into your server and create an `.env` file in the `current` subdirectory of the deploy directory.

```terminal
vim /home/deploy/redwood-pm2/current/.env
```

For example, add a DATABASE_URL variable.

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/redwood-pm2
```

Now we can finally deploy the app.

### Actual deploy

Just run the following. It should update the code, take care of database migrations and restart the app in PM2.

```terminal
yarn deploy
```

Enjoy! 😁
