## Authentication

"Authentication" is a blanket term for all of the stuff that goes into making sure that a user, often identified with an email address and password, is allowed to access something. Authentication can be [famously fickle](https://www.rdegges.com/2017/authentication-still-sucks/) to do right both from a technical standpoint and developer happiness standpoint.

But you know Redwood has your back! It will soon ship with integrations to several popular authentication services. Login isn't something you should have to write from scratch—it's a solved problem and is one less thing we should have to worry about. We will include integrations to:

- [Auth0](https://auth0.com/)
- [Netlify Identity](https://docs.netlify.com/visitor-access/identity/)

We're going to demo a Netlify Identity integration in this tutorial, although Redwood's auth helpers aren't quite ready yet as of v0.1. For now we're going to do the "hard" way, although thanks to the work Netlify has put into Netlify Identity it will actually be much easier than you're probably expecting.

In order to do that we need to get our site deployed to [Netlify](https://netlify.com). Netlify is a one-stop shop for getting on the JAMstack—continuous deployment, serverless functions, a globally distributed CDN serving all of your assets, and a lot more.

Create an account at Netlify and verify your email. Then we'll return to the command line.

### Netlify CLI Tools

In order to use Identity we'll use Netlify's CLI tools to simulate the same stack locally as used by Netlify in the real world. First we need to install them:

    yarn global add netlify-cli

And then login with the credentials you used to create your Netlify account:

    netlify login

Next we'll link our app in dev to the actual site ID in Netlify:

    netlify link

When prompted **How do you want to link this folder to a site?** select the first option, **Use current git remote origin**. Once the command completes you will have a new directory in the root of your app `/.netlify` that contains a single file `state.json` that contains the ID of your site. Now the Netlify CLI tools know which site you're working with when you enter commands.

### Enable Identity

Back on netlify.com click on the **Identity** tab for your site and then the **Enable Identity** button:

![Netlify Screenshot](https://user-images.githubusercontent.com/300/67904407-854b9780-fb2b-11e9-940e-ddf2c7a36a47.png)

Now copy and paste the API endpoint protocol and domain from the URL that's displayed once the screen refreshes:

![Netlify Identity URL](https://user-images.githubusercontent.com/300/67904521-d196d780-fb2b-11e9-9f17-f2f668d1d29e.png)

For the remainder of the tutorial we're going to run the site in dev mode using Netlify's CLI instead of Redwood's. This gives us the identity functionality we need. But before you do that, make sure the `provider` in `api/prisma/schema.prisma` is set back to `sqlite`:

```prisma
// api/prisma/schema.prisma

datasource DS {
  provider = "sqlite"
  url = env("DATABASE_URL")
}
```

Now hit `Ctrl-C` to exit out of `yarn redwood dev` and start Netlify's dev mode instead:

    netlify dev

Netlify runs our site at http://localhost:8888 If you click around you should see the site behaving the same as before.

### Adding a Login Link

There are a few things we need to do to get ready for an authenticated user:

- Put logic somewhere that acts as a gatekeeper to pages we want to secure
  - Hide content if logged out
  - Show content if logged in
- Add UI for login fields (email and password)
- Login logic
- Logout logic
- Keep track of details for the logged in user (maybe show a "Welcome, [Name]" in the corner)

The first is figure out a place to put our authentication code so that it blocks access to all of our admin screens.
