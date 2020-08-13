> This doc isn't meant to be published and is only an internal note to contributors.

Generally, there's a doc context rule--developing docs go on the website, contributing docs go on the repo. But since `@redwoodjs/router` can be used outside Redwood apps, we have to break this rule since it's not just about a Redwood user's experience anymore.

> Why design our packages so that they can work outside of Redwood apps too? Well, one of the reasons we made Redwood was to inject more integration into the JS ecosystem. And if we can accelerate this phenemenon, why wouldn't we?

So unless we want to face the perils of synchronizing changes across two docs in two places, the package's README kind of needs to have it all.

This is all to say that if you want to edit this doc (and thank you if you do!), use the following link to edit the Router package README in the `redwoodjs/redwood` repo and submit a PR there:
https://github.com/redwoodjs/redwood/blob/main/packages/router/README.md
