
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var vueify = require('vueify');

// depracated
//var reactify = require('reactify');

gulp.task('browser', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './js/site.js',
        debug: true,
    // defining transforms here will avoid crashing your stream
        transform: [reactify]
    });

    return browserify('./js/site.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./js/site-react.js'));
    });

gulp.task('old', function(){
    gulp.src('./js/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./js/'))
})

var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');

gulp.task('default-error', function () {
    var browserified = function(filename) {
        var b = browserify(filename).transform(babelify);
        return b.bundle().pipe(source()).pipe(buffer());
    };

    //return gulp.src(['./js/src/*.jsx'])
    return gulp.src(['./js/src/site.jsx'])
        .pipe(browserified)
        //.pipe(uglify())
        //.pipe(gulp.dest('./js/site-react.js'));
        .pipe(gulp.dest('.'));
});

gulp.task('react', function () {
    // when uglify used, react will alert use react production, which is
    // trigger by NODE_ENV
    //process.env.NODE_ENV = 'production';

    return browserify('./js/src/site.jsx') 
        .transform(babelify, {presets: ["react", 'es2015']})
        .bundle()
        .pipe(source('site-react.js'))
        .pipe(buffer())
        .pipe(uglify())
        //.pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest('./js/'));
});

gulp.task('default', function () {
    // when uglify used, react will alert use react production, which is
    // trigger by NODE_ENV
    //process.env.NODE_ENV = 'production';

    return browserify('./public/page/js/src/vue-site.js') 
        .transform(vueify)
        //.transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(source('vue-site.js'))
        .pipe(buffer())
        //.pipe(uglify())
        //.pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest('./public/page/js/'));
});
