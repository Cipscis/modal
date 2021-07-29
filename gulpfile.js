'use strict';

import gulp from 'gulp';

//////////////////////
// Webpack bundling //
//////////////////////
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';

const jsSrcDir = 'docs/assets/js/src';

const buildJs = function () {
	return new Promise((resolve, reject) => {
		webpack(webpackConfig, (err, stats) => {
			if (err) {
				console.error(err);
				reject();
				return;
			} else if (stats.hasErrors()) {
				const error = new Error(stats.toString({ colors: true }));
				console.error(error);
				reject();
				return;
			} else {
				const statsString = stats.toString({
					chunks: false,
					colors: true,
				});
				console.log(statsString);
				resolve();
			}
		});
	});
};

const watchJs = function () {
	gulp.watch([
		'*.js',
		`${jsSrcDir}/**/*.js`,
	], buildJs);
};

//////////////////////
// SCSS Compilation //
//////////////////////
import sassInit from 'gulp-sass';

import dartSass from 'sass';
const sass = sassInit(dartSass);

const cssSrcDir = 'docs/assets/scss';
const cssOutputDir = 'docs/assets/css';

const buildSass = function () {
	return gulp.src(`${cssSrcDir}/**/*.scss`)
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp.dest(cssOutputDir));
};

const watchSass = function () {
	gulp.watch(`${cssSrcDir}/**/*.scss`, buildSass);
};

//////////////////
// Export tasks //
//////////////////
const build = gulp.parallel(buildSass, buildJs);
const watch = gulp.parallel(watchSass, watchJs);

export { build, watch };
export default gulp.series(build, watch);
