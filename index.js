'use strict';

var fs = require('fs'),
	path = require('path'),
	home = require('user-home'),

	DEFAULT_DIR = '.config',
	DEFAULT_ENC = 'utf8',
	LEADING_DOT = /^\./,
	PATH_SEP = path.sep;

function resolveFile(filepath) {
	// Does X/file.ext exist?
	return fs.statSync(filepath) && filepath;
}

function resolveModule(filepath) {
	// Does X/file.ext exist?
	// Does X/file.ext.js exist?
	// Does X/file.ext/index.js exist?
	return require.resolve(filepath);
}

/**
 * Finds the first matching config file, if any, in the current directory,
 * nearest ancestor, or user's home directory. Supports finding files within a
 * subdirectory of an ancestor directory. Configurable with defaults set to
 * support the [XDG Base Directory Specification][xdg] for configuration files.
 *
 * [xdg]: http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object=} options
 * @param {String=} options.cwd (Default: `process.cwd()`)
 * @param {String=} options.dir (Default: `'.config'`)
 * @param {Boolean=} options.dot Whether to keep the leading dot in the filename in `dir`. (Default: `false`)
 * @param {Boolean=} options.home Whether to also check the user's home directory. (Default: `true`)
 * @param {Boolean=} options.module Whether to use Node.js module resolution. (Default: `false`)
 * @return {?String}
 */
function findConfig(filename, options) {
	if (!filename) return null;

	options = options || {};

	var filepath,

		// What subdir?
		dir = options.dir != null
			? options.dir
			: DEFAULT_DIR,

		// Keep leading dot in filename?
		dotless = options.dot
			? filename
			: filename.replace(LEADING_DOT, ''),

		// File or module?
		resolve = options.module
			? resolveModule
			: resolveFile,

		// Chunk path.
		cwd = path.resolve(options.cwd || '.').split(PATH_SEP),
		i = cwd.length;

	function test(x) {
		// Does X/file.ext exist?
		try { return resolve(path.join(x, filename)); }
		catch (e) {}

		// Does X/.dir/file.ext exist?
		try { return resolve(path.join(x, dir, dotless)); }
		catch (e) {}
	}

	// Walk up path.
	while (i--) {
		filepath = test(cwd.join(PATH_SEP));

		// istanbul ignore next
		if (filepath) return filepath;

		// Change X to parent.
		cwd.pop();
	}

	// Check in home.
	if (options.home || options.home == null) {
		filepath = test(home);

		// istanbul ignore next
		if (filepath) return filepath;
	}

	return null;
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
	if (!filename) return null;

	options = options || {};

	var filepath = findConfig(filename, options);

	return filepath && fs.readFileSync(filepath, {
		encoding: options.encoding || DEFAULT_ENC,
		flag: options.flag
	});
};

/**
 * Finds and requires the first matching config file, if any. Implies `module` is `true`.
 *
 * @type {Function}
 * @param {String} filename
 * @param {Object} options Same as `findConfig` options.
 * @return {?String}
 */
findConfig.require = function (filename, options) {
	if (!filename) return null;

	options = options || {};
	options.module = true;

	var filepath = findConfig(filename, options);

	return filepath && require(filepath);
};

module.exports = findConfig;
