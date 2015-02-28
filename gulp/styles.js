'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {

  var sassOptions = {
    style: 'expanded',
    includePaths: ['/bower_components']
  };

  // get the paths of all the SASS files in the project, ignoring the special ones
  var injectFiles = gulp.src([
    paths.src + '/{app,components}/**/*.scss',
    '!' + paths.src + '/app/vendor.scss',
    '!' + paths.src + '/app/shared.scss',
    '!' + paths.src + '/app/index.scss'
  ], { read: false }).pipe($.debug({title: 'DEBUG: paths to inject'}));

  // custom transform to perform SASS injection of all the project's SASS files automatically, rather than having to create each @import manually
  var injectOptions = {
    transform: function(filePath) {
      // SASS files are in the app folder, so change paths to be relative to that folder
      // remove the 'src/app/' from the paths of SASS files nested within 'src/app/' 
      filePath = filePath.replace(paths.src + '/app/', '');
      // replace the 'src/components/' from the paths of SASS files nested within 'src/components/' with '../components' (relative to the app folder)
      filePath = filePath.replace(paths.src + '/components/', '../components/');
      return '@import \'' + filePath + '\';';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  var indexFilter = $.filter('index.scss');

  return gulp.src([
      paths.src + '/app/vendor.scss',
      paths.src + '/app/shared.scss',
      paths.src + '/app/index.scss',
    ])
    .pipe($.debug({title: 'DEBUG: styles sources'}))
    // filter to index.scss only for injection operation
    .pipe(indexFilter)
    .pipe($.debug({title: 'DEBUG: just index.scss'}))
    // inject the paths of all the SASS files into index.scss
    .pipe($.inject(injectFiles, injectOptions))
    // write the file with the injections
    .pipe(gulp.dest(paths.src + '/app'))
    // un-filter
    .pipe(indexFilter.restore())
    .pipe($.debug({title: 'DEBUG: restored styles sources'}))
    // run node-sass over all the SASS files
    .pipe($.sass(sassOptions))
    // prefix the CSS with browser prefixes (e.g. -moz-, -webkit-)
    .pipe($.autoprefixer())
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(gulp.dest(paths.tmp + '/serve/app/'));
});
