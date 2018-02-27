const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const stylus = require('gulp-stylus')

gulp.task('server', ['stylus'], () => {
  browserSync.init({
    server: './'
  })

  gulp.watch('./css/*.styl', ['stylus'])
  gulp.watch(['./*.html', './js/*.js']).on('change', browserSync.reload)
})

gulp.task('stylus', () => {
  return gulp.src('./css/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('default', ['server'])
