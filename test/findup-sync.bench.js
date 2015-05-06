var findup = require('findup-sync'),
	path = require('path'),
	cwd = path.join(__dirname, 'fixtures/a/b');

function test() {
	return findup('.{,config/}waldo', {
		cwd: cwd
	});
}

console.log(test());

module.exports = test;
