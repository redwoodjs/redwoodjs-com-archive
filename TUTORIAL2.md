# Welcome to Redwood, Part II: Redwood's Revenge

Part 1 of the tutorial was a huge success! It introduced hundreds (maybe thousands?)
of developers to what Redwood could do to make web development in the Javascript
ecosystem a delight. But that was just the beginning.

If you read the README [closely](https://github.com/redwoodjs/redwood#technologies)
you may have seen a few technologies that we didn't
touch on at all in the first tutorial: Storybook and Jest. In reality, these
have been core to the very idea of Redwood from the beginning—an improvement to the
entire experience of developing a web application.

While they're totally optional, we believe using these two tools will greatly
improve your development experience, making your applications easier to develop,
easier to maintain, and easier to share with a larger team. In this second tutorial
we're going to show you how.

Oh, and while we're at we'll introduce Role-based Authorization Control (RBAC),
which wasn't available when we wrote the first tutorial, but is now, and it's amazing.

## Prerequisites

We highly recommend going through the first tutorial first, or at least have built
a slightly complex Redwood app on your own. You've hopefully got experience with:

* Authorization
* Cells
* GraphQL & SDLs
* Services

If you haven't been through the first tutorial, or maybe you went through it on an
older version of Redwood (before 0.19.0) you can clone this repo which contains
everything built in part 1 and also adds a little styling so it isn't quite so...ugly.
Don't get us wrong, what we built in part 1 had a great personality! We just gave it
some hipper clothes and a nice haircut. We used TailwindCSS to style things up and added
a `<div>` or two to give us some additional hooks to hang some styling.

    git clone https://github.com/redwoodjs/redwood-tutorial
    cd redwood-tutorial
    yarn install
    yarn rw db up
    yarn rw db seed
    yarn dev

That'll check out the repo, install all the dependencies, create your local database
and fill it with a few blog posts, and finally start up the dev server. Your browser
should open to a fresh new blog app:

![image](https://user-images.githubusercontent.com/300/95521547-a5f8b000-097e-11eb-911c-5fde4bed6d97.png)

## Introduction to Storybook

Let's see what this Storybook thing is all about. Run this command to start up the Storybook server:

    yarn rw storybook

After some compling you should get a message saying that Storybook has started and it's
available at http://localhost:7910

![image](https://user-images.githubusercontent.com/300/95522673-8f078d00-0981-11eb-9551-0a211c726802.png)

If you poke around at the file tree on the left you'll see all of the components, cells,
layouts and pages we created during the tutorial. Where did they come from? You may recall
that everytime we generated a new page/cell/component we actaully created at least *three* files:

* BlogPost.js
* BlogPost.stories.js
* BlogPost.test.js

> If you generated a cell then you also got a `.mock.js` file (more on those later).

Those `.stories.js` files are what makes the tree on the left side of the Storybook browser
possible! From their homepage, Storybook describes itself as:

*"Storybook is an open source tool for developing UI components in isolation for React, Vue, Angular, and more. It makes building stunning UIs organized and efficient."*

So, the idea here is that you can build out your components/cells/pages in isolation, get them
looking the way you want, then plug them into your full application.

When Storybook opened it should have opened Components > BlogPost > Generated which is the
generated component we created to display a single blog post. If you open `web/src/components/BlogPost/BlogPost.stories.js` you'll see what it takes to explain this component to Storybook, and it isn't much:

```javascript
import BlogPost from './BlogPost'

export const generated = () => {
  return (
    <BlogPost
      post={{
        id: 1,
        title: 'First Post',
        body: 'Neutra tacos hot chicken prism raw denim...',
      }}
    />
  )
}

export default { title: 'Components/BlogPost' }
```

You import the component you want to use and then all of the named exports in the file will be
a single "story" as displayed in Storybook. In this case the generator named it "generated"
which shows as the "Generated" story in the tree view:

```terminal
Components
└── BlogPost
    └── Generated
```

This makes it easy to create variants of your component and have them all displayed together.
For example, let's say that on our homepage we only want to show the first couple of sentences
in our blog post and you'll have to click through to see the full post.

First let's update the `BlogPost` component to contain that functionality:

```javascript{5-7,9,18}
// web/src/components/BlogPost/BlogPost.js

import { Link, routes } from '@redwoodjs/router'

const truncate = (text, length) => {
  return text.substring(0, length) + '...'
}

const BlogPost = ({ post, summary = false }) => {
  return (
    <article className="mt-10">
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.blogPost({ id: post.id })}>{post.title}</Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        {summary ? truncate(post.body, 100) : post.body}
      </div>
    </article>
  )
}

export default BlogPost
```

We'll pass an additional `summary` prop to the component to let it know if should show
just the summary or the whole thing. We default it to `false` to preserve the existing
behavior (always showing the full body).

Now in the story, let's create a `summary` story that uses `BlogPost` the same way that
`generated` does, but adds the new prop. We'll take the content of the sample post and
put that in a constant that both stories will use. We'll also rename `generated` to
`full` to make it clear what's different between the two:

```javascript
import BlogPost from './BlogPost'

const POST = {
  id: 1,
  title: 'First Post',
  body: `Neutra tacos hot chicken prism raw denim, put a bird on it enamel pin
         post-ironic vape cred DIY. Street art next level umami squid. Hammock
         hexagon glossier 8-bit banjo. Neutra la croix mixtape echo park four
         loko semiotics kitsch forage chambray. Semiotics salvia selfies jianbing
         hella shaman. Letterpress helvetica vaporware cronut, shaman butcher
         YOLO poke fixie hoodie gentrify woke heirloom.`,
}

export const full = () => {
  return <BlogPost post={POST} />
}

export const summary = () => {
  return <BlogPost post={POST} summary={true} />
}

export default { title: 'Components/BlogPost' }
```

As soon as you save the change the stories Storybook should refresh and show the updates:

![image](https://user-images.githubusercontent.com/300/95523957-ed823a80-0984-11eb-9572-31f1c249cb6b.png)

Great! Now to complete the picture let's use the summary in our home page display of blog posts.
The actual Home page isn't what references the `BlogPost` component though, that's in the
`BlogPostsCell`. We'll add the summary prop and then check the result in Storybook:

```javascript{26}
// web/src/components/BlogPostsCell/BlogPostsCell.js

import BlogPost from 'src/components/BlogPost'

export const QUERY = gql`
  query BlogPostsQuery {
    posts {
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

export const Success = ({ posts }) => {
  return (
    <div className="-mt-12">
      {posts.map((post) => (
        <BlogPost key={post.id} post={post} summary={true} />
      ))}
    </div>
  )
}
```

![image](https://user-images.githubusercontent.com/300/95525432-f4ab4780-0988-11eb-9e9b-8df6641452ec.png)

Storybook makes it easy to create your components in isolation and actually helps
enforce a general best practice when building React applications: components should
be self-contained and reusable by just changing the props that are sent in.

## Building Components with Storybook

What's our blog missing? Comments. Let's add a simple comment engine so people can leave
their completely rational, well-reasoned comments on our blog posts. It's the Internet,
what could go wrong?
