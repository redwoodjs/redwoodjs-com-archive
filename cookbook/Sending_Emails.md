# Newsletter

A common task many web apps need to do is to send emails. To demonstrate how this can be done with Redwood we're going to build a form that lets a user sign up for a newsletter. When doing so we'll send them a "welcome" email. The emails will be sent using the npm package [nodemailer](https://www.npmjs.com/package/nodemailer) together with [SendInBlue](https://sendinblue.com).

This is what it will look like when it's done.

![rw-newsletter-done.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1642405365475/wU7e3Fav6.png)

## Setup

The first thing to do is to create a new RedwoodJS project.

```zsh
yarn create redwood-app --typescript newsletter
```

When that's done, go into the `newsletter` directory and we'll install the `nodemailer` package.

```zsh
yarn workspace api add nodemailer
```

### DB design

Now, fire up your editor of choice, find the `schema.prisma` file and remove the example model. Replace it with this

```sdl
model NewsletterSubscriber {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt
  email     String   @unique
}
```

Technically all we really need is the email address. But personally I have never regretted having an id, and the two timestamps in my models. But I _have_ regretted _not_ having them, having to go back to add them later. So now I always include them from the start. And we make the email unique, because we don't want the same email address subscribed twice to our newsletter.

Now we can go ahead and migrate our database and create the sdl and service needed to interact with the Prisma model using GraphQL.

```zsh
yarn rw prisma migrate dev --name newsletter_subscriber
```

### SDL

```zsh
yarn rw g sdl --crud NewsletterSubscriber
```

By default the sdl generator will only generate a single query for all data in the given model. But by passing the `--crud` option we tell it to generate all the standard CRUD queries and mutations. The one we're after is the one for creating new records in the database.

### Home page

The final thing we'll generate is our home page where we'll put the sign up form.

```zsh
yarn rw g page home /
```

## Adding a form

Replace the content of `HomePage.tsx` with this

```tsx
// HomePage.tsx

import { useState } from 'react'
import { EmailField, Form, Submit } from '@redwoodjs/forms'

const HomePage = () => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const onSubmit = (formData) => {
    console.log('onSubmit formData', formData)
    setIsSubscribed(true)
  }

  return (
    <Form onSubmit={onSubmit}>
      <h1>Newsletter</h1>
      <p>
        Sign up to our newsletter below to join the beta waiting list and be the
        first to know when we go live with our amazing product
      </p>
      <div className="form-fields">
        <EmailField
          name="email"
          placeholder="john.doe@email.com"
          disabled={isSubscribed}
        />
        <Submit disabled={isSubscribed}>Subscribe</Submit>
      </div>
      {isSubscribed && (
        <p>
          Thanks for signing up! You&apos;ll receive a welcome email shortly.
        </p>
      )}
    </Form>
  )
}

export default HomePage
```

And then you can put all of this in `index.css` to get some styling on your form

```css
/* index.css */

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: larger;
}

form {
  border: '1 px solid #333';
  border-radius: 7px;
  background: #2c092c;
  color: antiquewhite;
  width: 100%;
  max-width: 640px;
  padding: 1em;
}

h1 {
  text-align: center;
}

.form-fields {
  display: flex;
}

input[type='email'] {
  flex: 1;
  padding: 8px;
  margin-right: 8px;
  font-size: large;
}

button {
  padding: 8px 10px;
  font-size: large;
}
```

It's always fun to see something visual, so let's run the Redwood dev server to see what we've created so far.

```zsh
yarn rw dev
```

Now if you go to `http://localhost:8910` in your web browser and open up the developer console you should see a `console.log` message when you enter an email in your form. Try it out!

![rw-newsletter-console.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1642405536591/qbXOZwPUm.png)

So now we have a way for the user to enter his/hers email. Well done! Give yourself a pat on the back, stretch a bit, and then it's time for us to get that email address over to the api side.

## GraphQL mutation

To send the email to the api side so that it can be inserted into our database we'll use a GraphQL mutation.

Add this mutation query between the imports and the HomePage function.

```tsx
// HomePage.tsx

const ADD_NEWSLETTER_SUBSCRIBER = gql`
  mutation AddNewsletterSubscriber($input: CreateNewsletterSubscriberInput!) {
    createNewsletterSubscriber(input: $input) {
      id
    }
  }
`
```

Create a function called `addSubscriber` that calls the mutation by using the `useMutation` hook from `@redwoodjs/web`.

```tsx
// HomePage.tsx

// ...

const HomePage = () => {
  const [addSubscriber] = useMutation(ADD_NEWSLETTER_SUBSCRIBER)

  // ...
}
```

The mutation query takes an `$input` parameter of type `CreateNewsletterSubscriberInput`. Looking in the SDL file (`newsletterSubscribers.sdl.ts`) you can see that that type consists of only one parameter, `email`. As you saw in the web browser developer console earlier, we get the email inside the `formData` object in our `onSubmit` function. So let's wire it all together. (Can also get rid of the `console.log` as we don't need it anymore -- we know what we get now.)

