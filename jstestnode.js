// Parse arguments
var args = {_:[]}, cur = null
for (var i = 2; i < process.argv.length; i++) {
	if (process.argv[i].substring(0, 2) == '--') {
		// Start of new option
		cur = argv[i].substring(2)
		args[cur] = []
	} else if (cur != null) {
		// Add more to current option
		args[cur].push(process.argv[i])
	} else {
		// Unnamed options (used for server startup)
		args._.push(process.argv[i])
	}
}

// No arguments or unnamed options means starting a server.
if (process.argv.length < 3 || args._.length) {
	require('./lib/server').start(args._)
}
// Otherwise we are a developer and want to run a test.
else {
	delete args._ // We don't want unnamed options
	require('./lib/runtest').run(args)
}