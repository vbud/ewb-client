'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;

gulp.task('inject', ['styles', 'browserify'], function () {

  var injectStyles = gulp.src([
    paths.tmp + '/serve/{app,components}/**/*.css'
  ], { read: false });

  var injectScripts = gulp.src([
    paths.tmp + '/serve/app/**/*.js',
    '!' + paths.src + '/{app,components,services}/**/*.spec.js',
    '!' + paths.src + '/{app,components,services}/**/*.mock.js'
  ], { read: false });

  var injectOptions = {
    ignorePath: [paths.src, paths.tmp + '/serve'],
    addRootSlash: false
  };

  var wiredepOptions = {
    directory: 'bower_components'
  };

  return gulp.src(paths.src + '/*.html')
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(wiredep(wiredepOptions))
    .pipe(gulp.dest(paths.tmp + '/serve'));

});
