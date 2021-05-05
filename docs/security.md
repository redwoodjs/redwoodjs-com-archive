# Security


> ⚠ **Work in Progress** ⚠️
>
> There's more to document here. In the meantime, you can check our [community forum](https://community.redwoodjs.com/search?q=security) for answers.
>
> Want to contribute? Redwood welcomes contributions and loves helping people become contributors.
> You can edit this doc [here](https://github.com/redwoodjs/redwoodjs.com/blob/main/docs/builds.md). 
> If you have any questions, just ask for help! We're active on the [forums](https://community.redwoodjs.com/c/contributing/9) and on [discord](https://discord.com/channels/679514959968993311/747258086569541703).



  <section class="md:flex mt-12 pt-12 border-t border-red-200">
    <div class="md:w-2/5 pr-4">
      <h3 class="text-lg font-semibold">How it's Organized</h3>
      <p class="my-2 text-sm">
        Redwood places both the frontend and backend code in a single monorepo.
      </p>
      <p class="my-2 text-sm">
        <code class="text-red-700 bg-red-200 py-half px-1 rounded text-xs">/web</code>
        contains the frontend and is served as static files through a CDN (and automatically code-split for you).
      </p>
      <p class="my-2 text-sm">
        <code class="text-red-700 bg-red-200 py-half px-1 rounded text-xs">/api</code>
        contains the backend serverless functions (a GraphQL API by default) that your frontend will call when it needs
        some dynamic data.
      </p>
    </div>
    <div class="md:w-3/5 md:pl-4 mt-4 mb-4 md:mt-0">
      <a href="/images/structure.png"><img src="/images/structure.png" alt="Structure of a Redwood app" /></a>
    </div>
  </section>


<p>Your web is typically deployed to a CDN (via Netlify Netlify Edge | Netlify, Vercel, Render, etc) which makes your React (JS) app available on global edge nodes for speedy download to your users’ devices/clients. That’s the bottom row in the above diagram.</p>

<p>The top row is where your api is deployed, which is often AWS or other infra via Netlify, Vercel, Render, or even your own serverful deploy on hardware you manage.</p>

<p>I might be in Boston, Buenos Aires, Budapest, Brazzaville, Baku, Beijing, or Billings and my device is going to pull down the parts of the React app is needs from the closes part of the CDN it can reach anywhere it might be.</p>

<p>Once that client starts talking to the api, though, it is talking to where the API is deployed and say I deployed to Netlify, it’s probably sitting on some AWS machines in northern Virginia USA waiting for requests to come in.</p>

<p>Now, the api is simply a set of <a href="https://redwoodjs.com/docs/serverless-functions.html">Serverless Functions</a> – or API endpoints out there in the cloud. It’s going to talk to anything that asks it a question, that is formed in a way it can understand – and that you allow it to. More often than not, your data and features are completely public. But, in many cases it isn’t.</p>

<p><b>This is where securing your API is important.</b> It’s going to be accessible – meaning pretty much any client can reach it, ie make an HTTP request … but that doesn’t mean it has to answer back or answer back nicely. If you don’t let it, it can return a 401 unauthorized (ok as we know GraphQL always responds with a 200 for some bizarro reason but it will also provide an error message).</p>

<p>It’s important to know that the RW GraphQL API is just a <a href="https://redwoodjs.com/docs/serverless-functions.html">Serverless Function</a>.</p>

<p><b>This is why it is important to use authentication</b> and require auth on the services and resolvers that are sensitive or should only be run by trusted actors. When you use Redwood auth, every GraphQL requests sends up in Authorization headers a Bearer access token that the API side will decode and can use to judge if some action or data is allowed by the user identified by that token.</p>

<p>These trusted actors can be authentication users (w/ or w/out roles and permissions). Or, these actors can be other systems like via Webhooks or even other apps using your API to enhance their experience.</p>

<p>So, TLDR; yes the api is accessible, but that’s to your app’s benefit however you need to be aware of what functions are open and limit their actions to trusted authorized actors.</p>

<p>Redwood will help you do this in a few ways:</p>

 * <b>Letting you know</b>. As you found, there is a message informing you of this – and as any American raised kid of the 80’s/90s knows knowing is half the battle.

 * <b>Auth</b>. Redwood supports 8 providers (with more coming) that offer top notch authentication that you can use on both web and api side to secure sensitive actions. See: https://redwood-playground-auth.netlify.app/
 
 * <b>Securing Services by default</b>. This will be in an upcoming release. See [Secure Services with beforeResolver by cannikin · Pull Request #2272 · redwoodjs/redwood · GitHub](https://community.redwoodjs.com/t/implications-of-this-add-generator-message-with-info-on-how-to-secure-a-function/2061/3) and [RFC - Secure Services by default · Issue #1630 · redwoodjs/redwood · GitHub](https://github.com/redwoodjs/redwood/issues/1630).

 * <b>Webhooks</b> These will be released in v0.31 with documentation to come: [upcoming Webhooks Docs](https://redwoodjs.com/docs/webhooks.html). This lets you secure your functions when used by third parties or yourself via Zapier, deploy hooks, Cron jobs, notification hooks, etc. See: https://github.com/redwoodjs/redwood/pull/1843#issuecomment-824428164

 * <b>Logging</b> Having visibility into how your functions are used is key to keeping their secure. Logging <a href="https://redwoodjs.com/docs/serverless-functions.html">Serverless Function</a> output can help identify where requests originate and how often. That info can help spot any anomalies. Services like Datadog, LogDNA, LogFlare all can setup alerts based on log info to notify you if about usage or request IP addresses or other access issues. See: [Docs - Logger : RedwoodJS Docs](https://redwoodjs.com/docs/logger)

<p>Hope this helps and again – making it accessible is a good, even great, even amazing thing – you just need, as with anything you build, to make sure you keep sensitive data or actions behind something that checks if they are trusted.</p>


## Contributing

If you are interested in contributing to the Redwood Auth Package, please [start here](https://github.com/redwoodjs/redwood/blob/main/packages/auth/README.md).
