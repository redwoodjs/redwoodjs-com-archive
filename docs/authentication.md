# Authentication

`@redwoodjs/auth` contains both a build-in database-backed authentication system (dbAuth), as well as lightweight wrappers around popular SPA authentication libraries.

We currently support the following third-party authentication providers:

- [Netlify Identity Widget](https://github.com/netlify/netlify-identity-widget)
- [Auth0](https://github.com/auth0/auth0-spa-js)
- [Azure Active Directory](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Netlify GoTrue-JS](https://github.com/netlify/gotrue-js)
- [Magic Links - Magic.js](https://github.com/MagicHQ/magic-js)
- [Firebase's GoogleAuthProvider](https://firebase.google.com/docs/reference/js/firebase.auth.GoogleAuthProvider)
- [Ethereum](https://github.com/oneclickdapp/ethereum-auth)
- [Supabase](https://supabase.io/docs/guides/auth)
- [Nhost](https://docs.nhost.io/auth)
- Custom
- [Contribute one](https://github.com/redwoodjs/redwood/tree/main/packages/auth), it's SuperEasy™!

Check out the [Auth Playground](https://github.com/redwoodjs/playground-auth).

## Self-hosted Auth Installation and Setup

Redwood's own dbAuth provides several benefits:

* Use your own database for storing user credentials
* Use your own login and signup pages
* Customize login session length
* Use your own database for storing user credentials
* No external dependencies
* No user data ever leaves your servers
* No additional charges/limits based on number of users

And potentially one large drawback:

* Use your own database for storing user credentials

However, we're following best practicies for storing these credentials:

1. Users' passwords are [salted and hashed](https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/) with PBKDF2 before being stored
2. Plaintext passwords are never stored anywhere, and only transferred between client and server during the login/signup phase (and hopefully only over HTTPS)
3. Our logger scrubs senative parameters (like `password`) before they are output

Even if you later decide you want to let someone else handle your user data for you, dbAuth is a great option for getting up and running quickly (we even have a generator for creating basic login and signup pages for you).

### How It Works

dbAuth relies on good ol' fashioned cookies to determine whether a user is logged in or not. On an attempted login, a serverless function on the api-side checks whether a user exists with the given username (internally, dbAuth refers to this field as *username* but you can use anything you want, like an email address). If a user with that username is found, does their salted and hashed password match the one in the database?

If so, an [HttpOnly](https://owasp.org/www-community/HttpOnly), [Secure](https://owasp.org/www-community/controls/SecureCookieAttribute), [SameSite](https://owasp.org/www-community/SameSite) cookie (dbAuth calls this the "session cookie") is sent back to the browser containing the ID of the user. The content of the cookie is a simple string, but AES encrypted with a secret key (more on that later).

When the user makes a GraphQL call, we decrypt the cookie and make sure that the user ID contained within still exists in the database. If so, the request is allowed to proceed.

If there are any shenanegans detected (the cookie can't be decrypted properly, or the user ID found in the cookie does not exist in the database) the user is immediately logged out by expiring the session cookie.

### Setup

A single CLI command will get you everything you need to get dbAuth working, minus the actual login/signup pages:

    yarn rw setup auth dbAuth

Read the post-install instructions carefully as they contain instructions for adding database fields for the hashed password and salt, as well as how to configure the auth serverless function based on the name of the table that stores your user data.

This command will also append a `SESSION_SECRET` environment variable and a long string to your `.env` file (or create the file if it doesn't exist). This is used to encrypt the session cookie.

> The `.env` file is set to be ignored by git and not committed to version control. There is another file, `.env.defaults`, which is meant to be safe to commit and contain simple ENV vars that your dev team can share. The encryption key for the session cookie is NOT one of these shareable vars!

### Scaffolding Login/Signup Pages

If you don't want to create your own login and signup pages from scratch we've got a generator for that:

    yarn rw g scaffold dbAuth

Again, check the post-install instructions for one change you need to make to both pages: where to redirect the user to once their login/signup is successful.

If you'd rather create your own, you might want to still start from the generated pages as they'll contain the other code you need to actually submit the login credentials or signup fields to the server for processing.

### Configuration

By default, the session cookie will not have the `Domain` property set, which a browser will default to be the [current domain only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent). If your site is spread across multiple domains (for example, your site is at `example.com` but your api-side is deployed to `api.example.com`) you'll need to explictly set a Domain so that the cookie is accessible to both.

Create an environment variable named `DBAUTH_COOKIE_DOMAIN` set to the root domain of your site, which will allow it to be read by all subdomains as well. For example:

    DBAUTH_COOKIE_DOMAIN=example.com

If you need to change the secret key that's used to encrypt the session cookie, or deploy to a new target (each deploy environment should have its own unique secret key) we've got a CLI tool for creating a new one:

    yarn rw g secret

Note that the secret that's output is *not* appended to your `.env` file or anything else, it's merely output to the screen. You'll need to put it in the right place after that.

> If you didn't see the [warning above](#setup), here it is again: the secret key should *never* be committed to version control!

## Third Party Providers Installation and Setup

You will need to instantiate your authentication client and pass it to the `<AuthProvider>`. See instructions below for your specific provider.

### Netlify Identity Widget

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth netlify
```

_If you prefer to manually install the package and add code_, run the following command and then add the required code provided in the next section.

```bash
cd web
yarn add @redwoodjs/auth netlify-identity-widget
```

#### Setup

You will need to enable Identity on your Netlify site. See [Netlify Identity Setup](https://redwoodjs.com/tutorial/authentication#netlify-identity-setup).

```js
// web/src/App.js
import { AuthProvider } from '@redwoodjs/auth'
import netlifyIdentity from 'netlify-identity-widget'
import { isBrowser } from '@redwoodjs/prerender/browserUtils'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

isBrowser && netlifyIdentity.init()

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={netlifyIdentity} type="netlify">
      <RedwoodApolloProvider>
        <Routes />
      </RedwoodApolloProvider>
    </AuthProvider>
  </FatalErrorBoundary>
)

export default App
```

#### Netlify Identity Auth Provider Specific Setup

See the Netlify Identity information within this doc's [Auth Provider Specific Integration](https://redwoodjs.com/docs/authentication.html#auth-provider-specific-integration) section.

+++

### GoTrue-JS

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth goTrue
```

_If you prefer to manually install the package and add code_, run the following command and then add the required code provided in the next section.

```bash
cd web
yarn add @redwoodjs/auth gotrue-js
```

#### Setup

You will need to enable Identity on your Netlify site. See [Netlify Identity Setup](https://redwoodjs.com/tutorial/authentication#netlify-identity-setup).

Add the GoTrue-JS package to the web side:

```terminal
yarn workspace web add gotrue-js
```

Instantiate GoTrue and pass in your configuration. Be sure to set APIUrl to the API endpoint found in your Netlify site's Identity tab:

```js
// web/src/App.js
import { AuthProvider } from '@redwoodjs/auth'
import GoTrue from 'gotrue-js'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

const goTrueClient = new GoTrue({
  APIUrl: 'https://MYAPP.netlify.app/.netlify/identity',
  setCookie: true,
})

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={goTrueClient} type="goTrue">
      <RedwoodApolloProvider>
        <Routes />
      </RedwoodApolloProvider>
    </AuthProvider>
  </FatalErrorBoundary>
)

export default App
```

+++

### Auth0

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth auth0
```

_If you prefer to manually install the package and add code_, run the following command and then add the required code provided in the next section.

```bash
cd web
yarn add @redwoodjs/auth @auth0/auth0-spa-js
```

#### Setup

To get your application keys, only complete the ["Configure Auth0"](https://auth0.com/docs/quickstart/spa/react#get-your-application-keys) section of the SPA Quickstart guide.

**NOTE** If you're using Auth0 with Redwood then you must also [create an API](https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api) and set the audience parameter, or you'll receive an opaque token instead of the required JWT token.

The `useRefreshTokens` options is required for automatically extending sessions beyond that set in the initial JWT expiration (often 3600/1 hour or 86400/1 day).

If you want to allow users to get refresh tokens while offline, you must also enable the Allow Offline Access switch in your Auth0 API Settings as part of setup configuration. See: [https://auth0.com/docs/tokens/refresh-tokens](https://auth0.com/docs/tokens/refresh-tokens)

You can increase security by using refresh token rotation which issues a new refresh token and invalidates the predecessor token with each request made to Auth0 for a new access token.

Rotating the refresh token reduces the risk of a compromised refresh token. For more information, see: [https://auth0.com/docs/tokens/refresh-tokens/refresh-token-rotation](https://auth0.com/docs/tokens/refresh-tokens/refresh-token-rotation).

> **Including Environment Variables in Serverless Deployment:** in addition to adding the following env vars to your deployment hosting provider, you _must_ take an additional step to include them in your deployment build process. Using the names exactly as given below, follow the instructions in [this document](https://redwoodjs.com/docs/environment-variables) to "Whitelist them in your `redwood.toml`".

```js
// web/src/App.js
import { AuthProvider } from '@redwoodjs/auth'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  client_id: process.env.AUTH0_CLIENT_ID,
  redirect_uri: process.env.AUTH0_REDIRECT_URI,

  // ** NOTE ** Storing tokens in browser local storage provides persistence across page refreshes and browser tabs.
  // However, if an attacker can achieve running JavaScript in the SPA using a cross-site scripting (XSS) attack,
  // they can retrieve the tokens stored in local storage.
  // https://auth0.com/docs/libraries/auth0-spa-js#change-storage-options
  cacheLocation: 'localstorage',
  audience: process.env.AUTH0_AUDIENCE,

  // @MARK: useRefreshTokens is required for automatically extending sessions
  // beyond that set in the initial JWT expiration.
  //
  // @MARK: https://auth0.com/docs/tokens/refresh-tokens
  // useRefreshTokens: true,
})

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={auth0} type="auth0">
      <RedwoodApolloProvider>
        <Routes />
      </RedwoodApolloProvider>
    </AuthProvider>
  </FatalErrorBoundary>
)

export default App
```

#### Login and Logout Options

When using the Auth0 client, `login` and `logout` take `options` that can be used to override the client config:

- `returnTo`: a permitted logout url set in Auth0
- `redirectTo`: a target url after login

The latter is helpful when an unauthenticated user visits a Private route, but then is redirected to the `unauthenticated` route. The Redwood router will place the previous requested path in the pathname as a `redirectTo` parameter which can be extracted and set in the Auth0 `appState`. That way, after successfully logging in, the user will be directed to this `targetUrl` rather than the config's callback.

```js
const UserAuthTools = () => {
  const { loading, isAuthenticated, logIn, logOut } = useAuth()

  if (loading) {
    // auth is rehydrating
    return null
  }

  return (
    <Button
      onClick={async () => {
        if (isAuthenticated) {
          await logOut({ returnTo: process.env.AUTH0_REDIRECT_URI })
        } else {
          const searchParams = new URLSearchParams(window.location.search)
          await logIn({
            appState: { targetUrl: searchParams.get('redirectTo') },
          })
        }
      }}
    >
      {isAuthenticated ? 'Log out' : 'Log in'}
    </Button>
  )
}
```

#### Auth0 Auth Provider Specific Setup

See the Auth0 information within this doc's [Auth Provider Specific Integration](https://redwoodjs.com/docs/authentication.html#auth-provider-specific-integration) section.

+++

### Azure Active Directory

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth azureActiveDirectory
```

_If you prefer to manually install the package and add code_, run the following command and then add the required code provided in the next section.

```bash
cd web
yarn add msal
```

#### Setup

To get your application credentials, create an [App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) in your Azure Active Directory tenant. Take a note of your generated _Application ID_ (client), and the _Directory ID_ (tenant).

##### Redirect URIs

Enter allowed redirect urls for the integrations, e.g. `http://localhost:8910`. This will be the `AZURE_ACTIVE_DIRECTORY_REDIRECT_URI` environment variable, and suggestively `AZURE_ACTIVE_DIRECTORY_LOGOUT_REDIRECT_URI`.

##### ID tokens

Under the _Authentication_ tab, tick `ID tokens`.

This allows an application to request a token directly from the authorization endpoint. Checking Access tokens and ID tokens is recommended only if the application has a single-page architecture (SPA). [Learn more about implicit grant flow](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-implicit-grant-flow?WT.mc_id=Portal-Microsoft_AAD_RegisteredApps).

#### Authority

The Authority is a URL that indicates a directory that MSAL can request tokens from which you can read about [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-client-application-configuration#authority). However, you most likely want to have e.g. `https://login.microsoftonline.com/<tenant>` as Authority URL, where `<tenant>` is the Azure Active Directory tenant id. This will be the `AZURE_ACTIVE_DIRECTORY_AUTHORITY` environment variable.

```js
// web/src/App.js
import { AuthProvider } from '@redwoodjs/auth'
import { UserAgentApplication } from 'msal'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

const azureActiveDirectoryClient = new UserAgentApplication({
  auth: {
    clientId: process.env.AZURE_ACTIVE_DIRECTORY_CLIENT_ID,
    authority: process.env.AZURE_ACTIVE_DIRECTORY_AUTHORITY,
    redirectUri: process.env.AZURE_ACTIVE_DIRECTORY_REDIRECT_URI,
    postLogoutRedirectUri: process.env.AZURE_ACTIVE_DIRECTORY_LOGOUT_REDIRECT_URI,
  },
})

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={azureActiveDirectoryClient} type="azureActiveDirectory">
      <RedwoodApolloProvider>
        <Routes />
      </RedwoodApolloProvider>
    </AuthProvider>
  </FatalErrorBoundary>
)

export default App
```

#### Roles

To setup your App Registration with custom roles and have them exposed via the `roles` claim, follow [this documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps).

#### Login Options

Options in method `logIn(options?)` is of type [AuthRequest](https://pub.dev/documentation/msal_js/latest/msal_js/AuthRequest-class.html) and is a good place to pass in optional [scopes](https://docs.microsoft.com/en-us/graph/permissions-reference#user-permissions) to be authorized. By default, MSAL sets `scopes` to [/.default](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#the-default-scope) which is built in for every application that refers to the static list of permissions configured on the application registration. Furthermore, MSAL will add `openid` and `profile` to all requests. In example below we explicit include `User.Read.All` to the login scope.

```js
await logIn({
  scopes: ['User.Read.All'], // becomes ['openid', 'profile', 'User.Read.All']
})
```

See [loginPopup](https://pub.dev/documentation/msal_js/latest/msal_js/UserAgentApplication/loginPopup.html), [UserAgentApplication class ](https://pub.dev/documentation/msal_js/latest/msal_js/UserAgentApplication-class.html#constructors) and [Scopes Behavior](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-core/docs/scopes.md#scopes-behavior) for more documentation.

#### getToken Options

Options in method `getToken(options?)` is of type [AuthRequest](https://pub.dev/documentation/msal_js/latest/msal_js/AuthRequest-class.html). By default, `getToken` will be called with scope `['openid', 'profile']`. As Azure Active Directory apply [incremental consent](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md#dynamic-scopes-and-incremental-consent), we can extend the permissions from the login example by including another scope, for example `Mail.Read`.

```js
await getToken({
  scopes: ['Mail.Read'], // becomes ['openid', 'profile', 'User.Read.All', 'Mail.Read']
})
```

See [acquireTokenSilent](https://pub.dev/documentation/msal_js/latest/msal_js/UserAgentApplication/acquireTokenSilent.html), [Resources and Scopes](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md#resources-and-scopes) or [full class documentation](https://pub.dev/documentation/msal_js/latest/msal_js/UserAgentApplication-class.html#constructors) for more documentation.

+++

### Magic.Link

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth magicLink
```

_If you prefer to manually install the package and add code_, run the following command and then add the required code provided in the next section.

```bash
cd web
yarn add @redwoodjs/auth magic-sdk
```

#### Setup

To get your application keys, go to [dashboard.magic.link](https://dashboard.magic.link/) then navigate to the API keys add them to your `.env`.

> **Including Environment Variables in Serverless Deployment:** in addition to adding the following env vars to your deployment hosting provider, you _must_ take an additional step to include them in your deployment build process. Using the names exactly as given below, follow the instructions in [this document](https://redwoodjs.com/docs/environment-variables) to "Whitelist them in your `redwood.toml`".

```js
// web/src/App.js|tsx
import { useAuth, AuthProvider } from '@redwoodjs/auth'
import { Magic } from 'magic-sdk'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

const m = new Magic(process.env.MAGICLINK_PUBLIC)

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={m} type="magicLink">
      <RedwoodApolloProvider useAuth={useAuth}>
        <Routes />
      </RedwoodApolloProvider>
    </AuthProvider>
  </FatalErrorBoundary>
)

export default App
```

```js
// web/src/Routes.js|tsx
import { useAuth } from '@redwoodjs/auth'
import { Router, Route } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route path="/" page={HomePage} name="home" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
```

#### Magic.Link Auth Provider Specific Integration

See the Magic.Link information within this doc's [Auth Provider Specific Integration](https://redwoodjs.com/docs/authentication.html#auth-provider-specific-integration) section.
+++

### Firebase

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth firebase
```

#### Setup

We're using [Firebase Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin), so you'll have to follow the ["Before you begin"](https://firebase.google.com/docs/auth/web/google-signin#before_you_begin) steps in this guide. **Only** follow the "Before you begin" parts.

> **Including Environment Variables in Serverless Deployment:** in addition to adding the following env vars to your deployment hosting provider, you _must_ take an additional step to include them in your deployment build process. Using the names exactly as given below, follow the instructions in [this document](https://redwoodjs.com/docs/environment-variables) to "Whitelist them in your `redwood.toml`".

```js
// web/src/App.js
import { AuthProvider } from '@redwoodjs/auth'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { FatalErrorBoundary } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

const firebaseClient = ((config) => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config)
  }
  return firebase
})(firebaseClientConfig)

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={firebaseClient} type="firebase">
      <RedwoodApolloProvider>
        <Routes />
      </RedwoodApolloProvider>
    </AuthProvider>
  </FatalErrorBoundary>
)

export default App
```

#### Usage

```js
const UserAuthTools = () => {
  const { loading, isAuthenticated, logIn, logOut } = useAuth()

  if (loading) {
    return null
  }

  return (
    <Button
      onClick={async () => {
        if (isAuthenticated) {
          await logOut()
          navigate('/')
        } else {
          await logIn()
        }
      }}
    >
      {isAuthenticated ? 'Log out' : 'Log in'}
    </Button>
  )
}
```

#### Firebase Auth Provider Specific Integration

See the Firebase information within this doc's [Auth Provider Specific Integration](https://redwoodjs.com/docs/authentication.html#auth-provider-specific-integration) section.
+++

### Supabase

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth supabase
```

#### Setup

Update your .env file with the following settings supplied when you created your new Supabase project:

- `SUPABASE_URL` with the unique Supabase URL for your project
- `SUPABASE_KEY` with the unique Supabase Key that identifies which API KEY to use
- `SUPABASE_JWT_SECRET` with the secret used to sign and verify the JSON Web Token (JWT)

You can find these values in your project's dashboard under Settings -> API.

For full client docs, see: <https://supabase.io/docs/library/getting-started#reference>

#### Usage

Supabase supports several sign in methods:

- email/password
- passwordless via emailed magiclink
- Sign in with redirect. You can control where the user is redirected to after they are logged in via a `redirectTo` option.
- Sign in using third-party providers/OAuth via Apple, Azure Active Directory, Bitbucket, Facebook, GitHub, GitLab, Google or Twitter logins.
- Sign in with a valid refresh token that was returned on login.
- Sign in with scopes. If you need additional data from an OAuth provider, you can include a space-separated list of `scopes` in your request options to get back an OAuth `provider_token`.

Depending on the credentials provided:

- A user can sign up either via email or sign in with supported OAuth provider: `'apple' | 'azure' | 'bitbucket' | 'facebook' | 'github' | 'gitlab' | 'google' | 'twitter'`
- If you sign in with a valid refreshToken, the current user will be updated
- If you provide email without a password, the user will be sent a magic link.
- The magic link's destination URL is determined by the SITE_URL config variable. To change this, you can go to Authentication -> Settings on `app.supabase.io` for your project.
- Specifying an OAuth provider (such as Bitbucket, GitHub, GitLab, or Google) will open the browser to the relevant login page
- Note: You must enable and configure the OAuth provider appropriately. To configure these providers, you can go to Authentication -> Settings on `app.supabase.io` for your project.

For full Sign In docs, see: <https://supabase.io/docs/client/auth-signin>

+++

### Ethereum

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth ethereum
```

#### Setup

To complete setup, you'll also need to update your `api` server manually. See https://github.com/oneclickdapp/ethereum-auth for instructions.

+++

### Nhost

+++ View Installation and Setup

#### Installation

The following CLI command will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth nhost
```

#### Setup

Update your .env file with the following setting which can be found on your Nhost project's dashboard.

- `NHOST_BACKEND_URL` with the unique Nhost Backend (Auth & Storage) URL for your project.
- `NHOST_JWT_SECRET` with the JWT Key secret that you have set in your project's Settings > Hasura "JWT Key" section.

#### Usage

Nhost supports the following methods:

- email/password
- OAuth (via GitHub, Google, Facebook, or Linkedin).

Depending on the credentials provided:

- A user can sign in either via email or a supported OAuth provider.
- A user can sign up via email and password. For OAuth simply sign in and the user account will be created if it does not exist.
- Note: You must enable and configure the OAuth provider appropriately. To configure these providers, you can go to the project's Settings -> Sign-In Methods page at `console.nhost.io`.

For the docs on Authentication, see: <https://docs.nhost.io/auth>

If you are also **using Nhost as your GraphQL API server**, you will need to pass `skipFetchCurrentUser` as a prop to `AuthProvider` , as follows:

```js
<AuthProvider client={nhost} type="nhost" skipFetchCurrentUser>
```

This avoids having an additional request to fetch the current user which is meant to work with Apollo Server and Prisma.

Important: The `skipFetchCurrentUser` attribute is **only** needed if you are **not** using the standard RedwoodJS api side GraphQL Server.
+++

### Custom

+++ View Installation and Setup

#### Installation

The following CLI command (not implemented, see https://github.com/redwoodjs/redwood/issues/1585) will install required packages and generate boilerplate code and files for Redwood Projects:

```terminal
yarn rw setup auth custom
```

#### Setup

It is possible to implement a custom provider for Redwood Auth. In which case you might also consider adding the provider to Redwood itself.

If you are trying to implement your own auth, support is very early and limited at this time. Additionally, there are many considerations and responsibilities when it comes to managing custom auth. For most cases we recommend using an existing provider.

However, there are examples contributed by developers in the Redwood forums and Discord server.

The most complete example (although now a bit outdated) is found in [this forum thread](https://community.redwoodjs.com/t/custom-github-jwt-auth-with-redwood-auth/610). Here's another [helpful message in the thread](https://community.redwoodjs.com/t/custom-github-jwt-auth-with-redwood-auth/610/25).
+++

## API

The following values are available from the `useAuth` hook:

- async `logIn(options?)`: Differs based on the client library, with Netlify Identity a pop-up is shown, and with Auth0 the user is redirected. Options are passed to the client.
- async `logOut(options?)`: Log the current user out. Options are passed to the client.
- async `signUp(options?)`: If the provider has a sign up flow we'll show that, otherwise we'll fall back to the logIn flow.
- `currentUser`: An object containing information about the current user as set on the `api` side, or `null` if the user is not authenticated.
- `userMetadata`: An object containing the user's metadata (or profile information) fetched directly from an instance of the auth provider client, or `null` if the user is not authenticated.
- async `reauthenticate()`: Refetch the authentication data and populate the state.
- async `getToken()`: Returns a JWT.
- `client`: Access the instance of the client which you passed into `AuthProvider`.
- `isAuthenticated`: Determines if the current user has authenticated.
- `hasRole(['admin'])`: Determines if the current user is assigned a role like `"admin"` or assigned to any of the roles in a list such as `['editor', 'author']`.
- `loading`: The auth state is restored asynchronously when the user visits the site for the first time, use this to determine if you have the correct state.

## Usage in Redwood

Redwood provides a zeroconf experience when using our Auth package!

### GraphQL Query and Mutations

GraphQL requests automatically receive an `Authorization` JWT header when a user is authenticated.

### Auth Provider API

If a user is signed in, the `Authorization` token is verified, decoded and available in `context.currentUser`

```js
import { context } from '@redwoodjs/api'

console.log(context.currentUser)
// {
//    sub: '<netlify-id>
//    email: 'user@example.com',
//    [...]
// }
```

You can map the "raw decoded JWT" into a real user object by passing a `getCurrentUser` function to `createCreateGraphQLHandler`

Our recommendation is to create a `src/lib/auth.js|ts` file that exports a `getCurrentUser`. (Note: You may already have stub functions.)

```js
import { getCurrentUser } from 'src/lib/auth'
// Example:
//  export const getCurrentUser = async (decoded) => {
//    return await db.user.findUnique({ where: { decoded.email } })
//  }
//

export const handler = createGraphQLHandler({
  schema: makeMergedSchema({
    schemas,
    services: makeServices({ services }),
  }),
  getCurrentUser,
})
```

The value returned by `getCurrentUser` is available in `context.currentUser`

Use `requireAuth` in your services to check that a user is logged in,
whether or not they are assigned a role, and optionally raise an
error if they're not.

```js
export const requireAuth = ({ role }) => {
  if (!context.currentUser) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (typeof role !== 'undefined' && !context.currentUser.roles?.includes(role)) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}
```

### Auth Provider Specific Integration

#### Auth0

If you're using Auth0 you must also [create an API](https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api) and set the audience parameter, or you'll receive an opaque token instead of a JWT token, and Redwood expects to receive a JWT token.

+++ View Auth0 Options

#### Role-based access control (RBAC) in Auth0

[Role-based access control (RBAC)](https://auth0.com/docs/authorization/concepts/rbac) refers to the idea of assigning permissions to users based on their role within an organization. It provides fine-grained control and offers a simple, manageable approach to access management that is less prone to error than assigning permissions to users individually.

Essentially, a role is a collection of permissions that you can apply to users. A role might be "admin", "editor" or "publisher". This differs from permissions an example of which might be "publish:blog".

#### App metadata in Auth0

Auth0 stores information (such as, support plan subscriptions, security roles, or access control groups) in `app_metadata`. Data stored in `app_metadata` cannot be edited by users.

Create and manage roles for your application in Auth0's "User & Role" management views. You can then assign these roles to users.

However, that info is not immediately available on the user's `app_metadata` or to RedwoodJS when authenticating.

If you assign your user the "admin" role in Auth0, you will want your user's `app_metadata` to look like:

```
{
  "roles": [
    "admin"
  ]
}
```

To set this information and make it available to RedwoodJS, you can use [Auth0 Rules](https://auth0.com/docs/rules).

#### Auth0 Rules for App Metadata

RedwoodJS needs `app_metadata` to 1) contain the role information and 2) be present in the JWT that is decoded.

To accomplish these tasks, you can use [Auth0 Rules](https://auth0.com/docs/rules) to add them as custom claims on your JWT.

#### Add Authorization Roles to App Metadata Rule

Your first rule will `Add Authorization Roles to App Metadata`.

```js
/// Add Authorization Roles to App Metadata
function (user, context, callback) {
    auth0.users.updateAppMetadata(user.user_id, context.authorization)
      .then(function(){
          callback(null, user, context);
      })
      .catch(function(err){
          callback(err);
      });
  }
```

Auth0 exposes the user's roles in `context.authorization`. This rule simply copies that information into the user's `app_metadata`, such as:

```
{
  "roles": [
    "admin"
  ]
}
```

However, now you must include the `app_metadata` on the user's JWT that RedwoodJS will decode.

#### Add App Metadata to JWT Rule in Auth0

Therefore, your second rule will `Add App Metadata to JWT`.

You can add `app_metadata` to the `idToken` or `accessToken`.

Adding to `idToken` will make the make app metadata accessible to RedwoodJS `getUserMetadata` which for Auth0 calls the auth client's `getUser`.

Adding to `accessToken` will make the make app metadata accessible to RedwoodJS when decoding the JWT via `getToken`.

While adding to `idToken` is optional, you _must_ add to `accessToken`.

To keep your custom claims from colliding with any reserved claims or claims from other resources, you must give them a [globally unique name using a namespaced format](https://auth0.com/docs/tokens/guides/create-namespaced-custom-claims). Otherwise, Auth0 will _not_ add the information to the token(s).

Therefore, with a namespace of "https://example.com", the `app_metadata` on your token should look like:

```js
"https://example.com/app_metadata": {
  "authorization": {
    "roles": [
      "admin"
    ]
  }
},
```

To set this namespace information, use the following function in your rule:

```js
function (user, context, callback) {
  var namespace = 'https://example.com/';

  // adds to idToken, i.e. userMetadata in RedwoodJS
  context.idToken[namespace + 'app_metadata'] = {};
  context.idToken[namespace + 'app_metadata'].authorization = {
    groups: user.app_metadata.groups,
    roles: user.app_metadata.roles,
    permissions: user.app_metadata.permissions
  };

  context.idToken[namespace + 'user_metadata'] = {};

  // accessToken, i.e. the decoded JWT in RedwoodJS
  context.accessToken[namespace + 'app_metadata'] = {};
  context.accessToken[namespace + 'app_metadata'].authorization = {
    groups: user.app_metadata.groups,
    roles: user.app_metadata.roles,
    permissions: user.app_metadata.permissions
  };

   context.accessToken[namespace + 'user_metadata'] = {};

  return callback(null, user, context);
}
```

Now, your `app_metadata` with `authorization` and `role` information will be on the user's JWT after logging in.

#### Add Application hasRole Support in Auth0

If you intend to support, RBAC then in your `api/src/lib/auth.js` you need to extract `roles` using the `parseJWT` utility and set these roles on `currentUser`.

If your roles are on a namespaced `app_metadata` claim, then `parseJWT` provides an option to provide this value.

```js
// api/src/lib/auth.js`
const NAMESPACE = 'https://example.com'

const currentUserWithRoles = async (decoded) => {
  const currentUser = await userByUserId(decoded.sub)
  return {
    ...currentUser,
    roles: parseJWT({ decoded: decoded, namespace: NAMESPACE }).roles,
  }
}

export const getCurrentUser = async (decoded, { type, token }) => {
  try {
    requireAccessToken(decoded, { type, token })
    return currentUserWithRoles(decoded)
  } catch (error) {
    return decoded
  }
}
```

+++

#### Magic.Link

The Redwood API does not include the functionality to decode Magic.link authentication tokens, so the client is initiated and decodes the tokens inside of `getCurrentUser`.

+++ View Magic.link Options

##### Installation

First, you must manually install the **Magic Admin SDK** in your project's `api/package.json`.

```terminal
yarn workspace api add @magic-sdk/admin
```

##### Setup

To get your application running _without setting up_ `Prisma`, get your `SECRET KEY` from [dashboard.magic.link](https://dashboard.magic.link/). Then add `MAGICLINK_SECRET` to your `.env`.

```js
// redwood/api/src/lib/auth.js|ts
import { Magic } from '@magic-sdk/admin'

export const getCurrentUser = async (_decoded, { token }) => {
  const mAdmin = new Magic(process.env.MAGICLINK_SECRET)

  return await mAdmin.users.getMetadataByToken(token)
}
```

Magic.link recommends using the issuer as the userID to retrieve user metadata via `Prisma`

```js
// redwood/api/src/lib/auth.ts
import { Magic } from '@magic-sdk/admin'

export const getCurrentUser = async (_decoded, { token }) => {
  const mAdmin = new Magic(process.env.MAGICLINK_SECRET)
  const { email, publicAddress, issuer } = await mAdmin.users.getMetadataByToken(token)

  return await db.user.findUnique({ where: { issuer } })
}
```

+++

#### Firebase

You must follow the ["Before you begin"](https://firebase.google.com/docs/auth/web/google-signin) part of the "Authenticate Using Google Sign-In with JavaScript" guide.

+++ View Firebase Options

#### Role-based access control (RBAC) in Firebase

Requires a custom implementation.

#### App metadata in Firebase

None.

#### Add Application hasRole Support in Firebase

#### Auth Providers

Providers can be configured by specifying `logIn(provider)` and `signUp(provider)`.

Supported providers:

- google.com (Default)
- facebook.com
- github.com
- twitter.com
- microsoft.com
- apple.com

Email/password authentication is supported by calling `login({ username, password })` and `signUp({ username, password })`.

+++

#### Netlify Identity

[Netlify Identity](https://docs.netlify.com/visitor-access/identity) offers [Role-based access control (RBAC)](https://docs.netlify.com/visitor-access/identity/manage-existing-users/#user-account-metadata).

+++ View Netlify Identity Options

#### Role-based access control (RBAC) in Netlify Identity

Role-based access control (RBAC) refers to the idea of assigning permissions to users based on their role within an organization. It provides fine-grained control and offers a simple, manageable approach to access management that is less prone to error than assigning permissions to users individually.

Essentially, a role is a collection of permissions that you can apply to users. A role might be "admin", "editor" or "publisher". This differs from permissions an example of which might be "publish:blog".

#### App metadata in Netlify Identity

Netlify Identity stores information (such as, support plan subscriptions, security roles, or access control groups) in `app_metadata`. Data stored in `app_metadata` cannot be edited by users.

Create and manage roles for your application in Netlify's "Identity" management views. You can then assign these roles to users.

#### Add Application hasRole Support in Netlify Identity

If you intend to support, RBAC then in your `api/src/lib/auth.js` you need to extract `roles` using the `parseJWT` utility and set these roles on `currentUser`.

Netlify will store the user's roles on the `app_metadata` claim and the `parseJWT` function provides an option to extract the roles so they can be assigned to the `currentUser`.

For example:

```js
// api/src/lib/auth.js`
export const getCurrentUser = async (decoded) => {
  return context.currentUser || { ...decoded, roles: parseJWT({ decoded }).roles }
}
```

Now your `currentUser.roles` info will be available to both `requireAuth()` on the api side and `hasRole()` on the web side.

+++

### Role Protection on Functions, Services and Web

You can specify an optional role in `requireAuth` to check if the user is both authenticated and is assigned the role. The `role` can be a single string role or a list of roles.

```js
export const myThings = () => {
  requireAuth({ role: 'admin' })

  return db.user.findUnique({ where: { id: context.currentUser.id } }).things()
}

export const myBooks = () => {
  requireAuth({ role: ['author', 'editor'] })

  return db.user.findUnique({ where: { id: context.currentUser.id } }).books()
}
```

You can also protect routes:

```js
const Routes = () => {
  return (
    <Router>
      <Private unauthenticated="forbidden" role="admin">
        <Route path="/settings" page={SettingsPage} name="settings" />
        <Route path="/admin" page={AdminPage} name="sites" />
      </Private>

      <Private unauthenticated="forbidden" role={['author', 'editor']}>
        <Route path="/settings" page={SettingsPage} name="settings" />
        <Route path="/admin" page={AdminPage} name="sites" />
      </Private>

      <Route notfound page={NotFoundPage} />
      <Route path="/forbidden" page={ForbiddenPage} name="forbidden" />
    </Router>
  )
}
```

And also protect content in pages or components via the `useAuth()` hook:

```js
const { isAuthenticated, hasRole } = useAuth()

...

{hasRole('admin') && (
  <Link to={routes.admin()}>Admin</Link>
)}

{hasRole(['author', 'editor']) && (
  <Link to={routes.posts()}>Admin</Link>
)}
```

### Routes

Routes can require authentication by wrapping them in a `<Private>` component. An unauthenticated user will be redirected to the page specified in `unauthenticated`.

```js
import { Router, Route, Private } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      <Route path="/" page={HomePage} name="home" />
      <Route path="/login" page={LoginPage} name="login" />

      <Private unauthenticated="login">
        <Route path="/admin" page={AdminPage} name="admin" />
        <Route path="/secret-page" page={SecretPage} name="secret" />
      </Private>
    </Router>
  )
}
```

Routes can also be restricted by role by specifying `hasRole="role"` or `hasRole={['role', 'another_role']})` in the `<Private>` component. A user not assigned the role will be redirected to the page specified in `unauthenticated`.

```js
import { Router, Route, Private } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      <Route path="/" page={HomePage} name="home" />
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/forbidden" page={ForbiddenPage} name="login" />

      <Private unauthenticated="login">
        <Route path="/secret-page" page={SecretPage} name="secret" />
      </Private>

      <Private unauthenticated="forbidden" role="admin">
        <Route path="/admin" page={AdminPage} name="admin" />
      </Private>

      <Private unauthenticated="forbidden" role={['author', 'editor']}>
        <Route path="/posts" page={PostsPage} name="posts" />
      </Private>
    </Router>
  )
}
```

## Contributing

If you are interested in contributing to the Redwood Auth Package, please [start here](https://github.com/redwoodjs/redwood/blob/main/packages/auth/README.md).
