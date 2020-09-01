# express-sentry-proxy

[express.js](http://expressjs.com/) Middleware that accepts Sentry requests and proxies them to an actual Sentry server

## What problem does this Library solve?
[Sentry](https://sentry.io/) is a service that captures Exceptions, both from backend as well as from frontend code. In order to capture Exceptions from frontend code, it must be included as a frontend library, either [raven-js](https://github.com/getsentry/sentry-javascript/tree/master/packages/raven-js) or the newer [@sentry/browser](https://github.com/getsentry/sentry-javascript/). The sentry frontend library sends Exceptions to a backend Sentry service.

If your application is being served via HTTPS, the backend Sentry service must also be served via HTTPS. If it is only accessible via HTTP, the Browser will block the requests and no Exceptions will be captured.

This library adds an endpoint to your express.js application that looks like the Sentry API and redirects calls to an actual Sentry server. That way, the browser can talk to your backend service via HTTPS and your backend service will talk to the Sentry service via HTTP.

## Sentry DSN
A Sentry DSN is a string that tells Sentry where to find a backend sentry Service. It looks like this:

    http://123abc456@sentry.host.com/99

In this example, `123abc456` is a a sentry key, `sentry.host.com` is the actual host and `99` is the Sentry Project ID.

You can obtain a Sentry DSN by logging into Sentry and creating a new Project.

In order to get your frontend to talk to this library, your DSN must be rewritten and the Hostname must be replaced with the hostname of your application. This library does this automatically and adds the rewritten Sentry DSN to your Express Request object.

## How to Use this Library

### Install the Library via your favorite package manager

### Load the middleware in your backend code

    const expressSentryProxy = require('express-sentry-proxy');

### Tell express to use the middleware.

Note that this snipped assumes your Sentry DSN is set in the environment variable `SENTRY_DSN`.
    
    const app = express();

    app.use(expressSentryProxy(process.env.SENTRY_DSN));

### Pass updated Sentry DSN to Frontend
You now need to configure your frontend code to use a different Sentry DSN, so it knows that it must send its request to your backend service instead of the actual sentry service. This library adds a variable called `SENTRY_DSN` to your Express request object.

Assuming you are using an express view engine, you can pass the Sentry DSN as a view variable to your frontend code:

    app.get('/', (req, res) => {
        res.render(
            'index',
            {
                SENTRY_DSN: req.SENTRY_DSN,
            }
        );
    );

### Configure Frontend
Follow the instructions of your Sentry Library. Below is an example using the (deprecated) `raven-js` library inside a handlebars template.

    <!doctype html>
    <html>
        <head>
    {{#if SENTRY_DSN}}
        <script src="///cdn.ravenjs.com/3.26.2/raven.min.js" crossorigin="anonymous"></script>
        <script type="text/javascript">
            window.SENTRY_DSN = '{{SENTRY_DSN}}';
            Raven.config(window.SENTRY_DSN).install();
        </script>
    {{/if}}

## Endpoints added to your Express Application
* This library adds a new POST Endpoint to your Express Application at `/api/:projectId/store`.
* The rewritten Sentry DSN is added to the Express Request Object as `SENTRY_DSN`.

## Development Setup
### With local npm
Install Dependencies
    
    npm install

Run Unit Tests

    npm test

### Without local npm
Install Dependencies

    docker run --rm -it -v$(pwd):/app:delegated -w/app node:12-alpine npm install

Run Unit Tests

    docker run --rm -it -v$(pwd):/app:delegated -w/app node:12-alpine npm test

## Notes
* This library is completely independent of the Sentry backend library `@sentry/node`, which is used to capture backend Exceptions.
