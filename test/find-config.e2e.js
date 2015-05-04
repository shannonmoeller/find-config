/*eslint-env mocha */
'use strict';

var findConfig = require('../index'),
	expect = require('expect'),
	path = require('path');

describe('require-glob e2e', function () {
	beforeEach(function () {
		process.chdir(__dirname);
	});

	it('should find files', function () {
		var options = { cwd: 'fixtures/a/b' };

		expect(findConfig('foo.txt', options)).toBe(path.resolve('fixtures/a/foo.txt'));
		expect(findConfig('bar.txt', options)).toBe(path.resolve('fixtures/a/b/bar.txt'));
		expect(findConfig('a.txt', options)).toBe(path.resolve('fixtures/a.txt'));

		process.chdir('fixtures/a/b');

		expect(findConfig('foo.txt')).toBe(path.resolve('../foo.txt'));
		expect(findConfig('bar.txt')).toBe(path.resolve('./bar.txt'));
		expect(findConfig('a.txt')).toBe(path.resolve('../../a.txt'));
	});

	it('should find files in a directory', function () {
		var options = { cwd: 'fixtures/a/b' };

		expect(findConfig('baz.txt', options)).toBe(path.resolve('fixtures/a/.config/baz.txt'));
		expect(findConfig('qux.txt', options)).toBe(path.resolve('fixtures/a/b/.config/qux.txt'));

		process.chdir('fixtures/a/b');

		expect(findConfig('baz.txt', options)).toBe(path.resolve('../.config/baz.txt'));
		expect(findConfig('qux.txt', options)).toBe(path.resolve('./.config/qux.txt'));
	});

	it('should drop leading dots in .config directories', function () {
		var options = { cwd: 'fixtures/a/b' };

		expect(findConfig('.fred', options)).toBe(null);
		expect(findConfig('.waldo', options)).toBe(path.resolve('fixtures/.config/waldo'));

		process.chdir('fixtures/a/b');

		expect(findConfig('.fred')).toBe(null);
		expect(findConfig('.waldo')).toBe(path.resolve('../../.config/waldo'));
	});

	it('should keep leading dots in .config directories', function () {
		var options = { cwd: 'fixtures/a/b', keepDot: true };

		expect(findConfig('.fred', options)).toBe(path.resolve('fixtures/.config/.fred'));
		expect(findConfig('.waldo', options)).toBe(null);

		process.chdir('fixtures/a/b');
		options = { keepDot: true };

		expect(findConfig('.fred', options)).toBe(path.resolve('../../.config/.fred'));
		expect(findConfig('.waldo', options)).toBe(null);
	});

	it('should resolve modules', function () {
		// todo
	});

	it('should not find non-existant files', function () {
		expect(findConfig()).toBe(null);
		expect(findConfig(null)).toBe(null);
		expect(findConfig('random-guid-3da35411-9d24-4dec-a7cb-3cb9416db670')).toBe(null);
	});
});
