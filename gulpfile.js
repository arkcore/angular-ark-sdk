var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({lazy:false});

gulp.task('scripts', function(){
    //combine all js files of the app
    gulp.src(['./app/app.prefix','!./app/**/*_test.js','./app/app.js', './app/**/*.js', './app/app.suffix'])
        .pipe(plugins.concat('app.js'))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(gulp.dest('./build'));
});

gulp.task('templates',function(){
    //combine all template files of the app into a js file
    gulp.src(['!./app/index.html',
        './app/**/*.html'])
        .pipe(plugins.angularTemplatecache('templates.js',{standalone:true}))
        .pipe(gulp.dest('./build'));
});

gulp.task('css', function(){
    gulp.src('./app/**/*.css')
        .pipe(plugins.concat('app.css'))
        .pipe(gulp.dest('./build'));
});

gulp.task('vendorJS', function(){
    //concatenate vendor JS files
    gulp.src([
        './bower_components/angular/angular.js',
        './bower_components/lodash/dist/lodash.compat.min.js',
        './bower_components/restangular/dist/restangular.min.js'
        ])
        .pipe(plugins.concat('lib.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('vendorCSS', function(){
    //concatenate vendor CSS files
    gulp.src(['!./bower_components/**/*.min.css',
        './bower_components/**/*.css'])
        .pipe(plugins.concat('lib.css'))
        .pipe(gulp.dest('./build'));
});

gulp.task('copy-index', function() {
    gulp.src('./app/index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('watch',function(){
    gulp.watch([
        'build/**/*.html',
        'build/**/*.js',
        'build/**/*.css'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    gulp.watch(['./app/**/*.js','!./app/**/*test.js'],['scripts']);
    gulp.watch(['!./app/index.html','./app/**/*.html'],['templates']);
    gulp.watch('./app/**/*.css',['css']);
    gulp.watch('./app/index.html',['copy-index']);

});

gulp.task('connect', function () {
  plugins.connect.server({
      root: ['build'],
      port: 9000,
      livereload: false
  })
});

gulp.task('default',['connect','scripts','templates','css','copy-index','vendorJS','vendorCSS','watch']);
