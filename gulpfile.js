/**
 * Settings
 *
 * Setup your project paths and requirements here
 */
var settings = {

	// path to main scss file
	scss: 'scss/styles.scss',

	// path to output css file
	css: 'css/styles.css',

	// path to watch for changed scss files
	scsswatch: 'scss/**/*.scss',

	// path to output css folder
	csspath: 'css/',

	// path to images
	imagespath: 'src/img/',
	imagesdistpath: 'assets/img/',

	// path to base
	basepath: './',

	// enable the static file server and browsersync
	// check for unused styles in static html? - seems buggy, requires html
	staticserver: false,
	checkunusedcss: false,

	// enable the proxied local server for browsersync
	// static above server must be disabled
	proxyserver: true,
	// proxylocation: 'wordcamp.w.dev'
	proxylocation: '2014.content.wordcamp.dev/'

};

/**
 * Load node modules
 */
var	gulp = require('gulp'),

	// Plugins
	autoprefixer = require('gulp-autoprefixer'),
	browsersync = require('browser-sync'),
	checkcss = require( 'gulp-check-unused-css' ),
	csscomb = require('gulp-csscomb'),
	filter = require('gulp-filter'),
	imagemin = require('gulp-imagemin'),
	install = require("gulp-install"),
	minifycss = require('gulp-minify-css'),
	parker = require('gulp-parker'),
	plumber = require('gulp-plumber'),
	sass = require('gulp-sass'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	sync = require('gulp-config-sync'),
	util = require('gulp-util'),
	watch = require('gulp-watch');

/**
 * Generic error handler used by plumber
 *
 * Display an OS notification and sound with error message
 */
var onError = function(err) {
	if ( err.lineNumber ) {
		util.log(util.colors.red('Error: (Line: '+err.lineNumber+') '+err.message));
	} else {
		util.log(util.colors.red('Error: '+err.message));
	}
	this.emit('end');
};

/**
 * Default Task
 *
 * Watch for changes and run tasks
 */
gulp.task('default', function() {

	// Install
	gulp.start('install');

	// Compile Styles on start
	gulp.start('styles');

	// Process Images on start
	gulp.start('images');

	// Browsersync and local server
	// Options: http://www.browsersync.io/docs/options/
	if (settings.staticserver) {
		browsersync({
			server: settings.basepath
		});

		// Check to see if the CSS is being used
		if (settings.checkunusedcss) {
			gulp.watch(settings.css, ['checkcss']);
		}
	}

	if (settings.proxyserver) {
		browsersync({
			proxy: settings.proxylocation
		});
	}

	// Watch for SCSS changes
	gulp.watch(settings.scsswatch, ['styles']);

	// Watch for image changes
	gulp.watch(settings.imagespath, ['images']);

	// Watch package.json for changes
	gulp.watch('./package.json', ['install']);

});

/**
 * Install Task
 * Ensure our packages are upto date
 */
gulp.task('install', function() {
	gulp.src(['./package.json'])
		.pipe( install() );
});

/**
 * Stylesheet Task
 *
 * SCSS -> CSS
 * Autoprefix
 * CSSComb
 * Sourcemaps
 * Minify
 * Report
 */
gulp.task('styles', function() {
	return gulp.src(settings.scss)
		.pipe(plumber({errorHandler: onError}))
		.pipe(sass({
			style: 'expanded',
			errLogToConsole: false
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer({ browsers: ['last 2 versions', 'ie 8', 'ie 9'], flexbox: false } ) )
		.pipe(csscomb())
		.pipe(sourcemaps.write('./'))
		.pipe(minifycss())
		.pipe(gulp.dest(settings.csspath))
		.pipe(filter('**/*.css'))
		.pipe(browsersync.reload({stream: true}))
		.pipe(parker());
});

/**
 * Images Task
 *
 * Run independantly when you want to optimise image assets
 */
gulp.task('images', function() {
	return gulp.src(settings.imagespath + '**/*.{gif,jpg,png}')
		.pipe(plumber({errorHandler: onError}))
		.pipe(imagemin({
			progressive: true,
			interlaced: true,
			//svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
		}))
		.pipe(gulp.dest(settings.imagesdistpath))
		.pipe(browsersync.reload({stream: true}));
});
