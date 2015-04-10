var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var plugins = require("gulp-load-plugins")({ lazy:false });
var isProduction = process.env.NODE_ENV === 'production';

gulp.task('scripts', function () {
    var bundler = browserify({
        debug: !isProduction,
        fullPaths: !isProduction
    });

    bundler.add('./app/app.js');

    if (isProduction) {
        bundler.plugin('minifyify', { map: false });
    }

    return bundler.bundle()
              .pipe(source(isProduction ? 'app.min.js' : 'app.js'))
              .pipe(gulp.dest('./build'));
});

gulp.task('vendorJS', function(){
    var bundler = browserify({
        debug: !isProduction,
        fullPaths: !isProduction
    });

    bundler.add('./app/lib.js');

    if (isProduction) {
        bundler.plugin('minifyify', { map: false });
    }

    return bundler.bundle()
              .pipe(source(isProduction ? 'vendor.min.js' : 'vendor.js'))
              .pipe(gulp.dest('./build'));
});

gulp.task('watch',function(){
    gulp.watch([
        'build/**/*.js'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    gulp.watch(['./app/**/*.js','!./app/**/*test.js'],['scripts']);
});

gulp.task('connect', function () {
  plugins.connect.server({
      root: ['build'],
      port: 9000,
      livereload: false
  })
});

gulp.task('default',['connect','scripts','vendorJS','watch']);

gulp.task('dist', ['scripts', 'vendorJS']);