```tsx
const onSubmit = (formData) => {
  addSubscriber({ variables: { input: { email: formData.email } } }).then(
    () => {
      setIsSubscribed(true)
    }
  )
}
```

So now when the form is submitted we will execute the gql mutation which will be picked up on the api side by the `newsletterSubscribers` service. Specifically the `createNewsletterSubscriber` function inside `newsletterSubscribers.ts`. But before we go any further I wanted to show the full `HomePage.tsx` component so that we're all still on the same page.

```tsx
import { useState } from 'react'
import { EmailField, Form, Submit } from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'

const ADD_NEWSLETTER_SUBSCRIBER = gql`
  mutation AddNewsletterSubscriber($input: CreateNewsletterSubscriberInput!) {
    createNewsletterSubscriber(input: $input) {
      id
    }
  }
`

const HomePage = () => {
  const [addSubscriber] = useMutation(ADD_NEWSLETTER_SUBSCRIBER)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const onSubmit = (formData) => {
    addSubscriber({ variables: { input: { email: formData.email } } }).then(
      () => {
        setIsSubscribed(true)
      }
    )
  }

  return (
    <Form onSubmit={onSubmit}>
      <h1>Newsletter</h1>
      <p>
        Sign up to our newsletter below to join the beta waiting list and be the
        first to know when we go live with our amazing product
      </p>
      <div className="form-fields">
        <EmailField
          name="email"
          placeholder="john.doe@email.com"
          disabled={isSubscribed}
        />
        <Submit disabled={isSubscribed}>Subscribe</Submit>
      </div>
      {isSubscribed && (
        <p>
          Thanks for signing up! You&apos;ll receive a welcome email shortly.
        </p>
      )}
    </Form>
  )
}

export default HomePage
```

## SendInBlue

To actually send an email you need a mail server that you can talk to using SMTP. `nodemailer` has a really simple example on their webpage that uses Ethereal. But that's only for test messages. The emails will never actually be delivered beyond Ethereal. Another option is to use your own GMail address (if you have one). But to get that working reliably you need to set up Oauth2, which isn't very straight forward. So your best bet here is actually to use a dedicated Cloud/SaaS solution. A lot of them have a free tier that lets you send enough emails for a low-volume newsletter. We'll be using SendInBlue that offers 300 free emails per day.

So go ahead and create an account with SendInBlue. They'll ask for an address and a phone number. They need it to prevent users from creating accounts to send spam emails from. When your account is created and set up you need to click on the menu in the upper right with your company name and select the "SMTP & API" option.

![sib-smtp-api.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1642405436724/qOhUvuGBs.png)

Then click on "SMTP"

![sib-smtp.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1642405474092/1JJ3ZvuK7.png)

Finally you need to generate a new SMTP key. Name it whatever you want, does't matter. You should get a dialog that looks like the screenshot below. Copy your key.

![sib-smtp-key.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1642405484911/8pLfO7S09.png)

Now switch to your code editor and open the `.env` file. At the bottom, on a new row, create a new environment variable called SEND_IN_BLUE_KEY. It should look like this, but with your unique key.

```
SEND_IN_BLUE_KEY=xsmtpsib-7fa6eb37c244429933ea870185063c493ba1c820f826c5f620877dd815392602-rZgB6GUV1CF2NLAK
```

That's it for SendInBlue. It's set up, and you have the key you need to send emails. If you have your dev server still running, you need to restart it for the new environment variable to be picked up.

## API side

The plan is to create the database record with the new subscriber. Then trigger the welcome email, and finally return the newly created db record back to the web side.

There already is some code in the `createNewsletterSubscriber` function that we'll need to split up. Actually sending the email will require some more setup, so let's just put a `console.log` in there for now. We'll replace that later with the emailing functionality.

```ts
// newsletterSubscribers.ts

// ...

export const createNewsletterSubscriber = async ({
  input,
}: CreateNewsletterSubscriberArgs) => {
  const subscriber = await db.newsletterSubscriber.create({
    data: input,
  })

  console.log('Send email to', subscriber)

  return subscriber
}

// ...
```

