var types = {
    '.css'     : 'text/css',
    '.html'    : 'text/html',
    '.js'      : 'application/javascript',
    '.png'     : 'image/png'
}

exports.get = function(extension) {
	if (!extension) return 'text/plain';
	if (extension.substring(0, 1) != '.') extension = '.' + extension;
	if (!(extension in types)) return 'text/plain';
	return types[extension];
}