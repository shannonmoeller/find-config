/*eslint-env mocha */
'use strict';

var findConfig = require('../index'),
	expect = require('expect'),
	path = require('path'),
	nofile = 'find-config-3da35411-9d24-4dec-a7cb-3cb9416db670';

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

	it('should find files in a directory', function () {
		var options = { cwd: 'fixtures/a/b', dir: false };

		expect(findConfig('baz.txt', options)).toBe(null);
		expect(findConfig('a.txt', options)).toBe(path.resolve('fixtures/a.txt'));

		process.chdir('fixtures/a/b');
		options = { dir: false };

		expect(findConfig('baz.txt', options)).toBe(null);
		expect(findConfig('a.txt', options)).toBe(path.resolve('../../a.txt'));
	});

	it('should drop leading dots in .dir', function () {
		var options = { cwd: 'fixtures/a/b' };

		expect(findConfig('.fred', options)).toBe(null);
		expect(findConfig('.waldo', options)).toBe(path.resolve('fixtures/.config/waldo'));

		process.chdir('fixtures/a/b');

		expect(findConfig('.fred')).toBe(null);
		expect(findConfig('.waldo')).toBe(path.resolve('../../.config/waldo'));
	});

	it('should keep leading dots in .dir', function () {
		var options = { cwd: 'fixtures/a/b', keepDot: true };

		expect(findConfig('.fred', options)).toBe(path.resolve('fixtures/.config/.fred'));
		expect(findConfig('.waldo', options)).toBe(null);

		process.chdir('fixtures/a/b');
		options = { keepDot: true };

		expect(findConfig('.fred', options)).toBe(path.resolve('../../.config/.fred'));
		expect(findConfig('.waldo', options)).toBe(null);
	});

	it('should resolve modules', function () {
		var options = { cwd: 'fixtures/a/b', asModule: true };

		expect(findConfig('b', options)).toBe(path.resolve('fixtures/b.js'));
		expect(findConfig('baz', options)).toBe(path.resolve('fixtures/a/.config/baz.js'));

		process.chdir('fixtures/a/b');
		options = { asModule: true };

		expect(findConfig('b', options)).toBe(path.resolve('../../b.js'));
		expect(findConfig('baz', options)).toBe(path.resolve('../.config/baz.js'));
	});

	it('should not find non-existant files', function () {
		expect(findConfig()).toBe(null);
		expect(findConfig(null)).toBe(null);
		expect(findConfig(nofile)).toBe(null);
	});

	describe('read', function () {
		it('should read files', function () {
			var options = { cwd: 'fixtures/a/b' };

			expect(findConfig.read('foo.txt', options)).toBe('foo\n');
			expect(findConfig.read('baz.txt', options)).toBe('baz\n');
		});

		it('should not read non-existant files', function () {
			expect(findConfig.read()).toBe(null);
			expect(findConfig.read(null)).toBe(null);
			expect(findConfig.read(nofile)).toBe(null);
		});
	});

	describe('require', function () {
		it('should require files', function () {
			var options = { cwd: 'fixtures/a/b' };

			expect(findConfig.require('b', options)).toEqual({ a: 1 });
			expect(findConfig.require('baz', options)).toEqual({ b: 2 });
		});

		it('should not require non-existant files', function () {
			expect(findConfig.require()).toBe(null);
			expect(findConfig.require(null)).toBe(null);
			expect(findConfig.require(nofile)).toBe(null);
		});
	});
});
