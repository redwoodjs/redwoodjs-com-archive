# Environment Variables

You can provide environment variables to each side of your Redwood project in different ways, depending on your target.

## API

### Development

On the API side with NodeJS as your target, you can access the environment variables defined in your `.env` and `.env.defaults` file and referencing them in your code as `process.env.MY_VAR_NAME`.

### Production

Your deployment system will need some way to make environment variables available to the serverless environment where your functions will run. For example on Netlify you can set them in the [Build environment variables](https://docs.netlify.com/configure-builds/environment-variables/) section of your Settings.

## Web

On the Web side, with webpack as your target, you can do one of three things:

1. Prefix your env vars with `REDWOOD_ENV_` —they will be available via `process.env.REDWOOD_ENV_MY_VAR_NAME` and will be dynamically replaced during the build phase. This means that `process.env.REDWOOD_ENV_SECRET_API_KEY` will be removed and replaced with the *actual* value of your API key, so that if someone inspected the source of your page they could see it in plain text. This is a limitation of delivering static Javascript and HTML files to the browser.

2. Whitelist them in your `redwood.toml`. For example:

    ```toml
    [web]
      includeEnvironmentVariables = ['API_KEY']
    ```
    These will also be substituted in your code as in the first option above.

3. Define them in your `.env` file. This will only work in the development environment and will either cause an error or fail silently in production, depending on where your ENV var is referenced.
