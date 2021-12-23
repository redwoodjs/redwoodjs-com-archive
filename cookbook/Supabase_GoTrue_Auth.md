# Supabase GoTrue Auth

Let's call this cookbook a port of the [Redwood GoTrue Auth Cookbook](/cookbook/gotrue-auth) to [Supabase](https://supabase.io/).

I won't get original style points, because I copied/pasted/updated the original.

Why? Because Supabase auth is based on [Netlify GoTrue](https://github.com/netlify/gotrue), an API service for handling user registration and authentication. The Supabase folks build on solid open source foundations.

Once I connected these dots, The Redwood GoTrue Auth Cookbook became a handy resource as I climbed the auth learning curve (and I started from sea level). Hopefully this Supabase-specific version will help you efficiently climb your auth learning curve.

## Time to Cook

In this recipe, we'll:

- configure Redwood Auth with Supabase,
- create a Sign Up form,
- create a Sign In form,
- create a Sign Out button,
- add auth links that display the correct buttons based on our auth state

But first, some housekeeping...

## Prerequisites

Before getting started, there are a few steps you should have completed:

- [Create a Redwood app](https://redwoodjs.com/tutorial/installation-starting-development)
- [Create a Supabase account](https://www.supabase.io/)
- [Perform Supabase Quick Start](https://supabase.io/docs/guides/with-react)
- Fire up a dev server: `yarn redwood dev`

## Supabase Quick Start

I was super stuck before stepping through the [Supabase Quick Start for React](https://supabase.io/docs/guides/with-react).

The Quick Start will walk you through creating a new project and setting up a database schema that will hold user information.

![Supabase Project Setup](https://user-images.githubusercontent.com/43206213/147162460-103b91c7-efbf-42b9-95ce-2ce9bbc70de7.png)

I found it helpful to first interact directly with the [Supabase Client](https://github.com/supabase/supabase-js). Eventually, you will use the [Redwood auth wrappers](/docs/authentication#supabase), which provide a level of abstraction and clean/consistent style. But, I needed a couple hours of direct client experimenting to gain comfort in the Redwood wrapper. So, just this once, I hereby give you permission to fire-up Create React App as you follow-along the Supabase quick start.

> ## Auth Alphabet Soup
>
> If you are like me, and I'm pretty sure I'm just human, you may find yourself spinning in jumbled auth jargon. Hang in there, you'll get your auth ducks lined up eventually.
>
> I am proud to tell you that I now know that the Redwood Supabase auth client wraps the Supabase GoTrueJS client, which is a fork of Netlify’s GoTrueJS client (which is different than Netlify Identity). And, dbAuth is a separate auth option. Plus, I'll keep it simple and not use RBAC at the moment.
>
> Ahhh! It took me a few weeks to figure this out.

## Back to Redwood

Armed with some knowledge and insight from your Supabase Quick Start experimentation, let's head back to the Redwood app created as part of the prerequisites (running on localhost is fine).

Start by installing the required packages and generating boilerplate code and files for Redwood Auth, all with this simple [CLI command](/docs/cli-commands#setup-auth):

```bash
yarn redwood setup auth supabase
```

Here's my terminal output from running the command...

![Terminal output after running auth setup command](https://user-images.githubusercontent.com/43206213/147163591-1d5b496c-dfe3-4743-8681-0f5b813eca88.png)

By specifying `supabase` as the provider, Redwood automatically added the necessary Supabase config to our App.[js/tsx]. Let's open up `web/src/App.[js/tsx]` and inspect. You should see:

```js {3-4,14,19}
// web/src/App.[js/tsx]

import { AuthProvider } from '@redwoodjs/auth'
import { createClient } from '@supabase/supabase-js'

import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './index.css'

const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider client={supabaseClient} type="supabase">
        <RedwoodApolloProvider>
          <Routes />
        </RedwoodApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
```

Time to add the Supabase URL (SUPABASE_URL), public API KEY, and JWT SECRET (SUPABASE_KEY, and SUPABASE_JWT_SECRET) to your .env file.

Find these items in your Supabase management console, under Settings > API.

![Supabase console screen shot](https://user-images.githubusercontent.com/43206213/146407575-71ad2c94-8fa6-48d2-a403-d249f75569ea.png)

Here's a .env example:

```bash
# .env (in your root project directory)

# THIS FILE SHOULD NOT BE CHECKED INTO YOUR VERSION CONTROL SYSTEM
#
# Environment variables set here will override those in .env.defaults.
# Any environment variables you need in production you will need to setup with
# your hosting provider. For example in Netlify you can add environment
# variables in Settings > Build & Deploy > environment
#
# DATABASE_URL=postgres://user:pass@postgreshost.com:5432/database_name
# TEST_DATABASE_URL=postgres://user:pass@postgreshost.com:5432/test_database_name
SUPABASE_URL=https://replacewithyoursupabaseurl.supabase.co
SUPABASE_KEY=eyJhb_replace_VCJ9.eyJy_with_your_wfQ.0Abb_anon_key_teLJs
SUPABASE_JWT_SECRET=eyJh_replace_CJ9.eyJy_with_your_NTQwOTB9.MGNZN_JWT_secret_JgErqxj4
```

That's (almost) all for configuration.

## Sign Up

Sign Up feels like an appropriate place to start building our interface.

Our first iteration won't include features like Email Confirmation or Password Recovery. Those, among other features, could be covered in an Advanced Concepts section of this recipe (in the future).

To forego email confirmation, turn off "Enable email confirmations" on your **Supabase Management Console**, found under Authentication > Settings.

![Supabase email confirmation toggle](https://user-images.githubusercontent.com/43206213/147164458-1b6723ef-d7dd-4c7c-b228-73ca4ba7b1ff.png)

Now we're done with configuration. Back to our app...

## The Sign Up Page

Let's generate a Sign Up page:

```bash
yarn redwood generate page Signup
```

This adds a Signup [route](/docs/redwood-router) to our routes file and creates a SignupPage component.

In the just-generated SignupPage component (`web/src/pages/SignupPage/SignupPage.[js/tsx]`), let's import some [Redwood Form components](/docs/form) and add a very basic form to our render component:

```js
// web/src/pages/SignupPage/SignupPage.[js/tsx]

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'

const SignupPage = () => {
  return (
    <>
      <h1>Sign Up</h1>
      <Form>
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </>
  )
}

export default SignupPage
```

Did I mention it was basic? If you want to add some polish, you might find both the [Redwood Form docs](/docs/forms) and the [tutorial section on forms](https://learn.redwoodjs.com/docs/tutorial/everyones-favorite-thing-to-build-forms) quite useful. For our purposes, let's just focus on the functionality.

Now that we have a form interface, we're going to want to do something when the user submits it. Let's add an `onSubmit` function to our component and pass it as a prop to our Form component:

```js{6-8,13}
// web/src/pages/SignupPage/SignupPage.[js/tsx]

// imports...

const SignupPage = () => {
  const onSubmit = (data) => {
    // do something here
  }

  return (
    <>
      <h1>Sign Up</h1>
      <Form onSubmit={onSubmit}>
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </>
  )
}
//...
```

The _something_ we need to do is—surprise!—sign up. To do this, we'll need a way to communicate with `<AuthProvider />` and the Supabase GoTrue-JS client we passed to it. Look no further than the [`useAuth` hook](/docs/authentication#api), which lets us subscribe to our auth state and its properties. In our case, we'll be glad to now have access to `client` and, thusly, our Supabase GoTrue-JS instance and [all of its functions](https://github.com/supabase/supabase-js).

Let's import `useAuth` and destructure `client` from it in our component:

```js {4,7}
// web/src/pages/SignupPage/SignupPage.js

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'

const SignupPage = () => {
  const { client } = useAuth()
  const onSubmit = (data) => {
    // do something here
  }

  return (
    <>
      <h1>Sign Up</h1>
      <Form onSubmit={onSubmit}>
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </>
  )
}
export default SignupPage
```

And now we'll attempt to create a new user in the `onSubmit` function with [`client.auth.signup()`](https://supabase.io/docs/reference/javascript/auth-signup) by passing in the `email` and `password` values that we've captured from our form:

```js {10-13}
// web/src/pages/SignupPage/SignupPage.[js/tsx]

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'

const SignupPage = () => {
  const { client } = useAuth()

  const onSubmit = (data) => {
    client.auth
      .signup(data.email, data.password)
      .then((res) => console.log(res))
      .catch((error) => console.log(error))
  }

  return (
    <>
      <h1>Sign Up</h1>
      <Form onSubmit={onSubmit}>
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </>
  )
}
export default SignupPage
```

Presently, our sign up will work as is, but simply console-logging the response from `client.auth.signup()` is hardly useful behavior.

Let's display errors to the user if there is one. To do this, we'll set up `React.useState()` to manage our error state and conditionally render the error message if there is one. We'll also want to reset the error state at the beginning of every submission with `setError(null)`:

```js {8,11,16,25}
// web/src/pages/SignupPage/SignupPage.js

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'

const SignupPage = () => {
  const { client } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    client
      .signup(data.email, data.password)
      .then((res) => {
        console.log(res))
        res?.error?.message && setError(res.error.message)
      }
      .catch((error) => setError(error.message))
  }

  return (
    <>
      <h1>Sign Up</h1>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </>
  )
}
export default SignupPage
```

> Note: Errors may be returned in two fashions:
>
> 1. Upon promise fulfillment, within the `error` property of the object returned by a promise (you can handle this via the `then` promise method), or...
>
> 2. Upon promise rejection, within an error returned by the promise (you can handle this via the `catch` promise method).

Now we can handle a successful submission. If we sign up without email validation, then successful sign up also _signs in_ the user.

First, [generate](/docs/cli-commands#generate-page) a homepage (if you haven't already):

```bash
yarn redwood generate page Home /
```

Let's import `routes` and `navigate` from [Redwood Router](/docs/router#navigate) and use them to redirect to the home page upon successful sign up:

```js {5,15}
// web/src/pages/SignupPage/SignupPage.js

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'
import { routes, navigate } from '@redwoodjs/router'

const SignupPage = () => {
  const { client } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    client
      .signup(data.email, data.password)
      .then((res) => (res?.error?.message ? setError(res.error.message) : navigate(routes.home())))
      .catch((error) => setError(error.message))
  }
  return (
    <>
      <h1>Sign Up</h1>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </>
  )
}
export default SignupPage
```

Hoorah! We've just added a sign up page and created a sign up form. We created a function to sign up users and we redirect users to the home page upon successful submission. Let's move on to Sign In.

## Sign In

Let's get right to it. Start by [generating](/docs/cli-commands#generate-page) a sign in page:

```bash
yarn redwood generate page Signin
```

Next we'll add a basic form with `email` and `password` fields, some error reporting setup, and a hollow `onSubmit` function:

```js
// web/src/pages/SigninPage/SigninPage.[js/tsx]
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'

const SigninPage = () => {
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    // do sign in here
  }

  return (
    <>
      <h1>Sign In</h1>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign In</Submit>
      </Form>
    </>
  )
}

export default SigninPage
```

Then we'll need to import `useAuth` from `@redwoodjs/auth` and destructure `logIn` so that we can use it in our `onSubmit` function:

```js {4,7}
// web/src/pages/SigninPage/SigninPage.js

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'

const SigninPage = () => {
  const { logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    // do sign in here
  }

  return (
    <>
      <h1>Sign In</h1>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign In</Submit>
      </Form>
    </>
  )
}

export default SigninPage
```

Now we'll add `logIn` to our `onSubmit` function. This time we'll be passing an object to our function as we're using Redwood Auth's logIn function directly (as opposed to `client`). This object takes an email and password. We'll also chain on `then` and `catch` to handle the response:

```js {12-16}
// web/src/pages/SigninPage/SigninPage.js

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'

const SigninPage = () => {
  const { logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    logIn({ email: data.email, password: data.password })
      .then(() => {
        // do something
      })
      .catch((error) => setError(error.message))
  }

  return (
    <>
      <h1>Sign In</h1>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign In</Submit>
      </Form>
    </>
  )
}

export default SigninPage
```

Now then, upon a successful login let's redirect our user back to the home page.

In our `SigninPage`, import `navigate` and `routes` from [`@redwoodjs/router`](/docs/router) and add them to the `then` function:

```js {12-16}
// web/src/pages/SigninPage/SigninPage.js

import { Form, TextField, PasswordField, Submit } from '@redwoodjs/forms'
import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

const SigninPage = () => {
  const { logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    logIn({ email: data.email, password: data.password })
      .then((res) => (res?.error?.message ? setError(res.error.message) : navigate(routes.home())))
      .catch((error) => setError(error.message))
  }

  return (
    <>
      <h1>Sign In</h1>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign In</Submit>
      </Form>
    </>
  )
}

export default SigninPage
```

Well done! We've created a sign in page and form and we successfully handle sign in.

> The remainder of the cookbook is the same as the [Netlify GoTrue Auth](https://redwoodjs.com/cookbook/gotrue-auth) version. This highlights one of the fun benefits of the Redwood Auth wrappers: code specific to a certain auth implementation scheme can live in a few specific spots, as we walked through above. Then, general Redwood auth functions can be used elsewhere in the app.

Next up...

## Sign Out

Sign out is by far the easiest auth functionality to implement: all we need to do is fire off useAuth's `logOut` method.

Let's start by [generating a component](/docs/cli-commands#generate-component) to house our Sign Out Button:

```bash
yarn redwood generate component SignoutBtn
```

In the `web/src/components/SignoutBtn/SignoutBtn.js` file we just generated, let's render a button and add a click handler:

```js
// web/src/components/SignoutBtn/SignoutBtn.[js/tsx]

const SignoutBtn = () => {
  const onClick = () => {
    // do sign out here.
  }
  return <button onClick={() => onClick()}>Sign Out</button>
}

export default SignoutBtn
```

Now we can import [`useAuth` from `@redwoodjs/auth`](/docs/authentication#api). We'll destructure its `logOut` method and invoke it in the `onClick` function:

```js {3,6,9}
// web/src/components/SignoutBtn/SignoutBtn.[js/tsx]

import { useAuth } from '@redwoodjs/auth'

const SignoutBtn = () => {
  const { logOut } = useAuth()

  const onClick = () => {
    logOut()
  }
  return <button onClick={() => onClick()}>Sign Out</button>
}

export default SignoutBtn
```

This works as is, but, because the user may be in a private area of your app when the Sign Out button is clicked, we should make sure we also navigate the user away from this page:

```js {4,10}
// web/src/components/SignoutBtn/SignoutBtn.[js/tsx]

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

const SignoutBtn = () => {
  const { logOut } = useAuth()

  const onClick = () => {
    logOut().then(() => navigate(routes.home()))
  }

  return <button onClick={() => onClick()}>Sign Out</button>
}

export default SignoutBtn
```

And that's it for Sign Out! Err, of course, we're not rendering it anywhere in our app yet. In the next section, well add some navigation that conditionally renders the appropriate sign up, sign in, and sign out buttons based on our authentication state.

## Auth Links

Here we'll implement some auth-related navigation that conditionally renders the correct links and buttons based on the user's authentication state.

- When the user is not logged in, we should see **Sign Up** and **Sign In**.
- When the user is logged in, we should see **Log Out**.

Let's start by [generating a navigation component](/docs/cli-commands#generate-component):

```bash
yarn redwood generate component Navigation
```

This creates `web/src/components/Navigation/Navigation.js`. In that file, let's import [the `Link` component and the `routes` object](/docs/redwood-router#link-and-named-route-functions) from `@redwoodjs/router`.

We'll also import [`useAuth`](/docs/authentication#api) since we'll need to subscribe to the auth state in order for our components to decide what to render:

```js
// web/src/components/Navigation/Navigation.js

import { Link, routes } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'

const Navigation = () => {
  return <nav></nav>
}

export default Navigation
```

Let's destructure [`isAuthenticated` from the `useAuth`](/docs/authentication#api) API and apply it to some conditionals in the render method:

```js {7,10-14}
// web/src/components/Navigation/Navigation.js

import { Link, routes } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'

const Navigation = () => {
  const { isAuthenticated } = useAuth()
  return (
    <nav>
      {isAuthenticated ? (
        // signed in - show the Sign Out button
      ) : (
        // signed out - show the Sign Up and Sign In links
      )}
    </nav>
  )
}

export default Navigation
```

Because Redwood Auth uses [React's Context API](https://reactjs.org/docs/context.html) to manage and broadcast the auth state, we can be confident that `isAuthenticated` will always be up-to-date, even if it changes from within another component in the tree (so long as it's a child of `<AuthProvider />`). In our case, when `isAuthenticated` changes, React will auto-magically take care of rendering the appropriate components.

So, now let's import our sign out button and add it, as well as sign in and sign up links, to the appropriate blocks in the conditional:

```javascript {5,11-18}
// web/src/components/Navigation/Navigation.[js/tsx]

import { Link, routes } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'
import SignoutBtn from 'src/components/SignoutBtn/SignoutBtn'

const Navigation = () => {
  const { isAuthenticated } = useAuth()
  return (
    <nav>
      {isAuthenticated ? (
        <SignoutBtn />
      ) : (
        <>
          <Link to={routes.signup()}>Sign Up</Link>
          <Link to={routes.signin()}>Sign In</Link>
        </>
      )}
    </nav>
  )
}

export default Navigation
```

We have a working navigation component, but we still need to render it somewhere. Let's [generate a layout](/docs/cli-commands#generate-layout) called GlobalLayout:

```bash
yarn redwood generate layout Global
```

Then import and render the navigation component in the newly generated `web/src/layouts/GlobalLayout/GlobalLayout`:

```js
// web/src/layouts/GlobalLayout/GlobalLayout

import Navigation from 'src/components/Navigation/Navigation'

const GlobalLayout = ({ children }) => {
  return (
    <>
      <header>
        <Navigation />
      </header>
      <main>{children}</main>
    </>
  )
}

export default GlobalLayout
```

Finally, we'll wrap each of our generated pages in this GlobalLayout component. To do this efficiently, we'll update the routes defined in our `web\src\Routes.[js/tsx]` file with the [`Set` component](/docs/router#sets-of-routes).

```js
// web/src/Routes.[js/tsx]

import { Router, Route, Set } from '@redwoodjs/router'
import GlobalLayout from 'src/layouts/GlobalLayout/GlobalLayout'

const Routes = () => {
  return (
    <Router>
      <Set wrap={GlobalLayout}>
        <Route path="/" page={HomePage} name="home" />
        <Route path="/signup" page={SignUpPage} name="signup" />
        <Route path="/signin" page={SignInPage} name="signin" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
```

Now we have navigation that renders the correct links and buttons based on our auth state. When the user signs in, they'll see a **Sign Out** button. When the user signs out, they'll see **Sign Up** and **Sign In** links.

## Wrapping Up

We've configured Supabase GoTrue Auth with Redwood Auth, created a Sign Up page, a Sign In page, a Sign Out button, and added auth links to our layout. Nicely done!

Finally, the following resources may come in handy:

- [Redwood Supabase Auth Installation & Setup](https://redwoodjs.com/docs/authentication#supabase)
- [Redwood Auth Playground](https://redwood-playground-auth.netlify.app/supabase)
- [Redwood Supabase Auth Client Implementation](https://github.com/redwoodjs/redwood/blob/main/packages/auth/src/authClients/supabase.ts)

Thanks for tuning in!

> If you spot an error or have trouble completing any part of this recipe, please feel free to open an issue on [Github](https://github.com/redwoodjs/redwoodjs.com) or create a topic on our [community forum](https://community.redwoodjs.com/).
