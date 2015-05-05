'use strict';

var gulp = require('gulp'),
	paths = {
		gulp: './gulpfile.js',
		src: './index.js',
		test: './test/**/*.{e2e,spec}.js'
	};

gulp.task('default', ['test']);

gulp.task('bench', function (done) {
	var findConfig = require('./test/find-config.bench'),
		findup = require('./test/findup-sync.bench'),
		lookup = require('./test/look-up.bench'),
		Benchmark = require('benchmark'),
		suite = new Benchmark.Suite();

	console.log('find-config:', findConfig());
	console.log('findup-sync:', findup());
	console.log('look-up:    ', lookup());

	suite
		.add('find-config', findConfig)
		.add('findup-sync', findup)
		.add('look-up', lookup)
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.on('complete', function () {
			console.log('Fastest is ' + this.filter('fastest').pluck('name'));
			done();
		})
		.run({ async: true });
});

gulp.task('lint', function () {
	var eslint = require('gulp-eslint');

	return gulp
		.src([paths.gulp, paths.src, paths.test])
		.pipe(eslint())
		.pipe(eslint.format());
});

gulp.task('cover', function () {
	var istanbul = require('gulp-istanbul');

	return gulp
		.src(paths.src)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'cover'], function () {
	var istanbul = require('gulp-istanbul'),
		mocha = require('gulp-mocha');

	return gulp
		.src(paths.test)
		.pipe(mocha({ reporter: 'spec' }))
		.pipe(istanbul.writeReports());
});
