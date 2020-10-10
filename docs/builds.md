# Builds

## API

The api side of Redwood is transpiled by Babel into the `./api/dist` folder.

### steps on Netlify

To emulate Netlify's build steps locally:

```bash
yarn rw build api
cd api
yarn zip-it-and-ship-it dist/functions/ zipballs/
```

Each lambda function in `./api/dist/functions` is parsed by zip-it-and-ship-it resulting in a zip file per lambda function that contains all the dependencies required for that lambda function.
   
>Note: The `@netlify/zip-it-and-ship-it` package needs to be installed as a dev dependency in `api/`. Use the command `yarn workspace api add -D @netlify/zip-it-and-ship-it`.
>- You can learn more about the package [here](https://www.npmjs.com/package/@netlify/zip-it-and-ship-it). 
>- For more information on AWS Serverless Deploy see these [docs](https://redwoodjs.com/docs/deploy#aws-serverless-deploy).

## Web

The web side of Redwood is packaged by Webpack into the `./web/dist` folder.
