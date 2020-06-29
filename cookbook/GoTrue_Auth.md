# GoTrue Auth

Redwood makes it easy to add authentication to your Redwood App with an instant [auth generator CLI command](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-auth) and a growing library of support for popular SPA authentication clients.

If you've completed the [authentication section](https://deploy-preview-221--redwoodjs.netlify.app/tutorial/authentication) of [The Tutorial](https://deploy-preview-221--redwoodjs.netlify.app/tutorial/welcome-to-redwood), you've seen how you can add the [Netlify Identity Widget](https://github.com/netlify/netlify-identity-widget) to your Redwood app in a matter of minutes.

However, in many cases, we want much more control and customization of our authentication interface and functionality while still maintaining some _ease-of-use_ when it comes to development.

Enter [GoTrue-JS](https://github.com/netlify/gotrue-js), a client library for interfacing with Netlify Identity's GoTrue API.

In this tutorial we'll:

- [configure Redwood Auth with GoTrue-JS](#generate-auth-configuration) (easy),
- [create a Sign up form](#sign-up) (easy),
- [create a Sign in form](#sign-in) (easy),
- [create a log out button](#log-out) (easy),
- [add auth links](#auth-links) that display the correct buttons based on our auth state (easy)

Let's get started. First, some housekeeping...

## Prerequisites

Before getting started there's a few steps you should have completed:

- [Create a Redwood App](https://redwoodjs.com/tutorial/installation-starting-development)
- [Create a Netlify account](https://www.netlify.com/)
- [Deploy your site](https://redwoodjs.com/tutorial/deployment)
- [Enable Netlify Identity](#enable-netlify-identity)

**Recommended Reading**

- [Redwood Authentication](https://deploy-preview-221--redwoodjs.netlify.app/docs/authentication)
- [GoTrue-JS documentation](https://github.com/netlify/gotrue-js/blob/master/README.md)

### Enable Netlify Identity

Unless you've skipped the [requirements](#requirements) section (for shame!) you should already have a [Netlify](https://www.netlify.com/) account and a site set up. If you'd be so kind, navigate to your sites' **Dashboard**, head to the **Identity** tab and click the **Enable Identity** button:

![Netlify Identity screenshot](https://user-images.githubusercontent.com/300/82271191-f5850380-992b-11ea-8061-cb5f601fa50f.png)

Now you should see an Identity API endpoint, e.g. `https://my-bodacious-app.netlify.app/.netlify/identity` Let's copy and paste that somewhere. We'll need it in a moment when we instantiate GoTrue-JS.

## Generate Auth Configuration

Let's install the required packages and generate boilerplate code and files for Redwood Auth with this simple [CLI command](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-auth):

```bash
yarn redwood generate auth goTrue
```

By passing `goTrue` as the client argument, Redwood autmatically added the neccessary GoTrue-JS config to our index.js. Let's open up `web/src/index.js` and inspect. You should see:

```javascript {2,5,10,11,12,13,17,21}
import ReactDOM from 'react-dom'
import { AuthProvider } from '@redwoodjs/auth'
import { RedwoodProvider, FatalErrorBoundary } from '@redwoodjs/web'
import FatalErrorPage from 'src/pages/FatalErrorPage'
import GoTrue from 'gotrue-js'

import Routes from 'src/Routes'
import './index.css'

const goTrue = new GoTrue({
  APIUrl: 'https://MYAPP.netlify.app/.netlify/identity',
  setCookie: true,
})

ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={goTrue} type="goTrue">
      <RedwoodProvider>
        <Routes />
      </RedwoodProvider>
    </AuthProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

Now we'll make use of that API endpoint we copied from the Netlify Identity page. Replace the value of `APIUrl` with your API endpoint. For example:

```javascript {5}
// web/src/index.js
import GoTrue from 'gotrue-js'

const goTrueInstance = new GoTrue({
  APIUrl: 'https://gotrue-recipe.netlify.app/.netlify/identity',
  setCookie: true,
})
```

## Sign Up

Our users can't very well sign in until they've signed up. As such, Sign Up feels like an appropriate place to start building our interface.

Note here that our first iteration of sign up won't include features like Email Confirmation or Password Recovery. Those, among other features, will soon be covered in an Advanced Concepts section of this recipe.

For now, let's allow our users to sign up without confirming their email. Head back over to your sites' **Netlify Dashboard**, open the **Identity tab** and click **Settings and usage**.

![Netlify Identity Settings screenshot](https://user-images.githubusercontent.com/458233/86220685-ed86c900-bb51-11ea-9d74-f1ee4ab0a91b.png)

In the **Emails > Confirmation template** section, click **edit settings**. Click the **Allow users to sign up without verifying their email address** checkbox so that it is checked. Finally, click **Save**.

![Netlify Identity Confirmation template](https://user-images.githubusercontent.com/458233/86221090-7140b580-bb52-11ea-8530-b1a7be937c56.png)

Nicely done. Now we can head back to our app.

### The Sign Up Page

Let's generate a Sign Up page using the [Redwood CLI](https://redwoodjs.com/docs/cli-commands):

```terminal
yarn rw g page Signup
```

This will add a Signup [route](https://deploy-preview-221--redwoodjs.netlify.app/docs/redwood-router#router-and-route) to our routes file and create a SignupPage component.

In the `web/src/pages/SignupPage/SignupPage.js` file we've just generated, let's import some [Redwood Form components](https://redwoodjs.com/docs/form) and add a very basic form to our render component:

```javascript
// src/pages/SignupPage/SignupPage.js
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'

const SignupPage = () => {
  return (
    <Form>
      <TextField name="email" placeholder="email" />
      <PasswordField name="password" placeholder="password" />
      <Submit>Sign Up</Submit>
    </Form>
  )
}

export default SignupPage
```

Did I mention it was basic? If you want to add some polish to this form, you might find both the [Redwood Form docs](https://5efa4336f1e71f00081df803--redwoodjs.netlify.app/docs/form) and the [tutorial section on forms](https://5efa4336f1e71f00081df803--redwoodjs.netlify.app/tutorial/everyone-s-favorite-thing-to-build-forms) quite useful. For our purposes, let's just focus on accomplishing authentication functionality.

Now that we have a form interface, we're going to want to do something when the user submits the form. Let's add an onSubmit function to our component and pass it as a prop to our Form component:

```javascript {5,6,7,10}
// web/src/pages/SignupPage/SignupPage.js
...

const SignupPage = () => {
  const onSubmit = (data) => {
    // do something here
  }

  return (
    <Form onSubmit={onSubmit}>
      <TextField name="email" placeholder="email" />
      <PasswordField name="password" placeholder="password" />
      <Submit>Sign Up</Submit>
    </Form>
  )
}

...
```

The _something_ we need to do is—surprise!—sign up. To accomplish this we'll need a way to communicate with `<AuthProvider />` and the GoTrue-JS client we passed to it. Look no further than the [`useAuth` hook](https://redwoodjs.com/docs/authentication#api) which let's us subscribe to our auth state and its properties. In our case we'll be glad now to have access to `client` and, thusly, our GoTrue-JS instance and [all of its functions](https://github.com/netlify/gotrue-js/blob/master/README.md#authentication-examples).

Let's import `useAuth` and destructure `client` in our component:

```javascript {3,6}
// web/src/pages/SignupPage/SignupPage.js
...
import { useAuth } from '@redwoodjs/auth'

const SignupPage = () => {
  const { client } = useAuth()

  const onSubmit = (data) => {
    // do something awesome here
  }
  ...
```

And now we'll attempt to create a new user in the `onSubmit` function with [`client.signup()`](https://github.com/netlify/gotrue-js/blob/master/README.md#create-a-new-user) by passing in the `email` and `password` values that we've captured from our form:

```javascript {6,7,8}
// web/src/pages/SignupPage/SignupPage.js
...
  const { client } = useAuth()

  const onSubmit = (data) => {
    client.signup(data.email, data.password)
      .then((res) => console.log(res))
      .catch((error) => console.log(error));
  }

...
```

Presently, our sign up will work as is but simply console-logging the response from `client.signup()` is hardly useful behavior.

Let's get the dreary part out of the way and display errors to the user if there is one. To do this, we'll set up `React.useState()` to manage our error state and conditionally render the error message if there is one. We'll also want to reset the error state at the beginning of every submission with `setError(null)`:

```javascript {4,7,10,15}
// web/src/pages/SignupPage/SignupPage.js
...
  const { client } = useAuth()
  const [ error, setError ] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    client.signup(data.email, data.password)
      .then((res) => console.log(res))
      .catch((error) => setError(error.message));
  }

  return (
    <Form onSubmit={onSubmit}>
      {error && <p>{error}</p>}
      <TextField name="email" placeholder="email" />
      <PasswordField name="password" placeholder="password" />
      <Submit>Sign Up</Submit>
    </Form>
  )
...
```

And now we can have some fun and handle a successful submission. Once a user has signed up we should direct them to the sign in page that we'll be building out in the next section.

Start by [generating](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-page) a sign in page:

```bash
yarn rw g page Signin
```

Now let's import `routes` and `navigate` from [Redwood Router](https://deploy-preview-221--redwoodjs.netlify.app/docs/redwood-router#navigate) and use them to redirect on successful sign up:

```javascript {6,10,11,12}
// web/src/pages/SignupPage/SignupPage.js
...

  const onSubmit = (data) => {
    client.signup(data.email, data.password)
      .then(() => navigate(routes.signup()))
      .catch((error) => setError(error.message));
  }

...
```

Here's the final file in its entirety:

```javascript
// web/src/pages/SignupPage/SignupPage.js
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'
import { useAuth } from '@redwoodjs/auth'

const SignupPage = () => {
  const { client, logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    client
      .signup(data.email, data.password)
      .then(() => signIn(data.email, data.password))
      .catch((error) => setError(error.message))
  }

  const signIn = (email, password) => {
    logIn(email, password)
      .then((res) => navigate(routes.home()))
      .catch((error) => setError(error.message))
  }

  return (
    <Form onSubmit={onSubmit}>
      {error && <p>{error}</p>}
      <TextField name="email" placeholder="email" />
      <PasswordField name="password" placeholder="password" />
      <Submit>Sign Up</Submit>
    </Form>
  )
}

export default SignupPage
```

Hoorah, we made it! We've just added added a sign up page and created a sign up form. We created a function to sign up users and we redirect users to the sign up page upon successful submission. Now we can move on to log in!

## Log in

Let's get right to it. In the `web/src/pages/SigninPage/SigninPage.js` we generated in the last section, let's add a basic form with `email` and `password` fields, some error reporting setup, and a hollow `onSubmit` function:

```javascript
// src/pages/SigninPage/SigninPage.js
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'

const SigninPage = () => {
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    // do sign in here
  }

  return (
    <Form onSubmit={onSubmit}>
      {error && <p>{error}</p>}
      <TextField name="email" placeholder="email" />
      <PasswordField name="password" placeholder="password" />
      <Submit>Sign Up</Submit>
    </Form>
  )
}

export default SigninPage
```

Then we'll need to import `useAuth` from `@redwoodjs/auth` and destructure `logIn` so that we can use it in our `onSubmit` function:

```javascript {3,6}
// src/pages/SigninPage/SigninPage.js
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'
import { useAuth } from '@redwoodjs/auth'

const SigninPage = () => {
  const { logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    // do sign in here
  }
...
```

Now we'll add `logIn` to our `onSubmit` function, passing the `email` and `password` properties captured from `data`. We'll also chain on `then` and `catch` to handle the response:

```javascript {5,6,7,8,9,10,11}
// src/pages/SigninPage/SigninPage.js
...
  const onSubmit = (data) => {
    setError(null)
    logIn(data.email, data.password)
      .then(() => {
        // do something
      })
      .catch((error) =>
        setError(error.message)
      )
  }
...
```

Now then, upon a successful login let's redirect our user back to the home page. First, [generate](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-page) a homepage (if you haven't already):

```terminal
yarn rw g page Home /
```

Import `navigate` and `routes` from `@redwoodjs/router` and add them to the `then` function:

```javascript {3,12}
// src/pages/SigninPage/SigninPage.js
...
  import { navigate, routes } from '@redwoodjs/router'

  const SigninPage = () => {
    const { logIn } = useAuth()
    const [error, setError] = React.useState(null)

    const onSubmit = (data) => {
      setError(null)
      logIn(data.email, data.password)
        .then(() => navigate(routes.home()))
        .catch((error) => setError(error.message))
    }
...
```

Well done! Here's the whole file:

```javascript
// src/pages/SigninPage/SigninPage.js
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'
import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

const SigninPage = () => {
  const { logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    logIn(data.email, data.password)
      .then(() => navigate(routes.home()))
      .catch((error) => setError(error.message))
  }

  return (
    <Form onSubmit={onSubmit}>
      {error && <p>{error}</p>}
      <TextField name="email" placeholder="email" />
      <PasswordField name="password" placeholder="password" />
      <Submit>Sign Up</Submit>
    </Form>
  )
}

export default SigninPage
```

## Log Out

Log out is by far the easiest auth functionality to implement; we just fire off useAuth's `logOut` method. Let's start by [generating a component](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-component) that will house our log out button:

```bash
yarn rw g component LogoutBtn
```

In the `web/src/components/LogoutBtn/LogoutBtn.js` file we just generated, let's render a button and add a click handler:

```javascript
// web/src/components/LogoutBtn/LogoutBtn.js
const LogoutBtn = () => {
  const onClick = () => {
    // do sign out here.
  }
  return <button onClick={() => onClick()}>Log Out</button>
}

export default LogoutBtn
```

No we can import [`useAuth` from `@redwoodjs/auth`](https://deploy-preview-221--redwoodjs.netlify.app/docs/authentication#api). We'll destructure its `logOut` method and make use of it in the `onClick` function:

```javascript {2,5,7}
// web/src/components/LogoutBtn/LogoutBtn.js
import { useAuth } from '@redwoodjs/auth'

const LogoutBtn = () => {
  const { logOut } = useAuth()
  const onClick = () => {
    logOut()
  }
  return <button onClick={() => onClick()}>Log Out</button>
}

export default LogoutBtn
```

This will work as is but, because the user may be in a private area of your app when the log out button is clicked, we should make sure we also navigate the user away from this page:

```javascript {2,9}
// web/src/components/LogoutBtn/LogoutBtn.js
import { navigate, routes } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'

const LogoutBtn = () => {
  const { logOut } = useAuth()
  const onClick = () => {
    logOut().then(() => navigate(routes.home()))
  }
  return <button onClick={() => onClick()}>Log Out</button>
}

export default LogoutBtn
```

And that's it for log out! Err, of course, we're not rendering it anywhere in our app yet. In the next section, well add some navigation that conditionally renders the appropriate sign up, log in, and log out buttons based on our authentication state.

## Auth Links

Here we'll implement some auth related navigation that conditionally renders the correct links and buttons based on the users authentication state.

- When the user is not logged in, we should see **Sign Up** and **Log In**.
- When the user is logged in, we should see **Log Out**.

Let's start by [generating a navigation component](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-component):

```bash
yarn rw g component Navigation
```

This creates `web/src/components/Navigation/Navigation.js`. In that file lets import [the `Link` component and `routes`](https://deploy-preview-221--redwoodjs.netlify.app/docs/redwood-router#link-and-named-route-functions) from `@redwoodjs/router`.

We'll also import [`useAuth`](https://deploy-preview-221--redwoodjs.netlify.app/docs/authentication#api) since we'll need to subscribe to the auth state in order for our components to decide what to render:

```javascript
// web/src/components/Navigation/Navigation.js
import { Link } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'

const Navigation = () => {
  return <nav></nav>
}

export default Navigation
```

Let's destructure [`isAuthenticated` from the `useAuth`](https://deploy-preview-221--redwoodjs.netlify.app/docs/authentication#api) API and apply it to some conditionals in the render method:

```javascript
// web/src/components/Navigation/Navigation.js
import { Link } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'

const Navigation = () => {
  const { isAuthenticated } = useAuth()
  return (
    <nav>
      {isAuthenticated ? (
        // logged in - show the logout button
      ) : (
        // logged out - show the sign up and sign in buttons
      )}
    </nav>
  )
}

export default Navigation
```

Because Redwood Auth makes use of [React's Context API](https://reactjs.org/docs/context.html) to manage and broadcast the auth state, we can be confident that we'll always have an up to date value for isAuthenticated—even when it changes from within another component in the tree (so long as its a child of `<AuthProvider />`). In our case, when `isAuthenticated` changes, React will auto-magically take care of rendering the appropriate components.

So, now let's import our log out button and add it, as well as sign in and sign out links, to the appropriate blocks in the conditional:

```javascript
// web/src/components/Navigation/Navigation.js
import { Link } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'
import LogOutBtn from 'src/components/LogoutBtn/LogoutBtn'

const Navigation = () => {
  const { isAuthenticated } = useAuth()
  return (
    <nav>
      {isAuthenticated ? (
        <LogoutBtn />
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

We have a working navigation component but we still need to render it somewhere. Let's [generate a layout](https://deploy-preview-221--redwoodjs.netlify.app/docs/cli-commands#generate-layout) called GlobalLayout:

```bash
yarn rw g layout Global
```

Then import and render the navigation component:

```javascript
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

Finally, we'll import and wrap each of our generated pages in this GlobalLayout component:

**Home**

```javascript
// web/src/pages/HomePage/Homepage.js
import GlobalLayout from 'src/layouts/GlobalLayout/GlobalLayout'

const HomePage = () => {
  return (
    <GlobalLayout>
      <h1>HomePage</h1>
      <p>Here lies a Redwood recipe.</p>
    </GlobalLayout>
  )
}

export default HomePage
```

**Sign Up**

```javascript
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'
import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

import GlobalLayout from 'src/layouts/GlobalLayout/GlobalLayout'

const SignupPage = () => {
  const { client, logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    client
      .signup(data.email, data.password)
      .then(() => signIn(data.email, data.password))
      .catch((error) => setError(error))
  }

  const signIn = (email, password) => {
    logIn(email, password)
      .then(() => navigate(routes.home()))
      .catch((error) => setError(error.message))
  }

  return (
    <GlobalLayout>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </GlobalLayout>
  )
}

export default SignupPage
```

**Sign In**

```javascript
import { Form, TextField, PasswordField, Submit } from '@redwoodjs/web'
import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

import GlobalLayout from 'src/layouts/GlobalLayout/GlobalLayout'

const SigninPage = () => {
  const { logIn } = useAuth()
  const [error, setError] = React.useState(null)

  const onSubmit = (data) => {
    setError(null)
    logIn(data.email, data.password)
      .then(() => navigate(routes.home()))
      .catch((error) => setError(error.message))
  }

  return (
    <GlobalLayout>
      <Form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <TextField name="email" placeholder="email" />
        <PasswordField name="password" placeholder="password" />
        <Submit>Sign Up</Submit>
      </Form>
    </GlobalLayout>
  )
}

export default SigninPage
```

And now we have navigation that will render the correct links and buttons based on our auth state. When the user logs in we'll see a **Log Out** button. When the user is logged out we'll see **Sign Up** and **Sign In** links.

## Wrapping Up

We've configured GoTrue with Redwood Auth, created a sign up page, a sign in page, a log out button, and we've added auth links to our layout. Nicely done!

In time we'll be adding recipes for more advanced Auth concepts like Password Recovery, Email Confirmation, and Authorization with user roles. In the meantime, you might want to continue your journey by reading about [deploying to Netlify](https://deploy-preview-221--redwoodjs.netlify.app/tutorial/deployment), creating [custom Functions](https://deploy-preview-221--redwoodjs.netlify.app/cookbook/custom-function) with a capital "F", or handling [File Uploads](https://deploy-preview-221--redwoodjs.netlify.app/cookbook/file-uploads) in your Redwood app.

Thanks for tuning in!

_If you've spotted an error or are having trouble completing any part of this recipe, please feel free to open an issue on [Github](https://github.com/redwoodjs/redwood) or create a topic on our [community forum](https://community.redwoodjs.com/)._
