'use strict';

var fs = require('fs'),
	path = require('path');

function resolveFile(filepath) {
	try {
		// Does X/file.ext exist?
		return fs.statSync(filepath).isFile() && filepath;
	}
	catch (err) {
		// Not the droid we're looking for.
		return false;
	}
}

function resolveModule(filepath) {
	try {
		// Does X/file.ext exist?
		// Does X/file.ext.js exist?
		// Does X/file.ext/index.js exist?
		return require.resolve(filepath);
	}
	catch (err) {
		// Not the droid we're looking for.
		return false;
	}
}

function resolve(filepath, options) {
	if (options.asModule) {
		return resolveModule(filepath);
	}

	return resolveFile(filepath);
}

function lookup(options) {
	var filepath, parent,
		cwd = options.cwd;

	// Does X/file.ext exist?
	filepath = resolve(path.join(cwd, options.filename), options);

	if (filepath) {
		return filepath;
	}

	// Does X/.dir/file.ext exist?
	if (options.dir) {
		filepath = resolve(path.join(cwd, options.dir, options.dotless), options);

		if (filepath) {
			return filepath;
		}
	}

	// Does X have a parent directory?
	parent = path.dirname(cwd);

	if (parent === cwd) {
		return null;
	}

	// Ascend and repeat.
	options.cwd = parent;

	return lookup(options);
}

function normalizeOptions(filename, options) {
	filename = filename || '';
	options = Object.create(options || {});

	options.cwd = path.resolve(options.cwd || process.cwd());
	options.filename = filename;
	options.dotless = filename;

	if (options.dir == null) {
		options.dir = '.config';
	}

	if (options.keepDot !== true) {
		options.dotless = filename
			.replace(/^\./, '');
	}

	return options;
}

/**
 * Finds the first matching config file, if any, in the current directory or the
 * nearest ancestor directory. Supports finding files within a subdirectroy of
 * an ancestor directory. Configurable with defaults set to support the
 * [XDG Base Directory Specification][xdg] for configuration files.
 *
 * [xdg]: http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options
 * @param {String=} options.cwd Defaults to `process.cwd()`.
 * @param {String=} options.dir Defaults to `.config`.
 * @param {Boolean} options.keepDot Whether to keep the leading dot in the filename for matches in a subdirectory.
 * @param {Boolean} options.asModule Whether to resolve paths as Node.js modules.
 * @return {?String}
 */
function findConfig(filename, options) {
	options = normalizeOptions(filename, options);

	if (!options.filename) {
		return null;
	}

	return lookup(options);
}

/**
 * Finds and reads the first matching config file, if any.
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options Same as `findConfig` options.
 * @param {String} encoding Defaults to `'utf8'`.
 * @param {String} flag Defaults to `'r'`.
 * @return {?String}
 */
findConfig.read = function (filename, options) {
	filename = findConfig(filename, options);

	if (!filename) {
		return null;
	}

	return fs.readFileSync(filename, {
		encoding: options.encoding || 'utf8',
		flag: options.flag
	});
};

/**
 * Finds and requires the first matching config file, if any. Implies `asModule` is `true`.
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options Same as `findConfig` options.
 * @return {?String}
 */
findConfig.require = function (filename, options) {
	options = normalizeOptions(filename, options);
	options.asModule = true;

	filename = findConfig(filename, options);

	if (!filename) {
		return null;
	}

	return require(filename);
};

module.exports = findConfig;
