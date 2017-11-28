const gulp = require('gulp');
const gls = require('gulp-live-server');
const ts = require('gulp-typescript');
const JSON_FILES = ['src/*.json', 'src/**/*.json'];
const JS_FILES = ['src/*.js', 'src/**/*.js'];

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
    gulp.watch('src/**/*.ts', ['scripts']);
    gulp.watch('src/**/*.js', ['js']);
});

gulp.task('assets', function () {
    return gulp.src(JSON_FILES).pipe(gulp.dest('dist'));
});

gulp.task('js', function () {
    return gulp.src(JS_FILES).pipe(gulp.dest('dist'));
});

gulp.task('default', ['watch', 'assets', 'js']);
gulp.task('build', ['scripts', 'assets', 'js']);

gulp.task('serve', ['build', 'watch'], function () {
    var server = gls.new('./dist/index.js');
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop) 
    gulp.watch(['dist/**/*.js', 'dist/**/*.json'], function (file) {
        console.log('File changed: ' + file);
        server.stop();
        server.start();
    });
});