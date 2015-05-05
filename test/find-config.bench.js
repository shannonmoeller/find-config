var findConfig = require('../index'),
	path = require('path'),
	options = {
		cwd: path.join(__dirname, 'fixtures/a/b')
	};

module.exports = function () {
	return findConfig('.waldo', options);
};
