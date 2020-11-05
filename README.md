REST API Template
-----------------

What is included:

* Working REST API with two CRUD services as example (/api/users, /api/heroes); storing data in MongoDb
* Using Express for REST API, mongoose for MongoDB access
* ES6 with Babel 7
* Build with Gulp
* Application logs with debug-level
* REST logs with winston, morgan
* Precommit hooks running lint cases

Running the application for local development
---------------------------------------------

1. Launch MongoDB database. You need to have MongoDB running.
2. Start the application

```
npm install (first time)
npm start
```

Logging
-------

If you receive an error during development, which isn't logged properly, you can turn on debug logging to get more logs, for example:

```
DEBUG=my-app:* npm start
```

Project configuration for multiple environments
-----------------------------------------------

The project is set up so that it allows configuration for different environments.
This is done using the following files and directories:

* config/env/development.js

  Used when you execute *npm start*. It should be configured for local developer environment.

* config/env/test.js

  Used during the test execution with *npm run test*. They should be configured to a different database (schema) then development settings.

* config/env/staging.js

  Used when executed in a staging environment.

* config/env/production.js

  Used when executed in a production environment.

* bitbucket-pipelines.yml

  Bitbucket CI/CD pipelines file.

* ecosystem.config.js

  PM2 configuration file
