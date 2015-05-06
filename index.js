'use strict';

var fs = require('fs'),
	path = require('path'),

	DEFAULT_DIR = '.config',
	DEFAULT_ENC = 'utf8',
	LEADING_DOT = /^\./;

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
 * @param {String=} options.dir Defaults to `'.config'`.
 * @param {Boolean} options.keepDot Whether to keep the leading dot in the filename for matches in a subdirectory.
 * @param {Boolean} options.asModule Whether to resolve paths as Node.js modules.
 * @return {?String}
 */
function findConfig(filename, options) {
	if (!filename) return null;
	options = options || {};

	var current, filepath,

		// File or module?
		resolve = !options.asModule
			? resolveFile
			: resolveModule,

		// Keep leading dot in filename?
		dotless = !options.keepDot
			? filename.replace(LEADING_DOT, '')
			: filename,

		// What subdir?
		dir = options.dir != null
			? options.dir
			: DEFAULT_DIR,

		// Chunk path.
		sep = path.sep,
		cwd = path.resolve(options.cwd || '.').split(sep),
		i = cwd.length;

	while (i--) {
		current = cwd.join(sep);

		// Does X/file.ext exist?
		filepath = resolve(path.join(current, filename));
		if (filepath) return filepath;

		// Does X/.dir/file.ext exist?
		filepath = dir && resolve(path.join(current, dir, dotless));
		if (filepath) return filepath;

		// Change X to parent
		cwd.pop();
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
	filename = findConfig(filename, options);
	if (!filename) return null;

	return fs.readFileSync(filename, {
		encoding: options.encoding || DEFAULT_ENC,
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
	options = options || {};
	options.asModule = true;

	filename = findConfig(filename, options);
	if (!filename) return null;

	return require(filename);
};

module.exports = findConfig;
