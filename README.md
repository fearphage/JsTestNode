# JsTestNode

_Note: This is still under heavy development. Big changes may occur. Any help or
suggestions would be greatly appreciated. Please fork, improve and request a pull._

A [JsTestDriver](http://code.google.com/p/js-test-driver/) using Node.js
instead of Java.

The included test framework is Jasmine. More frameworks may be supported in the
future, but they would likely require a slight modification done to them.

Your development machine can execute the tests towards the server without
needing Node on that machine. There is a bash script available that sends off
your tests and displays the results without ever needing Node. You can
still choose to run your tests through Node (just like JsTestDriver lets you
run the tests through the same file that starts the server), the bash script is
optional.

If you are on Windows, you will need Cygwin to run Node.js to start a server
instance. And for the moment there are no Windows scripts or executables for
the "development machine only" scenario, but that will hopefully change soon.
You can still use the bash script inside Cygwin, as long as cURL is available.

## Set up a server

If a server already exists, you can skip these steps.

### 1. Install Node

[http://nodejs.org](http://nodejs.org)

### 2. Install NPM (Node Package Manager)

Every Node.js user should have it.

[http://npmjs.org](http://npmjs.org)

### 3. Install all the dependencies

Type into your console

    npm install socket.io
    npm install iniparser
	npm install uuid

### 4. Install JsTestNode

[Download](http://github.com/torvalamo/JsTestNode/downloads) and unpack to location of choice.

### 5. Start the server

Create a new file `start.sh` containing:

    #!/usr/bin/bash
    node /path/to/jstestnode.js $1

To start a server on port 7357 (see how it reads TEST? ;-), type into your console

    ./start.sh 7357

You now have a server up and running. Next time you want to start the server
you can just use that same command. 7357 is the default port, so you
don't even need to specify that if you want to use that port.

### 6. Add users (not yet implemented)

If the server is public, you would probably want to prevent any random person
from accessing it. The username and password applied both to running tests and
capturing browsers.
You can add users like so:

    node /path/to/jstestnode.js --add username password

    node /path/to/jstestnode.js --add username --email name@email.com

This command creates a new user and sends an email to that user containing his
password, using the given smtp server.

## Capture browsers

This assumes you have already setup an started a server instance (see above).
If you've already captured browsers, you can skip these steps.

### 1. Open your browser

Direct your browser to your test server's domain and port.

### 2. Capture the browser

There should be a button that says "Capture" on the page that just loaded.

After the test page loads, you can minimize the browser, because you don't need
to do anything else there.

### 3. Repeat for all browsers you want to run tests on

If you want to automate starting all these browsers, you can change your
`start.sh` to look something like this

    #!/usr/bin/bash
    node /path/to/jstestnode.js $1 /path/to/browser /some/other/browser

## Setup and run tests

So you've set up a server, you've captured some browsers, and now you're ready
to run your test suite on them.

If you have Node installed on your computer (and you've downloaded JsTestNode)
you can use that, or you can use the bash script (see below).

### Create a configuration file

If you just want to type in all the options on the command line every time, you can do that.
I would recommend creating a config file, though. This is how you do that.

Create a file in your `/tests` folder (or whatever you call it) called `tests.ini`.
You can have a separate ini file for each test suite if you have several in the same directory.

The ini file can look like this:

    [server]
    host=localhost
    port=7357					; optional, default is 7357
	user=anonymous				; optional, default is anonymous
	pass=						; optional, default is blank
    use=jasmine					; optional, default is jasmine
    
    [files]						; specify the load order
	link=http://code.jquery.com/jquery-latest.js	; link to external file
    load=scripts/init.js
    load=scripts/*.js
    load=tests/*.js
    skip=scripts/experiment.js	; you can skip files otherwise caught by the asterisk

### I have Node

If you don't have Node on your developer computer, you can use the bash script instead (see below).

Running your test using node itself is fairly straightforward once you've set everything up.

    node /path/to/jstestdriver.js --config tests/tests.ini

Note that the current working directory is one where the paths specified in the ini file make sense.
Node will use this directory as a base when looking for those paths, unless they are absolute.

You can also specify the options directly:

    node /path/to/jstestdriver.js --port 1234 --load scripts/*.js tests/*.js

You can even override single settings in the config file:

    node /path/to/jstestdriver.js --config tests/tests.ini --skip tests/temp.js

As you can see, this is a very tedious way to do it. It would be easier to create a bash file,
like we did in the server setup routine. That way you could just run that bash
script every time instead of typing all this out.

Note that the bash script talked about below is not the same script.

### I want to use the bash script

This bash script can be used on computers that don't have Node installed, but
are used for development (and so naturally you want a way to run your tests).

Remember you need to [install cURL](http://curl.haxx.se/download.html) if you don't already have it.

The file can be downloaded from _mytestsserver_:_7357_/tests.sh

It takes the same arguments as the node file above, for instance:

    ./tests.sh --config tests/tests.ini

### I am on Windows!

There will be a Windows executable in the future. It just doesn't exist now. If
anyone wants to write a Windows command line app from the bash script above,
feel free to add the source to the repo. I will compile it and add executables
to the download page.