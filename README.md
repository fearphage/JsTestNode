## JasmineDriver

A JsTestDriver with Jasmine, using Node.js instead Java.

Consists of two parts, the Node.js app and the bash script.

### Node.js app

The node app can be used both as a server...

    # Launch server on port 7357
    node jd.js 7357

... and to run the tests.

    # Launch tests using config
    node jd.js tests/config.ini
    # Launch tests using command line options
    node jd.js --host localhost --port 7357 --load scripts/*.js tests/*.js --skip scripts/experiment.js

It requires you to have the `jd.js` file in your project directory, otherwise
you need to use the full path to it (it's located in node's lib folder).

The config file path will be used as a base path for files mentioned in the
config file.

### Bash script

The bash script is used to run tests only, it cannot be used as a server.
It was made so that a developer doesn't need to install node to send the tests
out to the server. You still need to have access to a test server though.
Putting it in your project folder or your /usr/local/bin folder will make it
easier to use.

The bash script only works with a config file.

    # Launch tests using config
    jd tests/config.ini

The config file path will be used as a base path for files mentioned in the
config file.