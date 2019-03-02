var { src, dest, watch } = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

function dev() {
    src('src/init.sql')
        .pipe(dest('lib'));

    return src('src/**/*.ts', { sourcemaps: true })
        .pipe(tsProject())
        .pipe(dest("lib", { sourcemaps: true }));
};

function prod() {
    src('src/init.sql')
        .pipe(dest('lib'));

    return src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(dest("lib"));
};

function watchSrc() {
    dev();
    watch("./src/**/*.ts", dev);
}

exports.watch = watchSrc;
exports.prod = prod;