var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var sourcemaps = require('gulp-sourcemaps');

gulp.task("dev", function() {
    gulp
      .src('src/init.sql')
      .pipe(gulp.dest('lib'));

    return gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("lib"));
});

gulp.task("prod", function() {
    gulp
      .src('src/init.sql')
      .pipe(gulp.dest('lib'));

    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest("lib"));
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["dev"]);
});


