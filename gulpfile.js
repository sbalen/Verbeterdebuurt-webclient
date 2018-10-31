'use strict';
// If the app environment is not set, we default to development
var ENV = process.env.APP_ENV || 'development';

var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');
var fs = require('fs');
var config = require('./config.js');

var configureSetup  = {
    createModule: false,
    constants: {
        baseUrl: process.env.BASE_URL,
        apiVersion: process.env.API_VERSION,
    }
};

gulp.task('config', function() {
    fs.writeFileSync('./config.json',
        JSON.stringify(config[ENV]));
    gulp.src('config.json')
        .pipe(gulpNgConfig('vdbApp', configureSetup))
        .pipe(gulp.dest('js'));
});