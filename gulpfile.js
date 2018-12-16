var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var sourcemaps = require('gulp-sourcemaps');

gulp.task("default", function() {
    gulp
      .src('src/init.sql')
      .pipe(gulp.dest('dist'));

    return gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["default"]);
});


