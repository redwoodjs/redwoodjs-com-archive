# Role-based Access Control (RBAC)

Role-based access control (RBAC) in RedwoodJS aims to be a simple, manageable approach to access management. It builds off the its Authentication system by adding control of who can access Routes, see features, and invoke services or functions.

A **role** is a collection of permissions applied to a set of users. Using roles makes it easier to add, remove, and adjust these permissions as your user base increases in scale and functionality increases complexity.

This cookbook examines how RBAC is implemented in RedwoodJS and <a href="#how-to-code-examples" data-turbolinks="false">how to protect</a> areas of your app on both api and web sides.

### Quick Links

- <a href="#authentication-vs-authorization" data-turbolinks="false">Authentication vs Authorization</a>
- <a href="#house-and-blog-role-access-examples" data-turbolinks="false">House and Blog Role-access Examples</a>
- <a href="#identity-as-a-service" data-turbolinks="false">Identity as a Service</a>
- <a href="#how-to-code-examples" data-turbolinks="false">How To Code Examples</a>
- <a href="#additional-resources" data-turbolinks="false">Additional Resources</a>

## Authentication vs Authorization

How is Authorization different from Authentication?

- **Authentication** is the act of validating that users are who they claim to be.
- **Authorization** is the process of giving the user permission to access a specific resource or function.

In even more simpler terms authentication is the _process_ of verifying oneself, while authorization is the _process_ of verifying what you have access to.

### House and Blog Role-access Examples

When thinking about security, it helps to think in terms of familiar examples.

Let's consider one from the phyisical world -- access to the various rooms of a 🏠 house -- and compare it to a digital example of a Blog.

#### RBAC Example: House

Consider a 🏠 while you are away on vacation.

You are the **_owner_** and have given out :key: keys to your **neighbor** and a **plumber** that unlock the 🏠 🚪 door.

You've assigned them passcodes to turn off the 🚨 alarm that identifies them as either a neighbor or plumber.

Your neighbor can enter the kitchen to get food to feed your 😸 and the your office to water your 🌵 and also use the 🚽.

The plumber can access the basement to get at the pipes, use the 🚽, access the laundry or 🍴 kitchen to fix the sink, but not your office.

Neither of them should be allowed into your 🛏 bedroom.

The owner knows who they claim to be and have given them keys.

The passcodes inform what access they have because it says if they are a neighbor or plumber.

If your 🏠 could enforce RBAC, it needs to know the rules.

#### Role Matrix for House RBAC

| Role     | Kitchen | Basement | Office | Bathroom | Laundry | Bedroom |
| -------- | :-----: | :------: | :----: | :------: | :-----: | :-----: |
| Neighbor |   ✅    |          |   ✅   |    ✅    |         |         |
| Plumber  |   ✅    |    ✅    |        |    ✅    |   ✅    |         |
| Owner    |   ✅    |    ✅    |   ✅   |    ✅    |   ✅    |         |

#### RBAC Example: Blog

In our Blog example anyone can view Posts (authenticated or not). They are _public_.

- Authors can write new Posts.
- Editors can update them.
- Publishers can write, review, edit and delete Posts.
- And admins can do it all (and more).

#### Role Matrix for Blog RBAC

| Role      | View | New | Edit | Delete | Manage Users |
| --------- | :--: | :-: | :--: | :----: | :----------: |
| Author    |  ✅  | ✅  |      |        |              |
| Editor    |  ✅  |     |  ✅  |        |              |
| Publisher |  ✅  | ✅  |  ✅  |   ✅   |              |
| Admin     |  ✅  | ✅  |  ✅  |   ✅   |      ✅      |

## Auth and RBAC Checklist

In order to integrates RBAC in a RedwoodJS app, you will have to:

- Implement an Identity as a Service/Authentication Provider
- Define and Assign Roles
- Set Roles to Current User
- Enforce Access
- Secure Web and Api sides

