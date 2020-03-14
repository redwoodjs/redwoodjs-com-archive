# Welcome to Redwood

Welcome to Redwood! If you haven't yet, check out the [Redwood README](https://github.com/redwoodjs/redwood/blob/master/README.md) to get a little background on why we created Redwood and the problems it's meant to solve. Redwood brings several existing technologies together for the first time into what we think is the future of database-backed single page applications.

In this tutorial we're going to build a blog engine. In reality a blog is probably not the ideal candidate for a Redwood app: blog articles can be stored in a CMS and statically generated to HTML files and served as flat files from a CDN. But as most developers are familiar with a blog and it uses all of the features we want to demonstrate, we decided to build one anyway.

## Prerequisites

This tutorial assumes you are already familiar with a few core concepts:

- [React](https://reactjs.org/)
- [GraphQL](https://graphql.org/)
- [The JAMstack](https://jamstack.org/)

You could work through this tutorial without knowing anything about these technologies but you may find yourself getting lost in terminology that we don't stop and take the time to explain. It also helps knowing where the line is between what is built into React and what additional features Redwood brings to the table.

### Node.js and Yarn Versions

During installation, RedwoodJS checks if your system meets version requirements for Node and Yarn:

- node: ">=12"
- yarn: ">=1.15"

👉 **Heads Up:** If your system versions do not meet both requirements, _the installation bootstrap will result in an ERROR._ To check, please run the following from your terminal command line:

```
node --version
yarn --version
```

Please do upgrade accordingly. Then proceed to the RedwoodJS installation when you're ready!

> There are many ways to install and manage both Node.js and Yarn. If you're installing for the first time, we recommend the following:
>
> **Yarn**
>
> - For **Mac** users, we recommend following the [Homebrew instructions via Yarnpkg.com](https://classic.yarnpkg.com/en/docs/install/#mac-stable).
> - **Windows** users should also visit [Yarnpkg.com](https://classic.yarnpkg.com/en/docs/install/#windows-stable) for installation options.
>
> **Node.js**
>
> - For **Mac** users, NVM is a great tool for managing multiple versions of Node on one system. And if you already have Homebrew installed, you can use it to [install NVM](https://formulae.brew.sh/formula/nvm) as well. It takes a bit more effort to set up and learn, however, in which case getting the latest [installation from Nodejs.org](https://nodejs.org/en/) works just fine.
> - We recommend **Windows** users visit [Nodejs.org](https://nodejs.org/en/) for installation.
>
> If you're confused about which of the two current Node versions to use, we recommend using the most recent "even" LTS, which is currently v12.

## Installation & Starting Development

We'll use yarn ([yarn](https://yarnpkg.com/en/docs/install) is a requirement) to create the basic structure of our app:

    yarn create redwood-app ./redwoodblog

You'll have a new directory `redwoodblog` containing several directories and files. Change to that directory and let's create the database, and then start the development server:

    cd redwoodblog
    yarn redwood dev

A browser should automatically open to http://localhost:8910 and you will see the Redwood welcome page:

![Redwood Welcome Page](https://user-images.githubusercontent.com/300/73012647-97a43d00-3dcb-11ea-8554-42df29c36e4a.png)

> Remembering the port number is as easy as counting: 8-9-10!

### First Commit

Now that we have the skeleton of our Redwood app in place, it's a good idea to save the current state of the app as your first commit...just in case.

    git init
    git add .
    git commit -am 'First commit'

## Redwood File Structure

Let's take a look at the files and directories that were created for us (config files have been excluded for now):

<img src="https://user-images.githubusercontent.com/300/76236828-7f0cac80-61ea-11ea-9007-40766d088c4e.png" alt="New Redwood app directory structure" width="300">

At the top level we have two directories, `api` and `web`. Redwood separates the backend (`api`) and frontend (`web`) concerns into their own paths in the codebase. ([Yarn refers to these as "workspaces"](https://yarnpkg.com/lang/en/docs/workspaces/). In Redwood, we refer to them as "sides.") When you add packages going forward you'll need to specify which workspace they should go in. For example (don't run these commands, we're just looking at the syntax):

    yarn workspace web add marked
    yarn workspace api add better-fs

### The /api Directory

Within `api` there are two directories:

- `prisma` contains the plumbing for the database:

  - `schema.prisma` contains the database schema (tables and columns)
  - `seeds.js` is used to populate your database with any data that needs to exist for your app to run at all (maybe an admin user or site configuration).

  After we add our first database table there will also be a SQLite database file named `dev.db` and a directory called `migrations` created for us. `migrations` contains the files that act as snapshots of the database schema changing over time.

- `src` contains all other backend code. `api/src` contains three more directories:
  - `functions` will contain any [lambda functions](https://docs.netlify.com/functions/overview/) your app needs in addition to the `graphql.js` file auto-generated by Redwood. This file is required to use the GraphQL API.
  - `graphql` contains your GraphQL schema written in a Schema Definition Language (the files will end in `.sdl.js`).
  - `services` contains business logic related to your data. When you're querying or mutating data for GraphQL, that code ends up here, but in a format that's resuable in other places in your application.

That's it for the backend.

### The /web Directory

- `components` contain your traditional React components as well as Redwood _Cells_ (more about those soon).
- `layouts` contain HTML/components that wrap your content and are shared across _Pages_.
- `pages` contain components and are optionally wrapped inside _Layouts_ and are the "landing page" for a given URL (a URL like `/articles/hello-world` will map to one page and `/contact-us` will map to another). There are two pages included in a new app:
  - `NotFoundPage.js` will be served when no other route is found (see `Routes.js` below).
  - `FatalErrorPage.js` will be rendered when there is an uncaught error that can't be recovered from and would otherwise cause our application to really blow up (normally rendering a blank page).
- `public` contains assets not used by React components (they will be copied over unmodified to the final app's root directory):
  - `favicon.png` is the icon that goes in a browser tab when your page is open (apps start with the RedwoodJS logo).
  - `robots.txt` can be used to control what web indexers are [allowed to do](https://www.robotstxt.org/robotstxt.html).
  - `README.md` explains how, and when, to use the `public` folder for static assets. It also covers best practices for importing assets within components via Webpack. You can read it on Github [here](https://github.com/redwoodjs/create-redwood-app/tree/master/web/public).
- `index.css` is a generic place to put your CSS, but there are many options.
- `index.html` is the standard React starting point for our app.
- `index.js` the bootstraping code to get our Redwood app up and running.
- `Routes.js` the route definitions for our app which map a URL to a _Page_.

## Our First Page

Let's give our users something to look at besides the Redwood welcome page. We'll use the `redwood` command line tool to create a page for us:

    yarn redwood generate page home /

This does three things:

- Creates `web/src/pages/HomePage/HomePage.js`. Redwood takes the name you specified as the first argument, capitalizes it, and appends "Page" to construct your new page component.
- Creates a test file to go along with this new page component at `web/src/pages/HomePage/HomePage.test.js` with a single, passing test. You _do_ write tests for your components, _don't you??_
- Adds a `<Route>` in `web/src/Routes.js` that maps the path `/` to the new _HomePage_ page.

> If you look in Routes you'll notice that we're referencing a component, `HomePage`, that isn't imported anywhere. Redwood automatically imports all pages in the Routes file since we're going to need to reference them all anyway. It saves a potentially huge `import` declaration from cluttering up the routes file.

In fact this page is already live (your browser automatically reloaded):

![Default HomePage render](https://user-images.githubusercontent.com/300/76237559-b760ba80-61eb-11ea-9a77-b5006b03031f.png)

It's not pretty, but it's a start! Open the page in your editor, change some text and save. Your browser should reload with your new text.

### Routing

Open up `web/src/Routes.js` and take a look at the route that was created:

    <Route path="/" page={HomePage} name="home" />

Try changing the route to something like:

    <Route path="/hello" page={HomePage} name="home" />

Now you'll see the `NotFoundPage` page. As soon as you add your first route, you'll never see the Redwood splash screen again. From now on, when no route can be found that matches the requested URL, Redwood will render the `NotFoundPage`. Change your URL to http://localhost:8910/hello and you should see the homepage again.

Change the route path back to `/` before continuing!

## A Second Page and a Link

Let's create an "About" page for our blog so everyone knows about the geniuses behind this achievement. We'll create another page using `redwood`:

    yarn redwood generate page about

Notice that we didn't specify a route path this time. If you leave it off the `redwood generate page` command, Redwood will create a `Route` and give it a path that is the same as the page name you specified prepended with a slash. In this case it will be `/about`.

> As you add more pages to your app, you may start to worry that more and more code has to be downloaded by the client on any initial page load. Fear not! Redwood will automatically code-split on each Page, which means that initial page loads can be blazingly fast, and you can create as many Pages as you want without having to worry about impacting overall webpack bundle size. If, however, you do want specific Pages to be included in the the main bundle, you can override the default behavior.

http://localhost:8910/about should show our new page. But no one's going to find it by manually changing the URL so let's add a link from our homepage to the About page and vice versa. We'll start creating a simple header and nav bar at the same time on the HomePage:

```javascript
// web/src/pages/HomePage/HomePage.js

import { Link, routes } from '@redwoodjs/router'

const HomePage = () => {
  return (
    <>
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>Home</main>
    </>
  )
}

export default HomePage
```

Let's point out a few things here:

- Redwood loves [Function Components](https://www.robinwieruch.de/react-function-component). We'll make extensive use of [React Hooks](https://reactjs.org/docs/hooks-intro.html) as we go and these are only enabled in function components. You're free to use class components, but we recommend avoiding them unless you need their special capabilities.
- Redwood's `<Link>` tag, in its most basic usage, takes a single `to` attribute. That `to` attribute calls a _named route function_ in order to generate the correct URL. The function has the same name as the `name` attribute on the `<Route>`:

  `<Route path="/about" page={AboutPage} name="about" />`

  If you don't like the name that `redwood generate` used for your route, feel free to change it in `Routes.js`! Named routes are awesome because if you ever change the path associated with a route, you need only change it in `Routes.js` and every link using a named route function will still point to the correct place. You can also pass a string to the `to` attribute, but you'll lose out on all the Redwood goodness that named routes provide.

### Back Home

Once we get to the About page we don't have any way to get back so let's add a link there as well:

```javascript
// web/src/pages/AboutPage/AboutPage.js

import { Link, routes } from '@redwoodjs/router'

const AboutPage = () => {
  return (
    <>
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <p>
          This site was created to demonstrate my mastery of Redwood: Look on my
          works, ye mighty, and despair!
        </p>
        <Link to={routes.home()}>Return home</Link>
      </main>
    </>
  )
}

export default AboutPage
```

Great! Try that out in the browser and verify you can get back and forth.

As a world-class developer you probably saw that copy-and-pasted `<header>` and gasped in disgust. We feel you. That's why Redwood has a little something called _Layouts_.

## Layouts

One way to solve the `<header>` dilemma would be to create a `<Header>` component and include it in both `HomePage` and `AboutPage`. That works, but is there a better solution? Ideally there should only be one reference to the `<header>` anywhere in our code.

When you look at these two pages what do they really care about? They have some content they want to display. They really shouldn't have to care what comes before (like a `<header>`) or after (like a `<footer>`). That's exactly what layouts do: they wrap your pages in a component that then renders the page as its child:

<img src="https://user-images.githubusercontent.com/300/70486228-dc874500-1aa5-11ea-81d2-eab69eb96ec0.png" alt="Layouts structure diagram" width="300">

Let's create a layout to hold that `<header>`:

    yarn redwood g layout blog

> From now on we'll use the shorter `g` alias instead of `generate`

That created `web/src/layouts/BlogLayout/BlogLayout.js` and an associated test file. We're calling this the "blog" layout because we may have other layouts at some point in the future (an "admin" layout, perhaps?).

Cut the `<header>` from both `HomePage` and `AboutPage` and paste it in the layout instead. Let's take out the duplicated `<main>` tag as well:

```javascript
// web/src/layouts/BlogLayout/BlogLayout.js

import { Link, routes } from '@redwoodjs/router'

const BlogLayout = (props) => {
  return (
    <>
      <header>
        <h1>Redwood Blog</h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  )
}

export default BlogLayout
```

`props.children` is where the magic will happen. Any page content given to the layout will be rendered here. Back to `HomePage` and `AboutPage`, we add a `<BlogLayout>` wrapper and now they're back to focusing on the content they care about (we can remove the import for `Link` and `routes` from `HomePage` since those are in the Layout instead):

```javascript
// web/src/pages/HomePage/HomePage.js

import BlogLayout from 'src/layouts/BlogLayout'

const HomePage = () => {
  return <BlogLayout>Home</BlogLayout>
}

export default HomePage
```

```javascript
// web/src/pages/AboutPage/AboutPage.js

import { Link, routes } from '@redwoodjs/router'
import BlogLayout from 'src/layouts/BlogLayout'

const AboutPage = () => {
  return (
    <BlogLayout>
      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
      <Link to={routes.home()}>Return home</Link>
    </BlogLayout>
  )
}

export default AboutPage
```

Back to the browser and you should see...nothing different. But that's good, it means our layout is working.

> **Why are things named the way they are?**
>
> You may have noticed some duplication in Redwood's file names. Pages live in a directory called `/pages` and also contain `Page` in their name. Same with Layouts. What's the deal?
>
> When you have dozens of files open in your editor it's easy to get lost, especially when you have several files with names that are similar or even the same (they happen to be in different directories). We've found that the extra duplication in the names of files is worth the productivity benefit when scanning through your open tabs.
>
> If you're using the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) plugin this also helps disambiguate when browsing through your component stack:
>
> <img src="https://user-images.githubusercontent.com/300/73025189-f970a100-3de3-11ea-9285-15c1116eb59a.png" width="400">

### Back Home Again

One more `<Link>`, let's have the title/logo link back to the homepage as per usual:

```javascript
// web/src/layouts/BlogLayout/BlogLayout.js

import { Link, routes } from '@redwoodjs/router'

const BlogLayout = (props) => {
  return (
    <>
      <header>
        <h1>
          <Link to={routes.home()}>Redwood Blog</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  )
}

export default BlogLayout
```

And then we can remove the extra "Return to Home" link (and Link/routes import) that we had on the About page:

```javascript
// web/src/pages/AboutPage/AboutPage.js

import BlogLayout from 'src/layouts/BlogLayout'

const AboutPage = () => {
  return (
    <BlogLayout>
      <p>
        This site was created to demonstrate my mastery of Redwood: Look on my
        works, ye mighty, and despair!
      </p>
    </BlogLayout>
  )
}

export default AboutPage
```

## Getting Dynamic

These two pages are great and all but where are the actual blog posts in this blog? Let's work on those next.

For the purposes of our tutorial we're going to get our blog posts from a database. Because relational databases are still the workhorses of many complex (and not-so-complex) web applications, we've made SQL access a first-class citizen. For Redwood apps, it all starts with the schema.

### Creating the Database Schema

We need to decide what data we'll need for a blog post. We'll expand on this at some point, but at a minimum we'll want to start with:

- `id` the unique identifier for this blog post (all of our database tables will have one of these)
- `title`
- `body` the actual content of the blog post
- `createdAt` a timestamp of when this record was created

We use [Prisma Client JS](https://photonjs.prisma.io/) to talk to the database. Prisma has another library called [Migrate](https://lift.prisma.io/) that lets us update the database's schema in a predictable way and snapshot each of those changes. Each change is called a _migration_ and Migrate will create one when we make changes to our schema.

First let's define the data structure for a post in the database. Open up `api/prisma/schema.prisma` and add the definition of our Post table (remove any "sample" models that are present in the file). Once you're done the entire schema file should look like:

```prisma
// api/prisma/schema.prisma

datasource DS {
  provider = "sqlite"
  url = env("DATABASE_URL")
}

generator photonjs {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}

model Post {
  id        Int @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
```

This says that we want a table called `Post` and it should have:

- An `id` column of type `Int`, we let Prisma know this is the column it should use as the `@id` (for it to create relationships to other tables) and that the `@default` value should be Prisma's special `autoincrement()` method letting it know that the DB should set it automatically when new records are created
- A `title` field that will contain a `String`
- A `body` field that will contain a `String`
- A `createdAt` field that will be a `DateTime` and will `@default` to `now()` when we create a new record (so we don't have to set the time manually in our app)

> For the tutorial we're keeping things simple and using an integer for our ID column. Some apps may want to use a CUID or a UUID which Prisma supports. In that case you would use `String` for the datatype instead of `Int` and use `cuid()` or `uuid()` instead of `autoincrement()`:
>
> `id String @id @default(cuid())`
>
> Integers also make for nicer URLs like https://redwoodblog.com/posts/123 instead of https://redwoodblog.posts/eebb026c-b661-42fe-93bf-f1a373421a13 Take a look at the [official Prisma documentation](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md#ids) for more on ID fields.

### Migrations

That was simple. Now we'll want to snapshot this as a migration:

    yarn redwood db save

A prompt will ask you if you'd like to create a new SQLite database (yes you would). Next it asks what you want to name this migration. This is for your own benefit—Redwood doesn't care about the migration's name, it's just a reference for future developers. Something like "create posts" is perfect.

After the command completes you'll see a new subdirectory created under `api/prisma/migrations` that has a timestamp and the name you gave the migration. It will contain a couple files inside (a snapshot of what the schema looked like at that point in time in `schema.prisma` and the directives that Prisma Migrate will use make the change to the database in `steps.json`).

We apply the migration with another command:

    yarn rw db up

> From now on we'll use the shorter `rw` alias instead of the full `redwood` name.

This will apply the migration (which runs the commands against the database to create the changes we need) which results in creating a new table called `Post` with the fields we defined above.

### Creating a Post Editor

We haven't decided on the look and feel of our site yet, but wouldn't it be amazing if we could play around with posts without having to build a bunch of pages that we'll probably throw away once the design team gets back to us? Lucky for us, "Amazing" is Redwood's middle name! It has no last name.

Let's generate everything we need to perform all the CRUD (Create, Retrieve, Update, Delete) actions on posts so we can not only verify that we've got the right fields in the database, but let us get some sample posts in there so we can start laying out our pages and see real content. Redwood has a generator for just the occasion:

    yarn rw g scaffold post

Let's point the browser to `http://localhost:8910/posts` and see what we have:

<img src="https://user-images.githubusercontent.com/300/73027952-53c03080-3de9-11ea-8f5b-d62a3676bbef.png" />

Well that's barely more than we got when we generated a page. What happens if we click that "New Post" button?

<img src="https://user-images.githubusercontent.com/300/73028004-72262c00-3de9-11ea-8924-66d1cc1fceb6.png" />

Okay, now we're getting somewhere. Fill in the title and body and click "Save".

<img src="https://user-images.githubusercontent.com/300/73028757-08a71d00-3deb-11ea-8813-046c8479b439.png" />

Did we just create a post in the database? And then show that post here on this page? Yes, yes we did. Try creating another:

<img src="https://user-images.githubusercontent.com/300/73028839-312f1700-3deb-11ea-8e83-0012a3cf689d.png" />

But what if we click "Edit" on one of those posts?

<img src="https://user-images.githubusercontent.com/300/73031307-9802ff00-3df0-11ea-9dc1-ea9af8f21890.png" />

Okay but what if we click "Delete"?

<img src="https://user-images.githubusercontent.com/300/73031339-aea95600-3df0-11ea-9d58-475d9ef43988.png" />

So, Redwood just created all the pages, components and services necessary to perform all CRUD actions on our posts table. No need to open a database GUI or login through a terminal window and write SQL from scratch. Redwood calls these _scaffolds_. Pretty neat, right?

Here's what happened when we ran that `yarn rw g scaffold post` command:

- Added an _SDL_ file to define several GraphQL queries and mutations in `api/src/graphql/posts.sdl.js`
- Added a _services_ file in `api/src/services/posts/posts.js` that makes the Photon calls to get data in and out of the database
- Created several _pages_ in `web/src/pages`:
  - `EditPostPage` for editing a post
  - `NewPostPage` for creating a new post
  - `PostPage` for showing the detail of a post
  - `PostsPage` for listing all the posts
- Created routes for those pages in `web/src/Routes.js`
- Created three _cells_ in `web/src/components`:
  - `EditPostCell` gets the post to edit in the database
  - `PostCell` gets the post to display
  - `PostsCell` gets all the posts
- Created four _components_ also in `web/src/components`:
  - `NewPost` displays the form for creating a new post
  - `Post` displays a single post
  - `PostForm` the actual form used by both the New and Edit components
  - `Posts` displays the table of all posts

> You'll notice that some of the generated parts have plural names and some have singular. This convention is borrowed from Ruby on Rails which uses a more "human" naming convention: if you're dealing with multiple of something (like the list of all posts) it will be plural. If you're only dealing with a single something (like creating a new post) it will be singular. It sounds natural when speaking, too: "show me a list of all the posts" versus "I'm going to create a new post."
>
> As far as the generators are concerned:
>
> - Services filenames are always plural.
> - The methods in the services will be singular or plural depending on if they are expected to return multiple posts or a single post (`posts` vs. `createPost`).
> - SDL filenames are plural.
> - Pages that come with the scaffolds are plural or singular depending on whether they deal with many or one post. When using the `page` generator it will stick with whatever name you give the command.
> - Layouts use the name you give them on the comand line.
> - Components and cells, like pages, will be plural or singular depending on context when created by the scaffold generator, otherwise they'll use the given name on the command line.
>
> Also note that it's the database table name part that's singular or plural, not the whole word. So it's `PostsCell`, not `PostCells`.
>
> You don't have to follow this convention once you start creating your own parts but we recommend doing so. The Ruby on Rails community has come to love this nomenclature even though many people complained about it when first exposed to it. [Give it five minutes](https://signalvnoise.com/posts/3124-give-it-five-minutes).

### Creating a Homepage

We can start replacing these pages one by one as we get designs, or maybe move them to the admin section of our site and build our own display pages from scratch. The public facing site won't let viewers create, edit or delete posts. What _can_ they do?

1. View a list of posts (without links to edit/delete)
2. View a single post

Since we'll probably want a way to create and edit posts going forward let's keep the scaffolded pages as they are and create new ones for these two items.

We already have `HomePage` so we won't need to create that. We want to display a list of posts to the user so we'll need to add that logic. We need to get the content from the database and we don't want the user to just see a blank screen in the meantime (depending on network conditions, server location, etc), so we'll want to show some kind of loading message or animation. And if there's an error retrieving the data we should handle that as well. And what about when we open source this blog engine and someone puts it live without any content in the database? It'd be nice if there was some kind of blank slate message.

Oh boy, our first page with data and we already have to worry about loading states, errors, and blank slates...or do we?

## Cells

These features are common in most web apps. We wanted to see if there was something we could do to make developers' lives easier when it comes to adding them to a typical component. We think we've come up with something to help. We call them _Cells_. Cells provide a simpler and more declarative approach to data fetching.

When you create a cell you export several specially named constants and then Redwood takes it from there. A typical cell may look something like:

```javascript
export const QUERY = gql`
  query {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>No posts yet!</div>

export const Failure = ({ error }) => (
  <div>Error loading posts: {error.message}</div>
)

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article>
      <h2>{post.title}</h2>
      <div>{post.body}</div>
    </article>
  ))
}
```

When React renders this component Redwood will:

- Perform the `QUERY` and display the `Loader` component until a response is received
- Once the query returns it will display one of three states:
  - If there was an error, the `Failure` component
  - If the data return is empty (`null` or empty array), the `Empty` component
  - Otherwise, the `Success` component

There are also some lifecycle helpers like `beforeQuery` (for massaging any props before being given to the `QUERY`) and `afterQuery` (for massaging the data returned from GraphQL but before being sent to the `Success` component)

The minimum you need for a cell are the `QUERY` and `Success` exports. If you don't export an `Empty` component, empty results will be sent to your `Success` component. If you don't provide a `Failure` component you'll get error output sent to the console.

A guideline for when to use cells is if your component needs some data from the database or other service that may be delayed in responding. Let Redwood worry about juggling what is displayed when and you can focus on the happy path of the final, rendered component populated with data.

### Our First Cell

The homepage displaying a list of posts is a perfect candidate for our first cell. Naturally, there is a Redwood generator for them:

    yarn rw g cell BlogPosts

This command will result in a new file at `/web/src/components/BlogPostsCell/BlogPostsCell.js` (and a test file) with some boilerplate to get you started:

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

export const QUERY = gql`
  query {
    blogPosts {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => <div>Error: {error.message}</div>

export const Success = ({ blogPosts }) => {
  return JSON.stringify(blogPosts)
}
```

> When generating you can use any case you'd like and Redwood will do the right thing when it comes to naming. These will all create the same filename:
>
>     yarn rw g cell blog_posts
>     yarn rw g cell blog-posts
>     yarn rw g cell blogPosts
>     yarn rw g cell BlogPosts
>
> You will need _some_ kind of indication that you're using more than one word. Calling `yarn redwood g cell blogposts` will generate a file at `web/src/components/BlogpostsCell/BlogpostsCell.js`

To get you off and running as quickly as possible the generator assumes you've got a root GraphQL query named the same thing as your cell and gives you the minimum query needed to get something out of the database. In this case it called the query `blogPosts` which is not a valid query name for our exising Posts SDL and Service. We'll have to rename that to just `posts` in both the query name and prop named in `Success`:

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

export const QUERY = gql`
  query {
    posts {
      id
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => <div>Error: {error.message}</div>

export const Success = ({ posts }) => {
  return JSON.stringify(posts)
}
```

Let's plug this cell into our `HomePage` and see what happens:

```javascript
// web/src/pages/HomePage/HomePage.js

import BlogLayout from 'src/layouts/BlogLayout'
import BlogPostsCell from 'src/components/BlogPostsCell'

const HomePage = () => {
  return (
    <BlogLayout>
      <BlogPostsCell />
    </BlogLayout>
  )
}

export default HomePage
```

The browser should actually show an array with a number or two (assuming you created a blog post with our [scaffolding](/tutorial/getting-dynamic#creating-a-post-editor) from earlier). Neat!

<img src="https://user-images.githubusercontent.com/300/73210519-5380a780-40ff-11ea-8639-968507a79b1f.png" />

> **In the `Success` component, where did `posts` come from?**
>
> Notice in the `QUERY` that the query we're making is `posts`. Whatever the name of this query is, that's the name of the prop that will be available in `Success` with your data. You can alias the name of the variable containing the result of the GraphQL query, and that will be the name of the prop:
>
> ```javascript
> export const QUERY = gql`
>   query {
>     postIds: posts {
>       id
>     }
>   }
> `
> ```
>
> Now `postIds` will be available in `Success` instead of `posts`

In addition to the `id` that was added to the `query` by the generator, let's get the title, body, and createdAt too:

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

export const QUERY = gql`
  query {
    posts {
      id
      title
      body
      createdAt
    }
  }
`
```

The page should now show a dump of all the data you created for any blog posts you scaffolded:

<img src="https://user-images.githubusercontent.com/300/73210715-abb7a980-40ff-11ea-82d6-61e6bdcd5739.png" />

Now we're in the realm of good ol' React components, so just build out the `Success` component to display the blog post in a nicer format:

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article key={post.id}>
      <header>
        <h2>{post.title}</h2>
      </header>
      <p>{post.body}</p>
      <div>Posted at: {post.createdAt}</div>
    </article>
  ))
}
```

And just like that we have a blog! It may be the most basic, ugly blog that ever graced the internet, but it's something! (Don't worry, we've got more features to add.)

<img src="https://user-images.githubusercontent.com/300/73210997-3dbfb200-4100-11ea-847a-602cbf59cb2a.png" />

### Summary

To sum up, what did we actually do to get this far?

1. Generate the homepage
2. Generate the blog layout
3. Define the database schema
4. Run migrations to update the database and create a table
5. Scaffold a CRUD interface to the database table
6. Create a cell to load the data and take care of loading/empty/failure/success states
7. Add the cell to the page

This will become a standard lifecycle of new features as you build a Redwood app.

So far, other than a little HTML, we haven't had to do much by hand. And we especially didn't have to write a bunch of plumbing just to move data from one place to another. It makes web development a little more enjoyable, don't you think?

## Side Quest: How Redwood Works with Data

Redwood likes GraphQL. We think it's the API of the future. Our GraphQL implementation is built with [Apollo](https://www.apollographql.com/). Here's how a typical GraphQL query works its way through your app:

![Redwood Data Flow](https://user-images.githubusercontent.com/300/75402679-50bdd180-58ba-11ea-92c9-bb5a5f4da659.png)

The front-end uses [Apollo Client](https://www.apollographql.com/docs/react/) to create a GraphQL payload sent to [Apollo Server](https://www.apollographql.com/docs/apollo-server/) running in a serverless AWS Lambda function in the cloud.

The `*.sdl.js` files in `api/src/graphql` define the GraphQL [Object](https://www.apollographql.com/docs/tutorial/schema/#object-types), [Query](https://www.apollographql.com/docs/tutorial/schema/#the-query-type) and [Mutation](https://www.apollographql.com/docs/tutorial/schema/#the-mutation-type) types and thus the interface of your API.

Normally you would write a [resolver map](https://www.apollographql.com/docs/tutorial/resolvers/#what-is-a-resolver) that contains all your resolvers and tells Apollo how to map them to your SDL. But putting business logic directly in the resolver map would result in a very big file and horrible reusability, so you'd be well advised to extract all the logic out into a library of functions, import them, and call them from the resolver map, remembering to pass all the arguments through. Ugh, that's a lot of effort and boilerplate, and still doesn't result in very good reusabilty.

Redwood has a better way! Remember the `api/src/services` directory? Redwood will automatically import and map resolvers from the corresponding **services** file onto your SDL. At the same time, it allows you to write those resolvers in a way that makes them easy to call as regular functions from other resolvers or services. That's a lot of awesomeness to contemplate, so let's show an example.

Consider the following SDL snippet:

```
// api/src/graphql/posts.sdl.js

type Query {
  posts: [Post]
  post(id: Int!): Post
}

type Mutation {
  createPost(input: PostInput!): Post
  updatePost(id: Int!, input: PostInput!): Post
  deletePost(id: Int!): Post
}
```

In this example, Redwood will look in `api/src/services/posts/posts.js` for the following five resolvers:

- `posts()`
- `post({id})`
- `createPost({input)}`
- `updatePost({id, input})`
- `deletePost({id})`

To implement these, simply export them from the services file. They will usually get your data from a database, but they can do anything you want, as long as they return the proper types that Apollo expects based on what you defined in `posts.sdl.js`:

```javascript
// api/src/services/posts/posts.js

export const posts = () => {
  return db.post.findMany()
}

export const post = ({ id }) => {
  return db.post.findOne({
    where: { id: id },
  })
}

export const createPost = ({ input }) => {
  return db.post.create({
    data: input,
  })
}

export const updatePost = ({ id, input }) => {
  return db.post.update({
    data: input,
    where: { id: id },
  })
}

export const deletePost = ({ id }) => {
  return db.post.delete({
    where: { id: id },
  })
}
```

> Apollo assumes these functions return promises, which `db` (an instance of `PrismaClient`) does. Apollo waits for them to resolve before responding with your query results, so you don't need to worry about `async`/`await` or mess with callbacks yourself.

You may be wondering why we call these implementation files "services". While this example blog doesn't get complex enough to show it off, services are intended to be an abstraction **above** single database tables. For example, a more complex app may have a "billing" service that uses both a `transactions` table and a `subscriptions` table. Some of the functionality of this service may be exposed via GraphQL, but only as much as you like.

You don't have to make each function in your service available via GraphQL—leave it out of your `Query` and `Mutation` types and it won't exist as far as GraphQL is concerned. But you could still use it yourself—services are just Javascript functions so you can use them anywhere you'd like:

- From another service
- In a custom lambda function
- From a completely separate, custom API

By dividing your app into well-defined services and providing an API for those services (both for internal use **and** for GraphQL), you will naturally start to enforce separation of concerns and (in all likelihood) increase the maintainability of your codebase.

Back to our data flow: Apollo has called the resolver which, in our case, retrieved data from the database. Apollo digs into the object and returns only the key/values that were asked for in the GraphQL query. It then packages up the response in a GraphQL payload and returns it to the browser.

If you're using a Redwood **cell** then this data will be available to you in your `Success` component ready to be looped through and/or displayed like any other React component.

## Routing Params

Now that we have our homepage listing all the posts, let's build the "detail" page—a canonical URL that displays a single post. First we'll generate the page and route:

    yarn rw g page BlogPost

> Note that we can't call this page simply `Post` because our scaffold already created a page with that name.

Now let's link the title of the post on the homepage to the detail page (and include the `import` for `Link` and `routes`):

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

import { Link, routes } from '@redwoodjs/router'

// QUERY, Loading, Empty and Failure definitions...

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article key={post.id}>
      <header>
        <h2>
          <Link to={routes.blogPost()}>{post.title}</Link>
        </h2>
      </header>
      <p>{post.body}</p>
      <div>Posted at: {post.createdAt}</div>
    </article>
  ))
}
```

If you click the link on the title of the blog post you should see the boilerplate text on `BlogPostPage`. But what we really need is to specify _which_ post we want to view on this page. It would be nice to be able to specify the ID of the post in the URL with something like `/blog-post/1`. Let's tell the `<Route>` to expect another part of the URL, and when it does, give that part a name that we can reference later:

```javascript
// web/src/Routes.js

<Route path="/blog-post/{id}" page={BlogPostPage} name="blogPost" />
```

Notice the `{id}`. Redwood calls these _route parameters_. They say "whatever value is in this position in the path, let me reference it by the name inside the curly braces."

Cool, cool, cool. Now we need to construct a link that has the ID of a post in it:

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

<Link to={routes.blogPost({ id: post.id })}>{post.title}</Link>
```

For routes with route parameters, the named route function expects an object where you specify a value for each parameter. If you click on the link now, it will indeed take you to `/blog-post/1` (or `/blog-post/2`, etc, depending on the ID of the post).

### Using the Param

Ok, so the ID is in the URL. What do we need next in order to display a specific post? It sounds like we'll be doing some data retrieval from the database, which means we want a cell:

    yarn rw g cell blog_post

And then we'll use that cell in `BlogPostPage` (and while we're at it let's surround the page with the `BlogLayout`):

```javascript
// web/src/pages/BlogPostPage/BlogPostPage.js

import BlogLayout from 'src/layouts/BlogLayout'
import BlogPostCell from 'src/components/BlogPostCell'

const BlogPostPage = () => {
  return (
    <BlogLayout>
      <BlogPostCell />
    </BlogLayout>
  )
}

export default BlogPostPage
```

Now over to the cell, we need access to that `{id}` route param so we can look up the ID of the post in the database. Let's update the query to accept a variable (and again change the query name from `blogPost` to just `post`)

```javascript
// web/src/cells/BlogPostCell/BlogPostCell.js

export const QUERY = gql`
  query($id: Int!) {
    post(id: $id) {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => <div>Error: {error.message}</div>

export const Success = ({ post }) => {
  return JSON.stringify(post)
}
```

Okay, we're getting closer. Still, where will that `$id` come from? Redwood has another trick up its sleeve. Whenever you put a route param in a route, that param is automatically made available to the page that route renders. Which means we can update `BlogPostPage` to look like this:

```javascript
// web/src/pages/BlogPostPage/BlogPostPage.js

const BlogPostPage = ({ id }) => {
  return (
    <BlogLayout>
      <BlogPostCell id={id} />
    </BlogLayout>
  )
}
```

`id` already exists since we named our route param `{id}`. Thanks Redwood! But how does that `id` end up as the `$id` GraphQL parameter? If you've learned anything about Redwood by now, you should know it's going to take care of that for you! By default, any props you give to a cell will automatically be turned into variables and given to the query. "Say what!" you're saying. It's true!

We can prove it! Try going to the detail page for a post in the browser and—uh oh. Hmm:

![image](https://user-images.githubusercontent.com/300/75820346-096b9100-5d51-11ea-8f6e-53fda78d1ed5.png)

> By the way, this error message you're seeing is thanks to the `Failure` section of our Cell!

If you take a look in the web inspector console you can see the actual error coming from GraphQL:

    [GraphQL error]: Message: Variable "$id" got invalid value "1"; Expected type Int. Int cannot represent non-integer value: "1", Location: [object Object], Path: undefined

It turns out that route params are extracted as strings from the URL, but GraphQL wants an integer for the ID. We could use `parseInt()` to convert it to a number before passing it into `BlogPostCell`, but honestly, we can do better than that!

### Route Param Types

What if you could request the conversion right in the route's path? Well, guess what: you can! Introducing **route param types**. It's as easy as adding `:Int` to our existing route param:

```javascript
// web/src/Routes.js

<Route path="/blog-post/{id:Int}" page={BlogPostPage} name="blogPost" />
```

Voilá! Not only will this convert the `id` param to a number before passing it to your Page, it will prevent the route from matching unless the `id` path segment consists entirely of digits. If any non-digits are found, the router will keep trying other routes, eventually showing the `NotFoundPage` if no routes match.

> **What if I want to pass some other prop to the cell that I don't need in the query, but do need in the Success/Loader/etc. components?**
>
> All of the props you give to the cell will be automatically available as props in the render components. Only the ones that match the GraphQL variables list will be given to the query. You get the best of both worlds! In our post display above, if you wanted to display some random number along with the post (for some contrived, tutorial-like reason), just pass that prop:
>
> ```javascript
> <BlogPostCell id={id} rand={Math.random()}>
> ```
>
> And get it, along with the query result (and even the original `id` if you want) in the component:
>
> ```javascript
> export const Success = ({ post, id, rand }) => {
>   //...
> }
> ```
>
> Thanks again, Redwood!

### Displaying a Blog Post

Now let's display the actual post instead of just dumping the query result. This seems like the perfect place for a good old fashioned component since we're displaying a post on both the home page and this detail page, and it's (currently) the same exact output. Let's Redwood-up a component (I just invented that phrase):

    yarn rw g component BlogPost

Which creates `web/src/components/BlogPost/BlogPost.js` (and test!) as a super simple React component:

```javascript
// web/src/components/BlogPost/BlogPost.js

const BlogPost = () => {
  return (
    <div>
      <h2>{'BlogPost'}</h2>
      <p>{'Find me in ./web/src/components/BlogPost/BlogPost.js'}</p>
    </div>
  )
}

export default BlogPost
```

> You may notice we don't have any explict `import` statements for `React` itself. We (the Redwood dev team) got tired of constantly importing it over and over again in every file so we automatically import it for you!

Let's take the post display code out of `BlogPostsCell` and put it here instead, taking the `post` in as a prop:

```javascript
// web/src/components/BlogPost/BlogPost.js
import { Link, routes } from '@redwoodjs/router'

const BlogPost = ({ post }) => {
  return (
    <article>
      <header>
        <h2>
          <Link to={routes.blogPost({ id: post.id })}>{post.title}</Link>
        </h2>
      </header>
      <div>{post.body}</div>
    </article>
  )
}

export default BlogPost
```

And update `BlogPostsCell` and `BlogPostCell` to use this new component instead (don't forget the `import BlogPost from 'src/components/BlogPost'` at the top of each):

```javascript
// web/src/components/BlogPostsCell/BlogPostsCell.js

import BlogPost from 'src/components/BlogPost'

// Loading, Empty, Failure...

export const Success = ({ posts }) => {
  return posts.map((post) => <BlogPost key={post.id} post={post} />)
}
```

```javascript
// web/src/components/BlogPostCell/BlogPostCell.js

import BlogPost from 'src/components/BlogPost'

// Loading, Empty, Failure...

export const Success = ({ post }) => {
  return <BlogPost post={post} />
}
```

And there we go! We should be able to move back and forth between the homepage and the detail page.

> If you like what you've been seeing from the router, you can dive deeper into the [Redwood Router Docs](https://github.com/redwoodjs/redwood/tree/master/packages/router).

### Summary

Let's summarize:

1. We created a new page to show a single post (the "detail" page).
2. We added a route to handle the `id` of the post and turn it into a route param.
3. We created a cell to fetch and display the post.
4. Redwood made the world a better place by making that `id` available to us at several key junctions in our code and even turning it into a number automatically.
5. We turned the actual post display into a standard React component and used it in both the homepage and new detail page.

## Everyone's Favorite Thing to Build: Forms

Wait, don't close your browser! You had to know this was coming eventually, didn't you? And you've probably realized by now we wouldn't even have this section in the tutorial unless Redwood had figured out a way to make forms less soul-sucking than usual. In fact Redwood might even make you _love_ building forms. Well, love is a strong word. _Like_ building forms. _Tolerate_ building them?

We already have a form or two in our app; remember our posts scaffold? And those work pretty well! How hard can it be? (Hopefully you haven't sneaked a peek at that code—what's coming next will be much more impressive if you haven't.)

Let's build the simplest form that still makes sense for our blog, a "contact us" form.

### The Page

    yarn rw g page contact

We can put a link to Contact in our layout's header:

```javascript
// web/src/layouts/BlogLayout/BlogLayout.js

import { Link, routes } from '@redwoodjs/router'

const BlogLayout = (props) => {
  return (
    <>
      <header>
        <h1>
          <Link to={routes.home()}>Redwood Blog</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to={routes.about()}>About</Link>
            </li>
            <li>
              <Link to={routes.contact()}>Contact</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  )
}

export default BlogLayout
```

And then use the `BlogLayout` in the `ContactPage`:

```javascript
// web/src/pages/ContactPage/ContactPage.js

import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  return <BlogLayout></BlogLayout>
}

export default ContactPage
```

Double check that everything looks good and then let's get to the good stuff.

### Introducing Form Helpers

Forms in React are infamously annoying to work with. There are [Controlled Components](https://reactjs.org/docs/forms.html#controlled-components) and [Uncontrolled Components](https://reactjs.org/docs/uncontrolled-components.html) and [third party libraries](https://jaredpalmer.com/formik/) and many more workarounds to try and make forms in React as simple as they were originally intended to be: an `<input>` field with a `name` attribute that gets submitted somewhere when you click a button.

We think Redwood is a step or two in the right direction by not only freeing you from writing controlled component plumbing, but also dealing with validation and errors automatically. Let's see how it works.

For now we won't be talking to the database in our Contact form so we won't create a cell. Let's create the form right on the page. Redwood forms start with the...wait for it...`<Form>` tag:

```javascript
// web/src/pages/ContactPage/ContactPage.js

import { Form } from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  return (
    <BlogLayout>
      <Form></Form>
    </BlogLayout>
  )
}

export default ContactPage
```

Well that was anticlimactic. You can't even see it in the browser. Let's add a form field so we can at least see something. Redwood ships with several inputs and a plain text input box is `<TextField>`. We'll also give the field a `name` attribute so that once there are multiple inputs on this page we'll know which contains which data:

```javascript
// web/src/pages/ContactPage/ContactPage.js

import { Form, TextField } from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  return (
    <BlogLayout>
      <Form>
        <TextField name="input" />
      </Form>
    </BlogLayout>
  )
}

export default ContactPage
```

<img src="https://user-images.githubusercontent.com/300/73305498-108e0500-41cf-11ea-86a2-1075a3abaff0.png" />

Something is showing! Still, pretty boring. How about adding a submit button?

```javascript
// web/src/pages/ContactPage/ContactPage.js

import { Form, TextField, Submit } from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  return (
    <BlogLayout>
      <Form>
        <TextField name="input" />
        <Submit>Save</Submit>
      </Form>
    </BlogLayout>
  )
}

export default ContactPage
```

<img src="https://user-images.githubusercontent.com/300/73305544-269bc580-41cf-11ea-821f-84f08bb9a5fb.png" />

We have what might actually be considered a real, bonafide form here. Try typing something in and clicking "Save". Nothing blew up on the page but we have no indication that the form submitted or what happened to the data (although you may have noticed an error in the Web Inspector). Next we'll get the data in our fields.

### onSubmit

Similar to a plain HTML form we'll give `<Form>` an `onSubmit` handler. That handler will be called with a single argument—an object containing all of the submitted form fields:

```javascript
// web/src/pages/ContactPage/ContactPage.js

const ContactPage = (props) => {
  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <BlogLayout>
      <Form onSubmit={onSubmit}>
        <TextField name="input" />
        <Submit>Save</Submit>
      </Form>
    </BlogLayout>
  )
}
```

Now try filling in some data and submitting:

<img src="https://user-images.githubusercontent.com/300/73305602-4632ee00-41cf-11ea-815a-6079576c60bc.png" />

Great! Let's turn this into a more useful form by adding a couple fields. We'll rename the existing one to "name" and add "email" and "message":

```javascript
// web/src/pages/ContactPage/ContactPage.js

import { Form, TextField, TextAreaField, Submit } from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <BlogLayout>
      <Form onSubmit={onSubmit}>
        <TextField name="name" />
        <TextField name="email" />
        <TextAreaField name="message" />
        <Submit>Save</Submit>
      </Form>
    </BlogLayout>
  )
}

export default ContactPage
```

See the new `<TextAreaField>` component here which generates an HTML `<textarea>` but that contains Redwood's form goodness. If we reload now our fields are there but there's no indication of which is which and everything is kind of jumbled together:

<img src="https://user-images.githubusercontent.com/300/73305645-61056280-41cf-11ea-8be7-d1f4d55788c2.png" />

Let's add some labels and just a tiny bit of styling to at least separate the fields onto their own lines.

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  <BlogLayout>
    <Form onSubmit={onSubmit}>
      <label htmlFor="name" style={{ display: 'block' }}>
        Name
      </label>
      <TextField name="name" style={{ display: 'block' }} />

      <label htmlFor="email" style={{ display: 'block' }}>
        Email
      </label>
      <TextField name="email" style={{ display: 'block' }} />

      <label htmlFor="message" style={{ display: 'block' }}>
        Message
      </label>
      <TextAreaField name="message" style={{ display: 'block' }} />

      <Submit style={{ display: 'block' }}>Save</Submit>
    </Form>
  </BlogLayout>
)
```

<img src="https://user-images.githubusercontent.com/300/73305679-77abb980-41cf-11ea-95f7-8ea0e4bf2350.png" />

That's a little better. Try filling out the form and submitting and you should get a console message with all three fields now.

### Validation

"Okay Redwood tutorial author," you're saying, "what's the big deal? You built up Redwood's form helpers as The Next Big Thing but there are plenty of libraries that will let me skip creating controlled inputs manually. So what?" And you're right! Anyone can fill out a form _correctly_ (although there are plenty of QA folks who would challenge that assertion), but what happens when someone leaves something out, or makes a mistake, or tries to haxorz our form? Now who's going to be there to help? Redwood, that's who!

All three of these fields should be required in order for someone to send a message to us. Let's enforce that with the standard HTML `required` attribute:

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  <BlogLayout>
    <Form onSubmit={onSubmit}>
      <label htmlFor="name" style={{ display: 'block' }}>
        Name
      </label>
      <TextField name="name" style={{ display: 'block' }} required />

      <label htmlFor="email" style={{ display: 'block' }}>
        Email
      </label>
      <TextField name="email" style={{ display: 'block' }} required />

      <label htmlFor="message" style={{ display: 'block' }}>
        Message
      </label>
      <TextAreaField name="message" style={{ display: 'block' }} required />

      <Submit style={{ display: 'block' }}>Save</Submit>
    </Form>
  </BlogLayout>
)
```

<img src="https://user-images.githubusercontent.com/300/73305807-bf324580-41cf-11ea-94a8-f45a0506375d.png" />

Now when trying to submit there'll be message from the browser noting that a field must be filled in. This is better than nothing, but these messages can't be styled. Can we do better?

Yes! Let's update that `required` call to instead be an object we pass to a custom attribute on Redwood form helpers called `validation`:

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  <BlogLayout>
    <Form onSubmit={onSubmit}>
      <label htmlFor="name" style={{ display: 'block' }}>
        Name
      </label>
      <TextField
        name="name"
        style={{ display: 'block' }}
        validation={{ required: true }}
      />

      <label htmlFor="email" style={{ display: 'block' }}>
        Email
      </label>
      <TextField
        name="email"
        style={{ display: 'block' }}
        validation={{ required: true }}
      />

      <label htmlFor="message" style={{ display: 'block' }}>
        Message
      </label>
      <TextAreaField
        name="message"
        style={{ display: 'block' }}
        validation={{ required: true }}
      />

      <Submit style={{ display: 'block' }}>Save</Submit>
    </Form>
  </BlogLayout>
)
```

And now when we submit the form with blank fields...the Name field gets focus. Boring. But this is just a stepping stone to our amazing reveal! We have one more form helper component to add—the one that displays errors on a field. Oh it just so happens that it's plain HTML so we can style it however we want!

### &lt;FieldError&gt;

Introducing `<FieldError>` (don't forget to include it in the `import` statement at the top):

```javascript
// web/src/pages/ContactPage/ContactPage.js

import {
  Form,
  TextField,
  TextAreaField,
  Submit,
  FieldError,
} from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <BlogLayout>
      <Form onSubmit={onSubmit}>
        <label htmlFor="name" style={{ display: 'block' }}>
          Name
        </label>
        <TextField
          name="name"
          style={{ display: 'block' }}
          validation={{ required: true }}
        />
        <FieldError name="name" />

        <label htmlFor="email" style={{ display: 'block' }}>
          Email
        </label>
        <TextField
          name="email"
          style={{ display: 'block ' }}
          validation={{ required: true }}
        />
        <FieldError name="email" />

        <label htmlFor="message" style={{ display: 'block' }}>
          Message
        </label>
        <TextAreaField
          name="message"
          style={{ display: 'block' }}
          validation={{ required: true }}
        />
        <FieldError name="message" />

        <Submit style={{ display: 'block' }}>Save</Submit>
      </Form>
    </BlogLayout>
  )
}

export default ContactPage
```

Note that the `name` attribute matches the `name` of the input field above it. That's so it knows which field to display errors for. Try submitting that form now.

<img src="https://user-images.githubusercontent.com/300/73305960-12a49380-41d0-11ea-977f-74078ad6ff04.png" />

But this is just the beginning. Let's make sure folks realize this is an error message (see the new `style` attributes):

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  <BlogLayout>
    <Form onSubmit={onSubmit}>
      <label htmlFor="name" style={{ display: 'block' }}>
        Name
      </label>
      <TextField
        name="name"
        style={{ display: 'block' }}
        validation={{ required: true }}
      />
      <FieldError name="name" style={{ color: 'red' }} />

      <label htmlFor="email" style={{ display: 'block' }}>
        Email
      </label>
      <TextField
        name="email"
        style={{ display: 'block' }}
        validation={{ required: true }}
      />
      <FieldError name="email" style={{ color: 'red' }} />

      <label htmlFor="message" style={{ display: 'block' }}>
        Message
      </label>
      <TextAreaField
        name="message"
        style={{ display: 'block' }}
        validation={{ required: true }}
      />
      <FieldError name="message" style={{ color: 'red' }} />

      <Submit style={{ display: 'block' }}>Save</Submit>
    </Form>
  </BlogLayout>
)
```

<img src="https://user-images.githubusercontent.com/300/73306040-3cf65100-41d0-11ea-99a9-9468bba82da7.png" />

You know what would be nice, if the input itself somehow displayed the fact that there was an error. Check out the `errorStyle` attributes:

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  <BlogLayout>
    <Form onSubmit={onSubmit}>
      <label htmlFor="name" style={{ display: 'block' }}>
        Name
      </label>
      <TextField
        name="name"
        style={{ display: 'block' }}
        errorStyle={{ display: 'block', borderColor: 'red' }}
        validation={{ required: true }}
      />
      <FieldError name="name" style={{ color: 'red' }} />

      <label htmlFor="email" style={{ display: 'block' }}>
        Email
      </label>
      <TextField
        name="email"
        style={{ display: 'block' }}
        errorStyle={{ display: 'block', borderColor: 'red' }}
        validation={{ required: true }}
      />
      <FieldError name="email" style={{ color: 'red' }} />

      <label htmlFor="message" style={{ display: 'block' }}>
        Message
      </label>
      <TextAreaField
        name="message"
        style={{ display: 'block' }}
        errorStyle={{ display: 'block', borderColor: 'red' }}
        validation={{ required: true }}
      />
      <FieldError name="message" style={{ color: 'red' }} />

      <Submit style={{ display: 'block' }}>Save</Submit>
    </Form>
  </BlogLayout>
)
```

<img src="https://user-images.githubusercontent.com/300/73306358-eb01fb00-41d0-11ea-8615-08e396c24cef.png" />

Oooo, what if the _label_ could change as well? It can, but we'll need Redwood's custom `<Label>` component for that (note that `for` becomes `name` just like the other components). Don't forget the import:

```javascript
// web/src/pages/ContactPage/ContactPage.js

import {
  Form,
  TextField,
  TextAreaField,
  Submit,
  FieldError,
  Label,
} from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <BlogLayout>
      <Form onSubmit={onSubmit}>
        <Label
          name="name"
          style={{ display: 'block' }}
          errorStyle={{ display: 'block', color: 'red' }}
        >
          Name
        </Label>
        <TextField
          name="name"
          style={{ display: 'block' }}
          errorStyle={{ display: 'block', borderColor: 'red' }}
          validation={{ required: true }}
        />
        <FieldError name="name" style={{ color: 'red' }} />

        <Label
          name="email"
          style={{ display: 'block' }}
          errorStyle={{ display: 'block', color: 'red' }}
        >
          Email
        </Label>
        <TextField
          name="email"
          style={{ display: 'block' }}
          errorStyle={{ display: 'block', borderColor: 'red' }}
          validation={{ required: true }}
        />
        <FieldError name="email" style={{ color: 'red' }} />

        <Label
          name="message"
          style={{ display: 'block' }}
          errorStyle={{ display: 'block', color: 'red' }}
        >
          Message
        </Label>
        <TextAreaField
          name="message"
          style={{ display: 'block' }}
          errorStyle={{ display: 'block', borderColor: 'red' }}
          validation={{ required: true }}
        />
        <FieldError name="message" style={{ color: 'red' }} />

        <Submit style={{ display: 'block' }}>Save</Submit>
      </Form>
    </BlogLayout>
  )
}

export default ContactPage
```

<img src="https://user-images.githubusercontent.com/300/73306562-53e97300-41d1-11ea-8bdd-e149f6b439db.png" />

> In addition to `style` and `errorStyle` you can also use `className` and `errorClassName`

### Validating Input Format

We should make sure the email field actually contains an email:

```javascript
// web/src/pages/ContactPage/ContactPage.js

<TextField
  name="email"
  style={{ display: 'block' }}
  errorStyle={{ display: 'block', borderColor: 'red' }}
  validation={{
    required: true,
    pattern: {
      value: /[^@]+@[^\.]+\..+/,
    },
  }}
/>
```

That is definitely not the end-all-be-all for email address validation, but pretend it's bulletproof. Let's also change the message on the email validation to be a little more friendly:

```javascript
// web/src/pages/ContactPage/ContactPage.js

<TextField
  name="email"
  style={{ display: 'block' }}
  errorStyle={{ display: 'block', borderColor: 'red' }}
  validation={{
    required: true,
    pattern: {
      value: /[^@]+@[^\.]+\..+/,
      message: 'Please enter a valid email address',
    },
  }}
/>
```

<img src="https://user-images.githubusercontent.com/300/73306774-be9aae80-41d1-11ea-8f72-ac783ec44e76.png" />

You may have noticed that trying to submit a form with validation errors outputs nothing to the console—it's not actually submitting. That's a good thing! Fix the errors and all is well.

> When a validation error appears it will _disappear_ as soon as you fix the content of the field. You don't have to click "Submit" again to remove the error messages.

Finally, you know what would _really_ be nice: if the fields were validated as soon as the user leaves each one so they don't fill out the whole thing and submit just to see multiple errors appear. Let's do that:

```javascript
// web/src/pages/ContactPage/ContactPage.js

<Form onSubmit={onSubmit} validation={{ mode: 'onBlur' }}>
```

Well, what do you think? Was it worth the hype? A couple of new components and you've got forms that handle validation and wrap up submitted values in a nice data object, all for free.

> Redwood's forms are built on top of [React Hook Form](https://react-hook-form.com/) so there is even more functionality available than we've documented here.

Redwood has one more trick up its sleeve when it comes to forms but we'll save that for when we're actually submitting one to the server.

Having a contact form is great, but only if you actually get the contact somehow. Let's create a database table to hold the submitted data and create our first GraphQL mutation.

## Saving Data

Let's add a new database table. Open up `api/prisma/schema.prisma` and add a Contact model after the Post model that's there now:

```javascript
// api/prisma/schema.prisma

model Contact {
  id        Int @id @default(autoincrement())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}
```

> To mark a column as optional (that is, allowing `NULL` as a value) you can suffix the datatype with question mark: `name String?`

Next we create a migration file:

    yarn rw db save

The command will ask for a name again. How about "create contact"? Finally we execute the migration to run the DDL commands to upgrade the database:

    yarn rw db up

Now we'll create the GraphQL interface to access this table. We haven't used this `generate` command yet (although the `scaffold` command did use it behind the scenes):

    yarn rw g sdl contact

Just like the `scaffold` command, this will create two new files under the `api` directory:

1. `api/src/graphql/contacts.sdl.js`: defines the GraphQL schema in GraphQL's schema definition language
2. `api/src/services/contacts/contacts.js`: contains your app's business logic.

Open up `api/src/graphql/contacts.sdl.js` and you'll see the `Contact` and `ContactInput` types were already defined for us—the `generate sdl` command introspected the schema and created a `Contact` type containing each database field in the table, as well as a `Query` type with a single query `contacts` which returns an array of `Contact` types:

```javascript
// api/src/graphql/contacts.sdl.js

export const schema = gql`
  type Contact {
    id: String!
    name: String!
    email: String!
    message: String!
    createdAt: DateTime!
  }

  type Query {
    contacts: [Contact]
  }

  type ContactInput {
    name: String
    email: String
    message: String
  }
`
```

What's `ContactInput`? Redwood follows the GraphQL recommendation of using [Input Types](https://graphql.org/graphql-js/mutations-and-input-types/) in mutations rather than listing out each and every field that can be set.

> Redwood assumes your code won't try to set a value on any field named `id` or `createdAt` so it left those out of the `ContactInput` type, but if your database allowed either of those to be set manually you can update `ContactInput` and add them.

Since all of the DB columns were required in the `schema.prisma` file they are marked as required here (the `!` suffix on the datatype).

> **Remember:** `schema.prisma` syntax requires an extra `?` character when a field is _not_ required, GraphQL's SDL syntax requires an extra `!` when a field _is_ required.

As described in [Side Quest: How Redwood Deals with Data](side-quest-how-redwood-works-with-data) there are no explict resolvers defined in the SDL file. Redwood follows a simple naming convention—each field listed in the `Query` and `Mutation` types map to a function with the same name in the `services` file with the same name as the `sdl` file (`api/src/graphql/contacts.sdl.js -> api/src/services/contacts/contacts.js`)

In this case we're creating a single `Mutation` that we'll call `createContact`. Add that to the end of the SDL file (before the closing backtick):

```javascript
// api/src/graphql/contacts.sdl.js

type Mutation {
  createContact(input: ContactInput!): Contact
}
```

The `createContact` mutation will accept a single variable, `input`, that is an object that conforms to what we expect for a `ContactInput`, namely `{ name, email, message }`.

That's it for the SDL file, let's define the service that will actually save the data to the database. The service includes a default `contacts` function for getting all contacts from the database. Let's add our mutation to create a new contact:

```javascript
// api/src/services/contacts/contacts.js

export const contacts = () => {
  return db.contact.findMany()
}

export const createContact = ({ input }) => {
  return db.contact.create({ data: input })
}
```

Thanks to Photon it takes very little code to actually save something to the database! This is an asynchronous call but we didn't have to worry about resolving Promises or dealing with `async/await`. Apollo will do that for us!

Before we plug this into the UI, let's take a look at a nifty GUI you get just by running `yarn redwood dev`.

### GraphQL Playground

Often it's nice to experiment and call your API in a more "raw" form before you get too far down the path of implementation only to find out something is missing. Is there a typo in the API layer or the web layer? Let's find out by accessing just the API layer.

When you started development with `yarn redwood dev` you actually started a second process running at the same time. Open a new browser tab and head to http://localhost:8911/graphql This is Prisma's [GraphQL Playground](https://github.com/prisma-labs/graphql-playground), a web-based GUI for GraphQL APIs:

<img src="https://user-images.githubusercontent.com/300/70950852-9b97af00-2016-11ea-9550-b6983ce664e2.png" />

Not very exciting yet, but check out that "Docs" tab on the far right:

<img src="https://user-images.githubusercontent.com/300/73311311-fce89b80-41da-11ea-9a7f-2ef6b8191052.png" />

It's the complete schema as defined by our SDL files! The Playground will ingest these definitions and give you autocomplete hints on the left to help you build queries from scratch. Try getting the IDs of all the posts in the database; type the query at the left and then click the "Play" button to execute:

<img src="https://user-images.githubusercontent.com/300/70951466-52e0f580-2018-11ea-91d6-5a5712858781.png" />

The GraphQL Playground is a great way to experiment with your API or troubleshoot when you come across a query or mutation that isn't behaving in the way you expect.

### Creating a Contact

Our GraphQL mutation is ready to go on the backend so all that's left is to invoke it on the frontend. Everything related to our form is in `ContactPage` so that's the logical place to put the mutation call. First we define the mutation as a constant that we call later (this can be defined outside of the component itself, right after the `import` statements):

```javascript
// web/src/pages/ContactPage/ContactPage.js

const CREATE_CONTACT = gql`
  mutation CreateContactMutation($input: ContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`
```

We reference the `createContact` mutation we defined in the Contacts SDL passing it an `input` object which will contain the actual name, email and message fields.

Next we'll call the `useMutation` hook provided by Apollo which will allow us to execute the mutation when we're ready (don't forget the `import` statement):

```javascript
// web/src/pages/ContactPage/ContactPage.js

import {
  Form,
  TextField,
  TextAreaField,
  Submit,
  FieldError,
  Label,
} from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'
import BlogLayout from 'src/layouts/BlogLayout'

const ContactPage = (props) => {
  const [create] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) {
    console.log(data)
  }

  return (...)
}
```

`create` is a function that invokes the mutation and takes an object with a `variables` key, containing another object with an `input` key. As an example, we could call it like:

```javascript
create({
  variables: {
    input: {
      name: 'Rob',
      email: 'rob@redwoodjs.com',
      message: 'I love Redwood!',
    },
  },
})
```

If you'll recall `<Form>` gives us all of the fields in a nice object where the key is the name of the field, which means the `data` object we're receiving in `onSubmit` is already in the proper format that we need for the `input`!

Now we can update the `onSubmit` function to invoke the mutation with the data it receives:

```javascript
// web/src/pages/ContactPage/ContactPage.js

const ContactPage = (props) => {
  const [create] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    create({ variables: { input: data }})
    console.log(data)
  }

  return (...)
}
```

Try filling out the form and submitting—you should have a new Contact in the database! You can verify that with the GraphQL Playground if you were so inclined:

![image](https://user-images.githubusercontent.com/300/76250632-ed5d6900-6202-11ea-94ce-bd88e3a11ade.png)

### Improving the Contact Form

Our contact form works but it has a couple of issues at the moment:

- Clicking the submit button multiple times will result in multiple submits
- The user has no idea if their submission was successful
- If an error was to occur on the server, we have no way of notifying the user

Let's address these issues.

The `useMutation` hook returns a couple more elements along with the function to invoke it. We can destructure these as the second element in the array that's returned. The two we care about are `loading` and `error`:

```javascript
// web/src/pages/ContactPage/ContactPage.js

const ContactPage = (props) => {
  const [create, { loading, error }] = useMutation(CREATE_CONTACT)

  const onSubmit = (data) => {
    create({ variables: { input: data } })
    console.log(data)
  }

  return (...)
}
```

Now we know if the database call is still in progress by looking at `loading`. An easy fix for our multiple submit issue would be to disable the submit button if the response is still in progress. We can set the `disabled` attribute on the "Save" button to the value of `loading`:

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  // ...
  <Submit style={{ display: 'block' }} disabled={loading}>
    Save
  </Submit>
  // ...
)
```

It may be hard to see a difference in development because the submit is so fast, but you could enable network throttling via the Network tab Chrome's Web Inspector to simulate a slow connection:

<img src="https://user-images.githubusercontent.com/300/71037869-6dc56f80-20d5-11ea-8b26-3dadb8a1ed86.png" />

You'll see that the "Save" button become disabled for a second or two while waiting for the response.

Next let's let the user know their submission was successful. `useMutation` can accept a second argument containing an options object. One of those options is a callback function that will be invoked when the mutation completes called `onCompleted`. We'll use that callback to notify the user via a simple alert box:

```javascript
// web/src/pages/ContactPage/ContactPage.js

const [create, { loading, error }] = useMutation(CREATE_CONTACT, {
  onCompleted: () => {
    alert('Thank you for your submission!')
  },
})
```

### Displaying Server Errors

Next we'll inform the user of any server errors. So far we've only notified the user of _client_ errors: a field was missing or formatted incorrectly. But if we have server-side constraints in place `<Form>` can't know about those, but we still need to let the user know something went wrong.

We have email validation on the client, but any good developer knows [_never trust the client_](https://www.codebyamir.com/blog/never-trust-data-from-the-browser). Let's add the email validation on the API as well to be sure no bad data gets into our database, even if someone somehow bypassed our client-side validation.

> Why don't we need server-side validation for the existence of name, email and message? Because the database is doing that for us. Remember the `String!` in our SDL definition? That adds a constraint in the database the the field cannot be `null`. If a `null` was to get all the way down to the database it would reject the insert/update and GraphQL would throw an error back to us on the client.
>
> There's no `Email!` datatype so we'll need to validate that on our own.

We talked about business logic belonging in our services files and this is a perfect example. Let's add a `validate` function to our `contacts` service:

```javascript
// api/src/services/contacts/contacts.js

import { UserInputError } from '@redwoodjs/api'

const validate = (input) => {
  if (input.email && !input.email.match(/[^@]+@[^\.]+\..+/)) {
    throw new UserInputError("Can't create new contact", {
      messages: {
        email: ['is not formatted like an email address'],
      },
    })
  }
}

export const contacts = () => {
  return db.contact.findMany()
}

export const createContact = ({ input }) => {
  validate(input)
  return db.contact.create({ data: input })
}
```

So when `createContact` is called it will first validate the inputs and only if no errors are thrown will it continue to actually create the record in the database.

We already capture any existing error in the `error` constant that we got from `useMutation`, so we _could_ manually display an error box on the page somewhere containing those errors, maybe at the top of the form:

```javascript
// web/src/pages/ContactPage/ContactPage.js

<Form onSubmit={onSubmit} validation={{ mode: 'onBlur' }}>
  {error && (
    <div style={{ color: 'red' }}>
      {"We couldn't send your message: "}
      {error.message}
    </div>
  )}
  // ...
```

To get a server error to fire, let's remove the email format validation so that the client-side error is shown:

```javascript
// web/src/pages/ContactPage/ContactPage.js

<TextField
  name="email"
  style={{ display: 'block' }}
  errorStyle={{ display: 'block', borderColor: 'red' }}
  validation={{
    required: true,
  }}
/>
```

Now try filling out the form with an invalid email address:

<img src="https://user-images.githubusercontent.com/300/73316723-b601a280-41e8-11ea-8ed1-e3799821caa1.png" />

It ain't pretty, but it works. Seeing a "GraphQL error" is not ideal, and it would be nice if the field itself was highlighted like it was when the inline validation was in place...

Remember when we said that `<Form>` had one more trick up its sleeve? Here it comes!

Remove the inline error display we just added (`{ error && ...}`) and replace it with `<FormError>`, passing the `error` constant we got from `useMutation` and a little bit of styling to `wrapperStyle` (don't forget the `import`). We'll also pass `error` to `<Form>` so it can setup a context:

```javascript
// web/src/pages/ContactPage/ContactPage.js

import {
  Form,
  TextField,
  TextAreaField,
  Submit,
  FieldError,
  Label,
  FormError,
} from '@redwoodjs/web'

// ...

return (
  <BlogLayout>
    <Form onSubmit={onSubmit} validation={{ mode: 'onBlur' }} error={error}>
      <FormError
        error={error}
        wrapperStyle={{ color: 'red', backgroundColor: 'lavenderblush' }}
      />
    //...
```

Now submit a message without a name:

<img src="https://user-images.githubusercontent.com/300/73317487-1b569300-41eb-11ea-9fae-a9a7ae3c52f1.png" />

We get that error message at the top saying something went wrong in plain english _and_ the actual field is highlighted for us, just like the inline validation! The message at the top may be overkill for such a short form, but it can be key if a form is multiple screens long; the user gets a summary of what went wrong all in one place and they don't have to resort to hunting through a long form looking for red boxes. You don't have to have use that message box at the top, though; just remove `<FormError>` and the field will still be highlighted as expected.

> `<FormError>` has several styling options which are attached to different parts of the message:
>
> - `wrapperStyle` / `wrapperClassName`: the container for the entire message
> - `titleStyle` / `titleClassName`: the "Can't create new contact" title
> - `listStyle` / `listClassName`: the `<ul>` that contains the list of errors
> - `listItemStyle` / `listItemClassName`: each individual `<li>` around each error

### One more thing...

Since we're not redirecting after the form submits we should at least clear out the form fields. This requires we get access to a `reset()` function that's part of `react-hook-form` but we don't have access to it when using the simplest usage of `<Form>` (like we're currently using).

`react-hook-form` has a hook called `useForm()` which is normally called for us within `<Form>`. In order to reset the form we need to invoke that hook ourselves. But the functionality that `useForm()` provides still needs to be used in `Form`. Here's how we do that.

First we'll import `useForm`:

```javascript
// web/src/pages/ContactPage/ContactPage.js

import { useForm } from 'react-hook-form'
```

And now call it inside of our component:

```javascript
// web/src/pages/ContactPage/ContactPage.js

const ContactPage = (props) => {
  const formMethods = useForm()
  //...
```

Finally we'll tell `<Form>` to use the `formMethods` we just instantiated instead of doing it itself:

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  <BlogLayout>
    <Form
      onSubmit={onSubmit}
      validation={{ mode: 'onBlur' }}
      error={error}
      formMethods={formMethods}
    >
    // ...
```

Now we can call `reset()` on `formMethods` after the alert box is shown:

```javascript
// web/src/pages/ContactPage/ContactPage.js

return (
  const [create, { loading, error }] = useMutation(CREATE_CONTACT, {
    onCompleted: () => {
      alert('Thank you for your submission!')
      formMethods.reset()
    },
  })
```

> You can put the email validation back into the `<TextField>` now, but you should leave the server validation in place, just in case.

That's it! [React Hook Form](https://react-hook-form.com/) provides a bunch of [functionality](https://react-hook-form.com/api) that `<Form>` doesn't expose. When you want to get to that functionality you can: just call `useForm()` yourself but make sure to pass the returned object (we called it `formMethods`) as a prop to `<Form>` so that the validation and other functionality keeps working.

The public site is looking pretty good. How about the administrative features that let us create and edit posts? We should move them to some kind of admin section and put them behind a login so that random users poking around at URLs can't create ads for discount pharmaceuticals.

## Administration

Having the admin screens at `/admin` is a reasonable thing to do. Let's update the routes to make that happen by updating the four routes starting with `/posts` to start with `/admin/posts` instead:

```javascript
// web/src/Routes.js

<Route path="/admin/posts" page={PostsPage} name="posts" />
<Route path="/admin/posts/{id:Int}" page={PostPage} name="post" />
<Route path="/admin/posts/new" page={NewPostPage} name="newPost" />
<Route path="/admin/posts/{id:Int}/edit" page={EditPostPage} name="editPost" />
```

Head to http://localhost:8910/admin/posts and our generated scaffold page should come up. Thanks to named routes we don't have to update any of the `<Link>`s that were generated by the scaffolds since the `name`s of the pages didn't change!

How about getting this thing out into the real world?

## Deployment

The whole reason we started building Redwood was to make full-stack web apps easier to build and deploy on the JAMstack. You've seen what building a Redwood app is like, how about we try deploying one?

Before we continue, make sure your app is fully committed and pushed to GitHub, GitLab, or Bitbucket. We're going to link Netlify directly to our git repo so that a simple push to `master` will re-deploy our site. If you haven't worked on the JAMstack yet you're in for a pleasant surprise!

### The Database

We'll need a database somewhere on the internet to store our data. Locally we've been using SQLite but that's meant to be a single-user, disc-based store and isn't suited for the kind of connection and concurrency requirements a real, live website will require. For this tutorial we're going to use Postgres. Don't worry if you aren't familiar with Postgres, Prisma will do all the heavy lifting, we just need to get one available to the outside world so it can be accessed by our app.

> For now, you need to set up your own database, but we are working with various infrastructure providers to make this process simpler and more JAMstacky. Stay tuned for improvements in that regard!

There are several hosting providers where you can quickly start up a Postgres instance:

- [Heroku](https://www.heroku.com/postgres)
- [Digital Ocean](https://www.digitalocean.com/products/managed-databases)
- [AWS](https://aws.amazon.com/rds/postgresql/)

We're going to go with Heroku for now because it's a) free and b) easier to get started from scratch than AWS.

Head over to [Heroku](https://signup.heroku.com/) and create an account or log in. Then click that **Create a new app** button:

<img alt="Screen Shot 2020-02-03 at 3 22 36 PM" src="https://user-images.githubusercontent.com/300/73703866-438c3900-46a6-11ea-9a90-bdab2fed8bff.png">

Give it a name like "redwoodblog" if it's available. Go to the **Resources** tab and then click **Find more add-ons** in the **Add-ons** section:

<img alt="Screen Shot 2020-02-03 at 3 23 25 PM" src="https://user-images.githubusercontent.com/300/73703877-4e46ce00-46a6-11ea-87c0-079346f4d9b3.png">

And scroll down to **Heroku Postgres**:

<img alt="Screen Shot 2020-02-03 at 3 23 48 PM" src="https://user-images.githubusercontent.com/300/73703883-556ddc00-46a6-11ea-8777-ee27d2202e0e.png">

Click that and then on the detail page that comes up click the **Install Heroku Postgres** button that top right. On the next screen tell it you want to connect it to the app you just created, then click **Provision add-on**:

<img alt="Screen Shot 2020-02-03 at 3 24 15 PM" src="https://user-images.githubusercontent.com/300/73703930-64548e80-46a6-11ea-9f1b-e06a183834f4.png">

You'll be returned to your app's detail page. You should be on the **Resources** tab and see the Heroku Postgres add-on ready to go:

<img alt="Screen Shot 2020-02-03 at 3 24 43 PM" src="https://user-images.githubusercontent.com/300/73703951-6ae30600-46a6-11ea-8d9b-a900b7af2ac5.png">

Click the **Heroku Postgres** link to get to the detail page, then the **Settings** tab and finally the **View Credentials...** button. We did all the steps above so that we could copy the URI listed at the bottom:

<img alt="Screen Shot 2020-02-03 at 3 25 31 PM" src="https://user-images.githubusercontent.com/300/73703956-70405080-46a6-11ea-81f2-bed99ca4c4cc.png">

It will be really long and scroll off the right side of the page so make sure you copy the whole thing!

### Netlify

Now we're going to [create a Netlify account](https://app.netlify.com/signup) if you don't have one already. Once you've signed up and verified your email done just click the **New site from Git** button at the upper right:

<img src="https://user-images.githubusercontent.com/300/73697486-85f84a80-4693-11ea-922f-0f134a3e9031.png" />

Now just authorize Netlify to connect to your git hosting provider and find your repo. When the deploy settings come up you can leave everything as the defaults and click **Deploy site**.

Netlify will start building your app (click the **Deploying your site** link to watch the logs) and it will say "Site is live", but nothing will work. Why? We haven't told it where to find our database yet.

Go back to the main site page and then to **Settings** at the top, and then **Build & Deploy** > **Environment**. Click **Edit Variables** and this is where we'll paste the database connection URI we got from Heroku (note the **Key** is "DATABASE_URL"):

<img src="https://user-images.githubusercontent.com/300/73705038-9e735f80-46a9-11ea-9f38-17c15c2afe9a.png" />

Click **Save** and you should see the new variable listed:

<img src="https://user-images.githubusercontent.com/300/73704961-77b52900-46a9-11ea-98f9-7150a7ddf572.png" />

Go to **Build & Deploy** > **Continuous Deployment** and scroll down to **Build image selection**. Make sure that Ubuntu Xenial is selected. If not click **Edit settings** and change it.

![image](https://user-images.githubusercontent.com/300/75920758-d68ad100-5e14-11ea-94cd-606d8e7ca38f.png)

The last thing we need to do on Netlify is to enable the beta build process. Eventually this new build process will be the default for new sites but for now we need to manually enable it. Head to http://build-beta.netlify.com and login with your Netlify credentials, then find your site:

![image](https://user-images.githubusercontent.com/300/76029473-68fca480-5ee9-11ea-9a64-badb57b665e7.png)

Click the **Enable Beta Build for this site** button and you should get a popup window saying it's been added:

![image](https://user-images.githubusercontent.com/300/76029602-a95c2280-5ee9-11ea-9bb7-c86b48611e4c.png)

We'd like to say you can click **Click here to trigger a new build**, but we can't. We need to do one more thing.

### A Temporary Fix

There's one change we need to make in our code. This is a temporary fix as Prisma works on a feature on their side. We need to change the DB provider in our codebase from "sqlite" to "postgresql" and commit that change. That will let the site build properly on Netlify, but now local dev will be broken (we're not using Postgres locally). Once Prisma fixes this issue we can remove this section of the tutorial, but for now we need it.

What does this mean for local development? You have two options:

1. Use Postgres locally. Get your local connection string and add it to `.env` and now you'll be using Postgres in development and production.
2. Change the provider back to `sqlite` when developing locally, but make sure not to commit that change or production will break.

We know this isn't an ideal solution but it's only temporary, promise!

Open up `api/prisma/schema.prisma` and change the provider:

```prisma
// api/prisma/schema.prisma

datasource DS {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
```

Save that change and commit it. When you push `master` to your origin it will trigger a deploy automatically. With a little luck (and SCIENCE) it will complete successfully! You can click the **Preview** button at the top of the deploy log page, or go back and click the URL of your Netlify site towards the top:

![Netlify URL](https://user-images.githubusercontent.com/300/73705247-32ddc200-46aa-11ea-833e-3d2b35dc136f.png)

Did it work? If you see "Empty" under the About and Contact links then it did! Yay! You're seeing "Empty" because you don't have any posts in your brand new production database so head to `/admin/posts` and create a couple, then go back to the homepage to see them.

> If you view a deploy via the **Preview** button notice that the URL contains a hash of the latest commit. Netlify will create one of these for every push to master but will only ever show this exact commit, so if you deploy again and refresh you won't see any changes. The real URL for your site (the one you get from your site's homepage in Netlify) will show the latest deploy. See [branch deploys](#branch-deploys) below for more info.

If the deploy failed, check the log output in Netlify and see if you can make sense of the error. If the deploy was successful but the site doesn't come up, try opening the web inspector and look for errors. Are you sure you pasted the entire Postgres connection string correctly? If you're really, really stuck head over to the [Redwood Community](https://community.redwoodjs.com) and ask for help.

### Branch Deploys

Another neat feature of Netlify is _Branch Deploys_. When you create a branch and push it up to your repo, Netlify will build that branch at a unique URL so that you can test your changes, leaving the main site alone. Once your branch is merged to `master` then a deploy at your main site will run and your changes will show to the world. To enable Branch Deploys go to **Settings** > **Continuous Deployment** and under the **Deploy contexts** section click **Edit settings** and change **Branch deploys** to "All". You can also enable _Deploy previews_ which will create them for any pull requests against your repo.

![image](https://user-images.githubusercontent.com/300/76029913-369f7700-5eea-11ea-88f5-e6b2b282453f.png)

> You also have the ability to "lock" the `master` branch so that deploys do not automatically occur on every push—you need to manually tell Netlify to deploy the latest, either by going to the site or using the [Netlify CLI](https://cli.netlify.com/).

### A Note About DB Connections

In this tutorial, your lambda functions will be connecting directly to the Postgres database. Because Postgres has a limited number of concurrent connections it will accept, this does not scale very well. The proper solution is to put a connection pooling service in front of Postgres and connect to that from your lambda functions. We are working on making this process much easier, but keep it in mind before you deploy a Redwood app to production and announce it to the world.

## Wrapping Up

What did you think of Redwood? Is it the Next Step for JS frameworks? What can it do better? We've got a lot more planned. Some of the features on our TODO list:

- Storybook integration
- Refine Jest integration
- Helpers for Authentication with [Auth0](https://auth0.com/) and [Netlify Identity](https://docs.netlify.com/visitor-access/identity/)
- Pre-render and CDN-deliver specific routes
- Support for NoSQL solutions like MongoDB
- First class TypeScript support
- Data fetching optimization for waterfall problem with GraphQL
- GraphQL query cache helpers
- Accessibility features for Redwood Router
- Switcher widget providing quick access to the site and GraphQL playground while in dev mode
- Cookbook of recipies for integrating 3rd party APIs
- A way to inspect logs from AWS Lambda

Want to help us build those features, and a lot more?

- [Open a PR](https://github.com/redwoodjs/redwood/pulls)
- [Write some docs](https://redwoodjs.com/docs/introduction)
- [Join the community](https://community.redwoodjs.com)

Thanks for following along. Now go out and build something amazing!
