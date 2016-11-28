"use strict";
module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        files: [
            "index.js",
            "test/parse-variables.js",
            "test/parse-abstractions.js",
            "test/parse-applications.js",
        ],
        reporters: ['spec'],
        port: 9876,
        browsers: ['Chrome'],
        singleRun: true
    })
};
