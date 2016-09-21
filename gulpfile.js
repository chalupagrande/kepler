var gulp = require('gulp');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');

// gulp.task('serve', ['compile'], function(){
gulp.task('serve', function(){
  browserSync.init({
    server: {
      baseDir:'./'
    }
  })
  // gulp.watch(['src/**/*.js', '**/*.html'] , ['compile'])
  gulp.watch(['src/**/*.js', '**/*.html']).on('change', browserSync.reload)
})

gulp.task('compile', function(){
  return gulp.src(['src/**/*.js','*.html'])
             .pipe(plumber())
             .pipe(babel({
               presets: ['es2015']
             }))
             .pipe(plumber.stop())
             .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['serve'], function(){
})
