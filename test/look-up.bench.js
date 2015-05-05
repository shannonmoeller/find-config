var lookup = require('look-up'),
	path = require('path'),
	options = {
		cwd: path.join(__dirname, 'fixtures/a/b'),
		braces: true,
		matchBase: true
	};

module.exports = function () {
	return lookup('.{,config/}waldo', options);
};
