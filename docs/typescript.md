# Typescript

> ⚠ **Work in Progress** ⚠️
>
> Full TypeScript support is nearly there! It's one of our main priorities. To follow our progress, check the [TypeScript Project Board](https://github.com/redwoodjs/redwood/projects/2).
>
> Want to contribute? Redwood welcomes contributions and loves helping people become contributors.
> You can edit this doc [here](https://github.com/redwoodjs/redwoodjs.com/blob/main/docs/typescript.md).
> If you have any questions, just ask for help! We're active on the [forums](https://community.redwoodjs.com/c/contributing/9) and on [discord](https://discord.com/channels/679514959968993311/747258086569541703).

Redwood doesn't use the TypeScript compiler; instead, we use Babel, which strips out the types before transpiling.

## Starting a TypeScript Redwood project
You can use the `--typescript` flag on create-redwood-app to generate a project with TypeScript configured
```shell
yarn create redwood-app --typescript /PATH/TO/FOLDER
```

## Automatic Setup
If you already have a Redwood app, but want to configure it for TypeScript, you can use our setup command

```
yarn rw setup tsconfig
```
Remember you don't _need_ to convert all your files to TypeScript, you can always do it incrementally. Start by renaming your files from `.js` to `.ts` or `.tsx`


## Sharing Types between sides
For your shared types we need to do a few things:

1. Put your shared types at the root of the project (makes sense right?), maybe in `types` at the root
2. You can call this folder whatever you like, of course, just add the same folder to your includes
3. Modify your `web/tsconfig.json` and `api/tsconfig.json` by adding this to your includes:

```diff
"include": [
"src",
"../.redwood/**/*",
+"../types"
]
```

4. Restart TS server in vscode. And your new types should now be available on both web and api sides!


## Types in Jest Files

If you're adding tests, you'll want to include the types for `jest` in your `tsconfig`.

```diff
-"types": []
+"types": ["jest"]
```

Currently, these are added to `node_modules` by `@redwoodjs/core` and the above approach should just work. If this isn't the case, you can `yarn add -D @types/jest` in the `web` folder.

## Manual Setup

This is what the setup command does for you

### API

1. Create a `./api/tsconfig.json` file:

```shell
touch api/tsconfig.json
```

2. Now copy and paste the latest config from the Redwood template: [`api/tsconfig.json`](https://github.com/redwoodjs/redwood/blob/main/packages/create-redwood-app/template/api/tsconfig.json) into the empty file

### WEB

1. Create a `./api/tsconfig.json` file:

```shell
touch web/tsconfig.json
```

2. Now copy and paste the latest config from the Redwood template: [`web/tsconfig.json`](https://github.com/redwoodjs/redwood/blob/main/packages/create-redwood-app/template/web/tsconfig.json) into the empty file


You should now have type definitions&mdash;you can rename your files from `.js` to `.ts`, and the files that contain JSX to `.tsx`.


If you have any problems, please open an issue and let us know!
