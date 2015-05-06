var findConfig = require('../index'),
	path = require('path'),
	cwd = path.join(__dirname, 'fixtures/a/b');

function test() {
	return findConfig('.waldo', {
		cwd: cwd
	});
}

console.log(test());

module.exports = test;