Helps to be familiar with [Blog Tutorial](https://redwoodjs.com/tutorial/welcome-to-redwood) as well as pages, cells, services, authentication, and routes.

## Identity as a Service

> "Doing authentication correctly is as hard, error-prone, and risky as rolling your own encryption."

- Identity as a Service such as Netlify Identity, Auth0, Magic.link, etc.
- Aims to help developers solve the problem of authentication
- Manages authentication (and roles) and the complexity associated

RedwoodJS generates Authentication Providers for several common Identity Services, including Netlify Identity.

### Netlify Identity Access Token (JWT) & App Metadata

The following is a brief example of a **decoded** JSON Web Token (JWT) similar to that issued bny Netlify Identity.

There are the following standard claims:

- `exp`: When the tokejn expires.
- `sub`: The token's subject, in this case the user identifier.

Other comon clains are `iss` for issuer and `aud` for audience (ie, the recipient for which the JWT is intended).

Please see [Introduction to JSON Web Tokens](https://jwt.io/introduction/) for a complete discussion.

This decoded token also includes:

- `app_metadata`: Stores information (such as, support plan subscriptions, security roles, or access control groups) that can impact a user's core functionality, such as how an application functions or what the user can access. Data stored in app_metadata cannot be edited by users
- `user_metadata`: Stores user attributes such as preferences that do not impact a user's core functionality. Logged in users can edit their data stored in user_metadata typically by making an api call the the Identity service user profile endpoint with their access_token to identify themselves.

Roles may be stored within `app_metadata` or sometimes within `authorization` under `app_metadata`.

```js
{
  "exp": 1598628532,
  "sub": "1d271db5-f0cg-21f4-8b43-a01ddd3be294",
  "email": "example+author@example.com",
  "app_metadata": {
    "roles": ["author"]
  },
  "user_metadata": {
    "full_name": "Arthur Author",
  }
}
```

## How To Code Examples

### Set Roles to Current User

Roles may be stored within `app_metadata` or sometimes within `authorization` under `app_metadata`.

The `parseJWT` helper will consider both locations to extract roles on the decoded JWT.

```js
// api/lib/auth.js

import { parseJWT } from '@redwoodjs/api'

export const getCurrentUser = async (decoded) => {
  return context.currentUser || { ...decoded, roles: parseJWT({ decoded }).roles }
}
```

### Web-side RBAC

useAuth() hook
hasRole also checks if authenticated.

- Routes
- NavLinks in a Layout
- Cells/Components
- Markup in Page

#### How to Protect a Route

```js
import { Router, Route, Private } from '@redwoodjs/router'

const Routes = () => {
  return (
    <Router>
      <Private unauthenticated="home" role="admin">
        <Route path="/admin/users" page={UsersPage} name="users" />
      </Private>
    </Router>
  )
}
```

TODO: Show new "forbidden" route option with custom Page

```js
<Router>
  <Private unauthenticated="forbidden" role="admin">
    <Route path="/settings" page={SettingsPage} name="settings" />
    <Route path="/admin" page={AdminPage} name="sites" />
  </Private>

  <Route notfound page={NotFoundPage} />
  <Route path="/forbidden" page={ForbiddenPage} name="forbidden" />
</Router>
```

#### How to Protect a NavLink in a Layout

```js
import { NavLink, Link, routes } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'

const SidebarLayout = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth()

  return (
    ...
    {hasRole('admin') && (
      <NavLink
        to={routes.users()} className="text-gray-600" activeClassName="text-gray-900"
      >
      Manage Users
    </NavLink>
    ...
   )}
 )
}
```

#### How to Protect a Component

```js
import { useAuth } from '@redwoodjs/auth'

const Post = ({ post }) => {
  const { hasRole } = useAuth()

  return (
    <nav className="rw-button-group">
      {(hasRole('admin') || hasRole('publisher')) && (
          <a href="#" className="rw-button rw-button-red" onClick={() => onDeleteClick(post.id)}>
            Delete
          </a>
        ))}
    </nav>
  )
}
```

#### How to Protect Markup in a Page

```js
import { useAuth } from "@redwoodjs/auth";
import SidebarLayout from "src/layouts/SidebarLayout";

const SettingsPage = () => {
  const { isAuthenticated, userMetadata, hasRole } = useAuth();

  return (
    {isAuthenticated && (
      <div className="ml-4 flex-shrink-0">
        {hasRole("admin") && (
          <a
            href={`https://app.netlify.com/sites/${process.env.SITE_NAME}/identity/${userMetadata.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Edit on Netlify
          </a>
        )}
      </div>
    )}
  )}
}
```

### Api-side RBAC

- Services
- Functions
- Default Roles using [Netlify Identity Triggers](https://docs.netlify.com/functions/trigger-on-events/)

#### How to Protect a Service

```js
import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'

const CREATE_POST_ROLES = ['admin', 'author', 'publisher']

export const createPost = ({ input }) => {
  requireAuth({ role: CREATE_POST_ROLES })

  return db.post.create({
    data: {
      ...input,
      authorId: context.currentUser.sub,
      publisherId: context.currentUser.sub,
    },
  })
}
```

#### How to Protect a Function

```js
import { requireAuth } from 'src/lib/auth'

export const handler = async (event, context) => {
  try {
    requireAuth({ role: 'admin' })

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: 'Permitted',
      }),
    }
  } catch {
    return {
      statusCode: 401,
    }
  }
}
```

#### How to Default Roles on Signup using Netlify Identity Triggers

You can trigger serverless function calls when certain Identity events happen, like when a user signs up.

Netlify Identity currently supports the following events:

- `identity-validate`: Triggered when an Identity user tries to sign up via Identity.
- `identity-signup`: Triggered when an Identity user signs up via Netlify Identity. (Note: this fires for only email+password signups, not for signups via external providers e.g. Google/GitHub)
- `identity-login`: Triggered when an Identity user logs in via Netlify Identity

To set a serverless function to trigger on one of these events, match the name of the function file to the name of the event. For example, to trigger a serverless function on identity-signup events, name the function file `identity-signup.js`.

If you return a status other than 200 or 204 from one of these event functions, the signup or login will be blocked.

If your serverless function returns a 200, you can also return a JSON object with new user_metadata or app_metadata for the Identity user.

```js
// api/src/functions/identity-signup.js

export const handler = async (req, _context) => {
  const body = JSON.parse(req.body)

  const eventType = body.event
  const user = body.user
  const email = user.email

  let roles = []

  if (eventType === 'signup') {
    if (email.includes('+author')) {
      roles.push('author')
    }

    if (email.includes('+editor')) {
      roles.push('editor')
    }

    if (email.includes('+publisher')) {
      roles.push('publisher')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ app_metadata: { roles: roles } }),
    }
  } else {
    return {
      statusCode: 200,
    }
  }
}
```

## Additional Resources

- [RBAC Example & Demo Site](https://redwoodblog-with-identity.netlify.app/)
- [RBAC Example & Demo Site GitHub Repo](https://github.com/dthyresson/redwoodblog-rbac)
- [Netlify Identity](https://docs.netlify.com/visitor-access/identity/)
- [Netlify Identity Triggers](https://docs.netlify.com/functions/trigger-on-events/)
- [JSON Web Tokens (JWT)](https://jwt.io/)
- [5 Massive Benefits Of Identity As A Service](https://auth0.com/blog/5-massive-benefits-of-identity-as-a-service-for-developers/)
