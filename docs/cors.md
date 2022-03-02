# CORS

CORS stands for [Cross Origin Resource Sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing); in a nutshell, by default, browsers aren't allowed to access resources outside their own domain.

## When you need to worry about CORS

If your api and web sides are deployed to different domains, you'll have to worry about CORS. For example, if your web side is deployed to `example.com` but your api is `api.example.com`. For security reasons your browser will not allow XHR requests (like the kind that the GraphQL client makes) to a domain other than the one currently in the browser's address bar.

This will become obvious when you point your browser to your site and see none of your GraphQL data. When you look in the web inspector you'll see a message along the lines of:

> ⛔️ Access to fetch https://example.com has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

## GraphQL Config

You'll need to add CORS headers to GraphQL responses. You can do this easily enough by adding the `cors` option in `api/src/functions/graphql.{js|t}s`:

```diff
export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: {} },
  directives,
  sdls,
  services,
+  cors: {
+    origin: 'https://example.com',
+    credentials: true,
+  },
  onException: () => {
    // Disconnect from your database with an unhandled exception.
    db.$disconnect()
  },
})
```

Note that the `origin` needs to be a complete URL including the scheme (https). This is the domain that requests are allowed to come *from*. In this example we assume the web side is served from `https://example.com`. If you have multiple servers that should be allowed to access the api, you can pass an array of them instead:

```javascript
cors: {
  origin: ['https://example.com', 'https://www.example.com']
  credentials: true,
},
```

The proper one will be included in the CORS header depending on where the response came from.

## Authentication Config

The following config only applies if you're using [dbAuth](/docs/authentication#self-hosted-auth-installation-and-setup), which is Redwood's own cookie-based auth system.

You'll need to configure several things:

* Add CORS config for GraphQL
* Add CORS config for the auth function
* Cookie config for the auth function
* Allow sending of credentials in GraphQL XHR requests
* Allow sending of credentials in auth function requests

Here's how you configure each of these:

### GraphQL CORS Config

See [GraphQL Config](#graphql-config) above

### Auth CORS Config

Similar to the `cors` options being sent to GraphQL, you can set similar options in `api/src/functions/auth.js` (or `auth.ts`):

```diff
const authHandler = new DbAuthHandler(event, context, {
  db: db,
  authModelAccessor: 'user',
  authFields: {
    id: 'id',
    username: 'email',
    hashedPassword: 'hashedPassword',
    salt: 'salt',
    resetToken: 'resetToken',
    resetTokenExpiresAt: 'resetTokenExpiresAt',
  },
+  cors: {
+    credentials: true,
+    origin: 'https://example.com',
+  },
  cookie: {
    HttpOnly: true,
    Path: '/',
    SameSite: 'Strict',
    Secure: true,
  },
  forgotPassword: forgotPasswordOptions,
  login: loginOptions,
  resetPassword: resetPasswordOptions,
  signup: signupOptions,
})
```

Just like the GraphQL config, `origin` is the domain(s) that requests come *from* (the web side).

### Cookie Config

In order to be able accept cookies from another domain we'll need to make a change to the `SameSite` option in `api/src/functions/auth.js` and it to `None`:

```javascript {4}
  cookie: {
    HttpOnly: true,
    Path: '/',
    SameSite: 'None',
    Secure: true,
  },
```

### GraphQL XHR Credentials

Next we need to tell the GraphQL client to include credentials (the dbAuth cookie) in any requests. This config goes in `web/src/App.js`:

```javascript {5-9}
const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider type="dbAuth">
        <RedwoodApolloProvider
          graphQLClientConfig={{
            httpLinkConfig: { credentials: 'include' },
          }}
        >
          <Routes />
        </RedwoodApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)
```

### Auth XHR Credentials

Finally, we need to tell dbAuth to include credentials in its own XHR requests:

```javascript {4}
const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider type="dbAuth" config={{ credentials: 'include' }}>
        <RedwoodApolloProvider
          graphQLClientConfig={{
            httpLinkConfig: { credentials: 'include' },
          }}
        >
          <Routes />
        </RedwoodApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)
```

## Avoiding CORS

Is there a way to avoid all this CORS junk altogether? Yes!

If you can add a proxy between your web and api sides, all requests will *appear* to be going to and from the same domain (the web side, even though behind the scenes they are forwarded somewhere else). This functionality is included automatically with hosts like [Netlify](https://docs.netlify.com/routing/redirects/rewrites-proxies/#proxy-to-another-service) or [Vercel](https://vercel.com/docs/cli#project-configuration/rewrites) but you can usually add to any most providers through a combination of provider-specific config and/or web server configuration.
