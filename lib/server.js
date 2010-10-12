var io   = require('socket.io'),
	http = require('http'),
	path = require('path'),
	url  = require('url'),
	fs   = require('fs'),
	mime = require('./mime')

function error(code, res) {
	res.writeHead(code)
	res.end()
}

function output(file, res) {
	fs.readFile(file, 'binary', function(err, data) {
		if (err) {
			error(500, res)
			return
		}
		res.writeHead(200, {
			'Content-Type': mime.get(path.extname(file))
		})
		res.end(data, 'binary')
	})
}

exports.start = function(args) {
	port = isNaN(args[0]) ? 7357 : +args[0]
	
	// Clear out tests dirs
	// TODO
	
	var server = http.createServer(function(req, res) {
		if (req.method != 'GET') {
			if (req.method == 'POST') {
				// Assumed upload
				require('./handler').run(req, res)
				return
			}
			error(405, res)
			return
		}
		var uri = url.parse(req.url)
		var file = path.join(path.join(path.dirname(__dirname), 'files'), uri.pathname)
		path.exists(file, function(exists) {
			if (!exists) {
				error(404, res)
				return
			}
			fs.stat(file, function(err, stats) {
				if (err) {
					error(500, res)
					return
				}
				if (!stats.isDirectory() && !stats.isFile()) {
					error(404, res)
					return
				}
				if (stats.isDirectory()) {
					fs.readdir(file, function(err, files) {
						if (err) {
							error(500, res)
							return
						}
						if (!~files.indexOf('index.html')) {
							error(403, res)
							return
						}
						file = path.join(file, 'index.html')
						output(file, res)
					})
				} else output(file, res)
			})
		})
	})
	
	server.listen(port)

	var socket = require('socket.io').listen(server, {
		log: function() {},
		transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']
	} )
	socket.on('connection', function(client) {
		require('./handler').connect(client)
	})
	
	// Start browsers if specified
	for (var i = 0; i < args.length; i++) {
		if (isNaN(args[i])) {
			require('path').exists(args[i], function(exists) {
				if (!exists) return
				require('child_process').exec('cmd /c start ' + args[i] + ' http://localhost:' + port + '/capture', function (error, stdout, stderr) {
					if (error) {
						console.log('exec error: ' + error)
						return
					}
					sys.pump(stderr, process.stdout)
				})
			})
		}
	}
}