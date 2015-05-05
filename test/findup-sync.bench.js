var findup = require('findup-sync'),
	path = require('path'),
	options = {
		cwd: path.join(__dirname, 'fixtures/a/b')
	};

module.exports = function () {
	return findup('.{,config/}waldo', options);
};
