# Typescript


> TypeScript support is in development: The ability to use TypeScript is one of our main points of focus, check out our [TypeScript Project Board](https://github.com/redwoodjs/redwood/projects/2) to follow the progress.

Redwood do not use the TypeScript compiler, we use babel which strips out the types before transpiling them.

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
    "typeRoots": ["../.redwood"]
  },
  "include": ["src"],
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
    "typeRoots": ["../.redwood"]
  },
  "include": ["src"],
}
```

You should now have type definitions, you can rename your files from `.js` to `.ts`, and the files that contain JSX to `.tsx`.

If you have any problems please open an issue and let us know.
