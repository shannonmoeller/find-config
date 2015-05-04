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
	}
}

function resolveModule(filepath) {
	try {
		// Does X/file.ext exist?
		// Does X/file.ext/index.js exist?
		// Does X/file.ext/index.json exist?
		return require.resolve(filepath);
	}
	catch (err) {
		// Not the droid we're looking for.
	}
}

function resolve(filepath, options) {
	if (options.isModule) {
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
	filepath = resolve(path.join(cwd, options.dirname, options.dotless), options);

	if (filepath) {
		return filepath;
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
	options.dirname = options.dirname || '.config';
	options.filename = filename;
	options.dotless = filename;

	if (!options.keepDot) {
		options.dotless = filename
			.replace(/^\./, '');
	}

	return options;
}

/**
 * Attempts to find the path to a configuration file in the current directory
 * or any ancestor directory. Supports XDG-style directories by also looking
 * in `.config` subdirectories at each level.
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options
 * @param {String=} options.cwd Defaults to `process.cwd()`.
 * @param {String=} options.dirname Defaults to `.config`.
 * @param {Boolean} options.keepDot Whether to keep the leading dot in the filename for matches in a subdirectory.
 * @param {Boolean} options.isModule Whether to resolve paths as Node.js modules.
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
  Attempts to find and read a configuration file.
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options Same as `findConfig` options.
 * @return {?String}
 */
findConfig.read = function (filename, options) {
	filename = findConfig(filename, options);

	if (!filename) {
		return null;
	}

	return fs.readFileSync(filename, {
		encoding: options.encoding,
		flag: options.flag
	});
};

/**
 * Attempts to require a configuration file.
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options Same as `findConfig` options.
 * @return {?String}
 */
findConfig.require = function (filename, options) {
	filename = findConfig(filename, options);

	if (!filename) {
		return null;
	}

	return require(filename);
};

module.exports = findConfig;
