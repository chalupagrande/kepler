var gulp = require('gulp');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');

// gulp.task('serve', ['compile'], function(){
gulp.task('serve', ['compile-sass', 'compile-js'], function(){
  browserSync.init({
    server: {
      baseDir:'./'
    }
  })
  gulp.watch(['src/kepler.js'] , ['compile-js'])
  gulp.watch(['src/**/*.scss'] , ['compile-sass'])
  gulp.watch(['src/**/*.js', '**/*.html', 'src/**/*.scss']).on('change', browserSync.reload)
})

gulp.task('compile-js', function(){
  return gulp.src(['src/**/*.js'])
             .pipe(plumber())
             .pipe(babel({
               presets: ['es2015']
             }))
             .pipe(plumber.stop())
             .pipe(gulp.dest('./dist'))
})


gulp.task('compile-sass', function(){
  return gulp.src(['src/scss/**/*.scss'])
            .pipe(plumber())
            .pipe(sass())
            .pipe(plumber.stop())
            .pipe(gulp.dest('./dist/css/'))
})

gulp.task('default', ['serve'])
