## Express.js API skeleton

* `gulpfile.js`: Simple build using babel with the command "gulp".  Builds to `build/` directory.
* `package.json`: Core packages; install with "npm install".
* `src/`: Source files
    * `server.js`: Very simply shell for the server.
    * `app.js`: Invokes `express.js` and `routes.js`; 
         instantiates the HTTP server.
    * `express.js`: Configures Express and plugs in middleware.
    * `routes.js`: Configures the routes for the endpoints.
    * `.eslintrc`: Additional eslint defaults for server sources.
    * `api/v1/`: Controllers for the endpoints.
    * `components/errors/`: Needless abstraction?
    * `lib/`: Library routines (logging via Winston).
* `Dockerfile`: Care to run under/within Docker?
* `package.json.docker`: Used by the Docker setup.
* `.babelrc`: Babel defaults.
* `.editorconfig`: Generic editor preferences.
* `.eslintrc`: Eslint preferences.
* `.gitignore`: Keep builds, `node_modules/`, etc. out of git.

## Installing

    npm install
    gulp
    
## Running

    NODE_ENV=production node build/index.js

or

    NODE_ENV=production npm start

## Running with Docker

    sudo docker build -t thurman:0.1-SNAPSHOT build
    sudo docker run -d -e NODE_ENV=development \
      -e LOG_LEVEL=debug \
      --name thurman --restart=always -p 80:9000 thurman:0.1-SNAPSHOT

The Docker setup here is a bit of a hack just meant as proof-of-concept.
Right now there's a shadow package.json.docker file which gets copied
to the `build/` directory.  It has the correct npm start command for
when running from within that directory.


