# Typescript

> ⚠ **Work in Progress** ⚠️
>
> TypeScript support is in development. It's one of our main priorities. To follow our progress, check the [TypeScript Project Board](https://github.com/redwoodjs/redwood/projects/2).
>
> Want to contribute? Redwood welcomes contributions and loves helping people become contributors.
> You can edit this doc [here](https://github.com/redwoodjs/redwoodjs.com/blob/main/docs/typescript.md).
> If you have any questions, just ask for help! We're active on the [forums](https://community.redwoodjs.com/c/contributing/9) and on [discord](https://discord.com/channels/679514959968993311/747258086569541703).

Redwood doesn't use the TypeScript compiler; instead, we use Babel, which strips out the types before transpiling.

## Manual Setup

> This process will be automated in the future.

### API

Create a `./api/tsconfig.json` file:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "allowJs": true,
    "esModuleInterop": true,
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "src/*": ["./src/*"]
    },
    "typeRoots": ["../.redwood"],
    "types": []
  },
  "include": ["src"]
}
```

You should now have type definitions&mdash;you can rename your files from `.js` to `.ts`

### WEB

Create a `./web/tsconfig.json` file:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "allowJs": true,
    "esModuleInterop": true,
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "preserve",
    "baseUrl": "./",
    "paths": {
      "src/*": ["./src/*"]
    },
    "typeRoots": ["../.redwood"],
    "types": []
  },
  "include": ["src", "../.redwood/globals"]
}
```

You should now have type definitions&mdash;you can rename your files from `.js` to `.ts`, and the files that contain JSX to `.tsx`.

#### Getting types for `jest` in test files

If you're adding tests, you'll want to include the types for `jest` in your `tsconfig`.

```diff
-"types": []
+"types": ["jest"]
```

Currently, these are added to `node_modules` by `@redwoodjs/core` and the above approach should just work. If this isn't the case, you can `yarn add -D @types/jest` in the `web` folder.

If you have any problems, please open an issue and let us know!
