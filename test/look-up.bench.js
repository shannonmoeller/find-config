var lookup = require('look-up'),
	path = require('path'),
	cwd = path.join(__dirname, 'fixtures/a/b');

function test() {
	return lookup(['.waldo', '.config/waldo'], {
		cwd: cwd
	});
}

console.log(test());

module.exports = test;
