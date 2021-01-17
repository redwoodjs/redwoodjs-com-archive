# Typescript

> TypeScript support is in development: The ability to use TypeScript is one of our main points of focus, check out our [TypeScript Project Board](https://github.com/redwoodjs/redwood/projects/2) to follow the progress.

Redwood does not use the TypeScript compiler; instead, we use babel, which strips out the types before transpiling them.

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

You should now have type definitions, you can rename your files from `.js` to `.ts`

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
  "include": ["src"]
}
```

You should now have type definitions, you can rename your files from `.js` to `.ts`, and the files that contain JSX to `.tsx`.

#### Getting types for `jest` in test files

If you're adding tests, you'll want to include the types for `jest` in your `tsconfig`.

```diff
-"types": []
+"types": ["jest"]
```

Currently, these are added to `node_modules` by `@redwoodjs/core` and the above approach should just work. If this is not the case, you can `npm i -D @types/jest` in the `web` folder and they will resolve.

If you have any problems please open an issue and let us know.