If you were to run your application at this point (`yarn rw dev`) and enter an email address in the form it'll be saved to your SQLite database. If you have a SQLite database browser you can hook it up and see for yourself 😀

### Sending an email

Now, finally, let's write the function that'll fire off the email. On the api side, in the `lib` folder, create a new file named `email.ts`. Paste this code in the file

```ts
// email.ts

import * as nodemailer from 'nodemailer'

interface Options {
  to: string | string[]
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: Options) {
  console.log('Sending email to:', to)

  // create reusable transporter object using SendInBlue for SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'your@email.com',
      pass: process.env.SEND_IN_BLUE_KEY,
    },
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Your Name" <your@email.com>',
    to: Array.isArray(to) ? to : [to], // list of receivers
    subject, // Subject line
    text, // plain text body
    html, // html body
  })

  console.log('Message sent: %s', info.messageId)

  return info
}
```

In the code above you should replace "your@email.com" in two places with the email you used when signing up for SendInBlue. You can also change the name used for "From:".

Now let's go back to the service and add the missing pieces there. At the top, add this import

```ts
// newsletterSubscribers.ts

// ...

import { sendEmail } from 'src/lib/email'`

// ...
```

Then paste this function somewhere in the file

```ts
// newsletterSubscribers.ts

// ...

function sendConfirmationEmail(emailAddress: string) {
  const subject = 'Awesome Company newsletter subscription confirmation'

  const text =
    'Thank you for subscribing to our newsletter.\n\n' +
    'You can expect to get a newsletter approximately once every other month'

  const html =
    'Thank you for subscribing to our newsletter.<br><br>' +
    'You can expect to get a newsletter approximately once every other month'

  return sendEmail({ to: emailAddress, subject, text, html })
}

// ...
```

Finally, replace the `console.log` we left earlier with this code

```ts
// newsletterSubscribers.ts

// ...

await sendConfirmationEmail(subscriber.email)

// ...
```

For some cleanup, since we're not using it, I'm removing the update and delete functions from the service. Also removing the function that lets you get a single subscriber using the id. This is what we should be left with

```ts
// newsletterSubscribers.ts

import type { Prisma } from '@prisma/client'

import { db } from 'src/lib/db'
import { sendEmail } from 'src/lib/email'

export const newsletterSubscribers = () => {
  return db.newsletterSubscriber.findMany()
}

function sendConfirmationEmail(emailAddress: string) {
  const subject = 'Awesome Company newsletter subscription confirmation'

  const text =
    'Thank you for subscribing to our newsletter.\n\n' +
    'You can expect to get a newsletter approximately once every other month'

  const html =
    'Thank you for subscribing to our newsletter.<br><br>' +
    'You can expect to get a newsletter approximately once every other month'

  return sendEmail({ to: emailAddress, subject, text, html })
}

interface CreateNewsletterSubscriberArgs {
  input: Prisma.NewsletterSubscriberCreateInput
}

export const createNewsletterSubscriber = async ({
  input,
}: CreateNewsletterSubscriberArgs) => {
  const subscriber = await db.newsletterSubscriber.create({
    data: input,
  })

  await sendConfirmationEmail(subscriber.email)

  return subscriber
}
```

## Wrap up

This should be it for the limited scope of this project. We started by creating a fresh Redwood project. We decided what our database model should look like. Then we designed a simple form on the front-end. We generated and adapted the code needed to use GraphQL to communicate with our backend api. After creating an account with SendInBlue and getting our SMTP key we built out our backend. The two main things we did was create an email library function and updated the newsletterSubscriber service to use it.

### Further improvements

To be a good Netizen we should add an "Unsubscribe" link to all outgoing newsletter emails, even the initial confirmation email. The initial email should also be a proper confirmation email where the user needs to click a link/button to confirm their email and that they actually do want to subscribe to the newsletter. Failing to do these two things will make Google and other email providers upset, and so they might eventually send your emails to the Spam folder, or even block you.

Obviously we could also spend some more time on the design, especially the confirmation part in the gui when clicking on the Subscribe button.

Like all demo apps we're also missing error handling. What happens for example if you try to subscribe again with an already subscribed email address?

### Thanks for reading

Thanks for reading this! If you liked it, or have any questions, don't hesitate to reach out on [our forums](https://community.redwoodjs.com) or in our [Discord chat](https://discord.gg/jjSYEQd).
