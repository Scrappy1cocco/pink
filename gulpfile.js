"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var pug = require("gulp-pug");
var cssnano = require("gulp-cssnano");
var imagemin = require("gulp-imagemin");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var del = require("del");
const webpack = require("webpack-stream");

gulp.task('pug', function buildHTML() {
    return gulp.src('pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({
    // Your options in here.
    }))    
    .pipe(gulp.dest("src"))
    .pipe(gulp.dest("public"))
});

gulp.task("style", function() {
    gulp.src(["src/sass/style.scss"])
    	.pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
	      autoprefixer({
	        browsers: [
	        "last 1 version",
	        "last 2 Chrome versions",
	        "last 2 Firefox versions",
	        "last 2 Opera versions",
	        "last 2 Edge versions"
	      ]})
	    ]))
	    .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest("src/css"))
        .pipe(gulp.dest("public/css"))
        .pipe(server.reload({stream: true}));
});

gulp.task("fonts", function() {
  return gulp.src(["src/fonts/*.woff", "src/fonts/*.woff2"])
  .pipe(gulp.dest("public/fonts"))
});

gulp.task("vect", function() {
  return gulp.src(["src/img/svg/**/*.svg"])
  .pipe(gulp.dest("public/img/svg"))
});

gulp.task("scripts", function() {
    return gulp.src("src/app.js")  
        .pipe(webpack( require('./webpack.config.js')))
        // .pipe(uglify()) // вызов плагина uglify - сжатие кода
        // .pipe(rename({ suffix: '.min' })) // вызов плагина rename - переименование файла с приставкой .min
        .pipe(gulp.dest("src/js"))
        // .pipe(gulp.dest("public/js")); // директория продакшена, т.е. куда сложить готовый файл
       });


gulp.task('imgs', function() {
    return gulp.src("src/img/*.+(jpg|jpeg|png|gif)")
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 3,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true
        }))
        .pipe(gulp.dest("public/img"))
});

gulp.task("symbols", function() {
    return gulp.src("src/img/svg/sprite/*.svg")
        .pipe(svgmin())
        .pipe(svgstore({
            imlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("src/img/svg"));
});

gulp.task("clean", function() {
  return del("public");
});

gulp.task("public", function(fn) {
  run(
  	"clean",
    "pug", 
    "style", 
    "scripts",
    "imgs",
    fn
  );
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: "src",
    notify: false,
    open: true,
    ui: false
  });

    gulp.watch("src/**/*.js", ["scripts"]);
    gulp.watch("src/sass/**/*.scss", ["style"]);
    gulp.watch("pug/**/*.pug", ["pug"]);
    gulp.watch("src/img/*.+(jpg|jpeg|png|gif)", ["imgs"]);
    gulp.watch(["src/*.html", "pug/*.pug", "pug/**/*.pug", "src/css/style.css", "src/**/*.js"]).on("change", server.reload);
});