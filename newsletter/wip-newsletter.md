## 1, May 25th, 2020

_Jamstack Conf (Virtual), `v0.7.0` lands, `@redwoodjs/auth` makes its debut, and a whole lot more!_

Hey,

Welcome to the first RedwoodJS newsletter! Here we'll summarize what's been happening in-and-around Redwood and what to look forward to. We'll also give a shoutout to some members of the community for their awesome contributions. We couldn't ask for a better community!

The `v0.7.0` release brings a lot to talk about: auth, another generator, an update to Prisma. And behind the scenes, the TypeScript effort has taken off! If you're interested, it's not too late to join&mdash;in fact, there's more than ever to do.

How do you debug your Redwood apps? console.log? A long walk? A `yarn rw dev inspect` command you hacked together? Tell us on our [forum](https://community.redwoodjs.com/t/request-for-interest-livestream-about-debugging-in-redwood/495), and don't miss Redwood's first live event!

Best, and stay safe,

The Redwood Core Team

<!-- Stories -->
<h2 id="section">Stories</h2>

### [Jamstack Conf Virtual 2020](https://jamstackconf.com/virtual/)

<span id="tag">jamstack</span> <span id="tag">conference</span>

Jamstack Conf is only days away! And it's not too late to register. Did we mention it's free? Best of all, our very own Tom Preston-Werner will be presenting a Redwood Lightning Launch. Click the link above to register now!

<!-- UK Timezone... 4:05pm on May 27th -->
<!-- (link to add it to the calendar or something?) --> 

### [RedwoodJS v0.7.0](https://github.com/redwoodjs/redwood/releases/tag/v0.7.0)
<span id="tag">redwoodjs</span> <span id="tag">v0.7.0</span>

`v0.7.0` is here! This release marks the debut of Redwood's Auth package. It ships with support for Netlify Identity Widget, Auth0, and Netlify GoTrue-JS. And it wouldn't be Redwood if it didn't include a generator to handle the boilerplate for you. 

Auth isn't all `v0.7.0` brings you&mdash;here's even more good stuff:

- There's a new generator in town: `function`, and a [Cookbook recipe](http://redwoodjs.com/cookbook/custom-function.html) to go with it
- The scaffold generator has a new option that lets you add 'path/' structure; just prefix the model with the path, like 'admin/post'
- There's new Form fields (too many to list!) and improvements to Redwood Forms
- Prisma gets an upgrade: `v2.0.0-beta.5`

A gigantic Thank You to all the amazing contributors who are making Redwood better every day. It's a blast to build this with you!

### [@redwoodjs/auth](https://github.com/redwoodjs/redwood/tree/master/packages/auth)
<span id="tag">auth</span>

You asked for it, we made it a priority, and now it's here! And we've got plenty of resources to get you started:

- Add auth to your RedwoodBlog with the brand new [Authentication](https://redwoodjs.com/tutorial/authentication) section in the Redwood Tutorial
- Check out the [Redwood Auth Guide](https://redwoodjs.com/guides/authentication) for all the details
- Learn to implement Netlify Auth via the [Redwood Example Blog](https://github.com/redwoodjs/example-blog) 
- Explore the Auth implementation in the [Example Invoice](https://github.com/redwoodjs/example-invoice) project
- Feeling lucky? Just dive in with `yarn rw g auth [netlify|auth0]`
- Want to contribute a new provider? It's [SuperEasy™](https://github.com/redwoodjs/redwood/tree/master/packages/auth#contributing)
 
Even though auth just came out, more's already in motion. We'll soon have Firebase ([#593](https://github.com/redwoodjs/redwood/pull/593)) and Magic.Link ([#562](https://github.com/redwoodjs/redwood/pull/562)). 

We love to see what you build&mdash;especially new ways of implementing and extendng auth. The [Show and Tell](https://community.redwoodjs.com/c/show-tell/7) category's the place to post. Come show us!

### [Function generator](https://redwoodjs.com/cookbook/custom-function)

<span id="tag">generator</span>

`v0.7.0` brings with it a Capital-F Function generator. You know, the ones that are meant to be deployed to serverless endpoints like AWS Lambda.

Why another generator you might ask? Quoting our generator-master Rob:

> You can create everything else with a generator, we should have one for making Functions, too!

Follow the Cookbook recipe and let Rob show you how to break some rules!

<!-- ### [SoftwareDaily: RedwoodJS with Tom Preston-Werner](https://softwareengineeringdaily.com/2020/05/22/redwoodjs-with-tom-preston-werner/)
<span id="poi">Tom Preston-Warner</span> <span id="tag">podcast</span>

Tom Preston-Werner joins SoftwareDaily to talk about the future of the Jamstack and his goals for RedwoodJS. -->

### [Prisma Day 2](https://www.prisma.io/day/)

<span id="tag">prisma</span> <span id="tag">conference</span>

Save the date: Prisma Day 2 is coming up on June 26th, 2020.

Prisma is an important part of Redwood and this is going to be a great conference to learn more about everything it can do to help you build killer apps. So click the link above and sign up! You can also check out [last year's prisma day](https://www.prisma.io/day-2019/).

<!-- (link to add it to the calendar or something?) -->

<!-- ### [Prisma 2 Demo by Nikolas Burk](https://www.youtube.com/watch?v=AnJxKWQG_fM)
<span id="poi">Nikolas Burk</span> <span id="tag">prisma</span> <span id="tag">demo</span>

Watch Prisma core-team member Nikolas Burk demo Prisma 2.0. -->

### [Awesome Redwood](https://github.com/redwoodjs/awesome-redwood)

<span id="tag">redwoodjs</span>

It's official: Redwood is awesome! The amazing Redwood community has already made so many awesome contributions. And now there's a way to organize and find them. See anything missing? PR away!

<!-- Around the Community -->
<h2 id="section">Around the <a href="https://community.redwoodjs.com" class="hover:underline">Community</a></h2>

### [Vida: Create compelling dashboards quickly](https://vida.io/)
<span id="poi">Phuoc Do</span> <span id="tag">built with redwood</tag>

Built with RedwoodJS, Vida turns JSON files into compelling dashboards&mdash;no coding required. They've also got a great blog post on [using the Monaco Editor with Redwood](https://blog.vida.io/2020-use-monaco-editor-in-redwoodjs/).

### [Testing in Redwood](https://community.redwoodjs.com/t/testing-in-redwood/482)
<span id="poi">Robert Broersma</span> <span id="tag">jest</span> <span id="tag">testing</span>

Testing's a major milestone on our roadmap. Things are in progress, especially on the web side, with Robert Broersma leading the way with [#521](https://github.com/redwoodjs/redwood/pull/521). Click the link to join the discusssion!

### [How to Use Theme-UI with RedwoodJS](https://community.redwoodjs.com/t/how-to-use-theme-ui-with-redwoodjs/589)
<span id="poi">Eric Howey</span> <span id="tag">theme-ui</span> <span id="tag">css</span>

Ever wanted to configure RedwoodJS with [Theme-UI](https://theme-ui.com/)? Eric Howey wrote a quick post that's got you covered&mdash;he even provided a TLDR: 

> Wrap your layout component in Redwood with the theme provider component from Theme-UI. 

How do you CSS? Come tell us [on our forum](https://community.redwoodjs.com/t/recommendations-for-integrating-a-css-library/305).

<!-- ### [Site Analytics for RedwoodJS](https://community.redwoodjs.com/t/site-analytics-for-redwoodjs/572/)
<span id="poi">Phuoc Do</span>, <span id="poi">Bennett Rogers</span> <span id="tag">site analytics</span>

Are you a site analytics wizard? Have we got the thread for you. -->

<!-- ### [Diving Into Authentication and User Management with RedwoodJS](https://www.twitch.tv/videos/628688914)
<span id="poi">Dominic Magnifico</span> <span id="tag">auth</span> <span id="tag">stream</span>

Dive into authentication and user management with RedwoodJS.  -->


<!-- ### [Learning RedwoodJS with boardgame logger project](https://community.redwoodjs.com/t/learning-redwoodjs-with-boardgame-logger-project/590)
<span id="poi">Liz</span> <span id="tag">tutorial</span>

And who doesn't love board games? -->

<!-- ### [How to create a User object in the db after a signup is verified in Netlify](https://community.redwoodjs.com/t/how-to-create-a-user-object-in-the-db-after-a-signup-is-verified-in-netlify/593)
<span id="poi">leoalbin</span> <span id="tag">auth</span>

Here's something you might've been wondering about... -->

<!-- ### [How to seed production database](https://community.redwoodjs.com/t/how-to-seed-production-database/592)
<span id="poi">Forrest Hayes</span> <span id="tag">db</span> <span id="tag">seed</span>

Seeding in prod. -->

<!-- ### [RedwoodJS - a full-stack JavaScript Framework with advantages of JAMstack architecture](https://www.youtube.com/watch?v=PXe4ki0Lsew)
https://twitter.com/redwoodjs/status/1264957404984246272
<span id="poi">Jana Bergant</span> <span id="tag">video</span>

Looking for a video review of Redwood? Jana Bergant's got you covered. Jana also wrote a [blog post](https://medium.com/javascript-in-plain-english/redwoodjs-full-stack-javascript-framework-with-a-developer-in-mind-dfa7d7a6d905). -->

<!-- ###[Thoughts on RedwoodJS](https://dev.to/zasuh_/thoughts-on-redwoodjs-4ki4)
<span id="poi">Žane Suhadolnik</span>
https://twitter.com/zasuh_/status/1264811001582583808

Zane writes down some of his thoughts on rwjs. Check out his thoughts esp. on Redwood's abstractions. -->

<!-- ### [RedwoodJS – My First Impressions](https://chivsjawn.wordpress.com/2020/05/22/redwoodjs-my-first-impressions/)
https://twitter.com/redwoodjs/status/1264209471284424705
<span id="poi">Chivs Jawn</span>

Read Chris's first impression. -->

<!-- Around the Repo -->
<h2 id="section">Around the <a href="https://github.com/redwoodjs/redwood/pulls" class="hover:underline">Repo</a></h2>

### [yarn redwood destroy (#487)](https://github.com/redwoodjs/redwood/pull/487)
<span id="poi">Anton Moiseev</span> <span id="tag">cli</span> <span id="tag">generator</span>

Scaffold's are getting their evil twin: `destroy`. Pretty soon you'll be able to destroy what you generated&mdash;just so you can generate it again of course!

### [Upgrade with Options (#560)](https://github.com/redwoodjs/redwood/pull/560)
<span id="poi">David Price</span> <span id="tag">cli</span>

With the `--tag` option, you can now use `yarn rw upgrade` to upgrade to either of Redwood's bleeding-edge releases: `canary` and `rc`.

### [makeMergedSchema Gets a Makeover (#592)](https://github.com/redwoodjs/redwood/pull/592) 
<span id="poi">Mark Pollmann</span> <span id="tag">api</span> <span id="tag">typescript</span>

With this PR, an important part of RedwoodJS's API package, makeMergedSchema, is well on it's way to TypeScript. Did you know we plan to convert it all to TypeScript? 

### [Typing @redwoodjs/cli: helpers and src/lib (#557)](https://github.com/redwoodjs/redwood/pull/557)
<span id="poi">Mark Pollmann</span> <span id="tag">cli</span> <span id="tag">typescript</span>

After this one's merged, we can check one box off subtracking issue [#523](https://github.com/redwoodjs/redwood/issues/523). Yes, that's a subtracking issue. And, if you're all about TypeScript, the perfect place to get started!

### [Typescript landing in services and sdl (#515)](https://github.com/redwoodjs/redwood/pull/515)
<span id="poi">Justin Reidy</span>  <span id="tag">cli</span> <span id="tag">typescript</span>

Say goodbye to even more boilerplate with the `--typescript` flag this PR proposes. Once this gets merged, you'll be able to tell your generators to make your sdl and services TypeScript right off the bat.

### [&lt;InputField&gt;&mdash;the generic typeless input component (#590)](https://github.com/redwoodjs/redwood/pull/590)
<span id="poi">Guilherme Pacheco</span> <span id="tag">forms</span>

Ever wanted to change the type of one of Redwood's input fields, but just didn't feel right about it since it was explicitly named after its type? The generic, aptly-named input field `<InputField>`'s for you, where setting the type is exactly what's expected. 

<br/>

---

<br/>

<div class="flex flex-col items-center"><blockquote class="twitter-tweet"><p lang="en" dir="ltr">Increasingly excited to give <a href="https://twitter.com/redwoodjs?ref_src=twsrc%5Etfw">@redwoodjs</a> a try. Thanks for the stickers 🤗 <a href="https://t.co/jq13MQ4GFt">pic.twitter.com/jq13MQ4GFt</a></p>&mdash; Colby Fayock (@colbyfayock) <a href="https://twitter.com/colbyfayock/status/1243583725134364673?ref_src=twsrc%5Etfw">March 27, 2020</a></blockquote>
<!-- https://twitter.com/colbyfayock/status/1243583725134364673  -->

<a href="/stickers.html" class="hover:underline text-red-700">
  <h2 class="text-red-700 font-semibold text-xl">Want some stickers?</h2>
</a>
 
<!-- <img src="/images/stickers.png" alt="Redwood stickers" class="max-w-sm border-none" /> -->

</div><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

<!-- ## Archive -->

<!-- ### WAPI

Podcast

@mojombo and @thedavidprice discuss what the new full-stack @RedwoodJS framework is meant to do and the philosophy around creating it. Listen to the latest!  -->

<!-- ARCHIVE -->

<!-- <span class="bg-red-700 text-white px-1 py-half rounded text-sm font-semibold">Conference</span>
<span class="bg-white text-red-700 border border-red-300 px-1 py-half rounded text-sm font-semibold">Conference</span> -->

<!-- https://twitter.com/St3f4NS/status/1252966199526395904 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Look what i got in the mail today! <a href="https://twitter.com/redwoodjs?ref_src=twsrc%5Etfw">@redwoodjs</a> thanks!<br>Now i gotta build something. <a href="https://t.co/ElmxP7oJDh">pic.twitter.com/ElmxP7oJDh</a></p>&mdash; Stefan Stankovic (@St3f4NS) <a href="https://twitter.com/St3f4NS/status/1252966199526395904?ref_src=twsrc%5Etfw">April 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

https://twitter.com/studio_hungry/status/1253660091250880512 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Got my <a href="https://twitter.com/redwoodjs?ref_src=twsrc%5Etfw">@redwoodjs</a> stickers today! 🤗 Thank you! 😊 <a href="https://t.co/kbkOBKc5tV">pic.twitter.com/kbkOBKc5tV</a></p>&mdash; Richard Haines (@studio_hungry) <a href="https://twitter.com/studio_hungry/status/1253660091250880512?ref_src=twsrc%5Etfw">April 24, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

https://twitter.com/3cordguy/status/1260234460718653440 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Got my <a href="https://twitter.com/redwoodjs?ref_src=twsrc%5Etfw">@redwoodjs</a> stickers! Thanks so much Redwood folks! Can’t wait to add these to my lappy. <a href="https://t.co/C6TnVGs1xT">pic.twitter.com/C6TnVGs1xT</a></p>&mdash; Josh Weaver (@3cordguy) <a href="https://twitter.com/3cordguy/status/1260234460718653440?ref_src=twsrc%5Etfw">May 12, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> -->
