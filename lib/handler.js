var multipart = require('multipart'),
	sys = require('sys'),
	path = require('path'),
	fs = require('fs');

var clients = {},
	browsers = {},
	tests = {}

function tell_browsers(uuid, res) {
    res.writeHeader(200, {'Content-Type': 'text/plain'});
    res.write('Files uploaded, running tests...');
	
	tests[uuid] = {
		response: res,
		results: [],
		total: {
			tests: 0,
			passed: 0,
			failed: 0,
			errors: 0,
			time: 0,
			browsers: {}
		}
	}
}

/**
 * Function stolen and rewritten from
 * http://www.componentix.com/blog/13
 */
function uploader(uuid, req, res) {
	req.setEncoding('binary')

    var stream = multipart.parser()
    stream.headers = req.headers
    req.on('data', stream.write)
    req.on('end', stream.close)

    var fileName = path.join(path.dirname(__dirname), 'files/tests', uuid + '.js')
    var fileStream = fs.createWriteStream(fileName)

    stream.onPartBegin = function(part) {
        sys.debug('Started part, name = ' + part.name + ', filename = ' + part.filename)
        fileStream.on('error', function(err) {
            sys.debug('Got error while writing to file "' + fileName + '": ', err)
        })
        fileStream.on('drain', req.resume)
    }

    stream.onData = function(chunk) {
        req.pause()
        fileStream.write(chunk, 'binary')
    }

    stream.onEnd = function() {
        fileStream.on('drain', function() {
            fileStream.end()
			tell_browsers(uuid, res)
        })
    }
}

exports.run = function(req, res) {
	var uuid = require('uuid').generate()
	sys.debug('New request ' + uuid + ' initialized')
	uploader(uuid, req, res)
}

function parseUserAgent(ua) {
	var browser = ua, version = '?'
	if (/Chrome/i.test(ua)) {
		browser = 'Chrome'
		var v = /Chrome\/([0-9\.]+)/i.exec(ua)
		version = v instanceof Array ? v[1] : '?'
	} else if (/MSIE/i.test(ua)) {
		browser = 'Internet Explorer'
		var v = /; MSIE ([0-9\.]+);/i.exec(ua)
		version = v instanceof Array ? v[1]: '?'
	} else {
		var b = /(Safari|Firefox|Konqueror|Opera)\/([0-9\.]+)/i.exec(ua)
		if (b instanceof Array) {
			browser = b[1]
			version = b[2]
			if (/Version\//i.test(ua)) {
				var v = /Version\/([0-9\.]+)/i.exec(ua)
				version = v instanceof Array ? v[1] : '?'
			}
		}
	}
	return [browser, version]
}

exports.connect = function(client) {
	sys.debug('Connected ' + client.sessionId)
	client.on('message', function(data) {try {
		sys.debug('Received: ' + JSON.stringify(data) + ' from ' + client.sessionId)
		if (data.get && data.get == 'overview') {
			// Index page
			var os = []
			for (var name in browsers) {
				for (var version in browsers[name]) {
					for (var osys in browsers[name][version]) {
						if (!~os.indexOf(osys)) os.push(osys)
					}
				}
			}
			client.send({ os: os, browsers: browsers })
		}
		if (data.agent && data.os) {
			// Parse agent
			var b = parseUserAgent(data.agent), bname = b[0], bversion = b[1]
			// Start capture
			sys.debug('Capturing ' + client.sessionId + ': ' + bname + ' ' + bversion + ' on ' + data.os)
			clients[client.sessionId.toString()] = {name: bname, version: bversion, os: data.os}
			sys.debug(JSON.stringify(clients))
			if (!(bname in browsers)) browsers[bname] = {}
			if (!(bversion in browsers[bname])) browsers[bname][bversion] = {}
			if (!(data.os in browsers[bname][bversion])) browsers[bname][bversion][data.os] = 0
			browsers[bname][bversion][data.os]++
			sys.debug(JSON.stringify(browsers))
		}
	}catch(_) {sys.debug(_.stack)}})
	client.on('disconnect', function() {
		if (client.sessionId.toString() in clients) {
			// If it's registered for capture we need to remove it from the registry
			var c = clients[client.sessionId.toString()]
			browsers[c.name][c.version][c.os]--
			if (!browsers[c.name][c.version][c.os]) delete browsers[c.name][c.version][c.os]
			var has_oses = false
			for (var os in browsers[c.name][c.version]) {
				has_oses = true
				break
			}
			if (!has_oses) delete browsers[c.name][c.version]
			var has_versions = false
			for (var version in browsers[c.name]) {
				has_versions = true
				break
			}
			if (!has_versions) delete browsers[c.name]
			delete clients[client.sessionId]
		}
	})
}