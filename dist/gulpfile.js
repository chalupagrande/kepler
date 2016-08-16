'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');

gulp.task('serve', ['compile'], function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch(['*js']).on('change', browserSync.reload);
});

gulp.task('compile', function () {
  return gulp.src('*.js').pipe(babel({
    presets: ['es2015']
  })).pipe(gulp.dest('./dist'));
});

gulp.task('default', ['serve'], function () {});