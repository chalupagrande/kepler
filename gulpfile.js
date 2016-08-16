var gulp = require('gulp');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber')

gulp.task('serve', ['compile'], function(){
  browserSync.init({
    server: {
      baseDir:'./'
    }
  })
  gulp.watch(['src/**/*.js', '**/*.html'] , ['compile'])
  gulp.watch(['src/**/*.js', '**/*.html']).on('change', browserSync.reload)
})

gulp.task('compile', function(){
  return gulp.src('src/**/*.js')
             .pipe(plumber())
             .pipe(babel({
               presets: ['es2015']
             }))
             // .pipe(plumber.stop())
             .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['serve'], function(){
})
