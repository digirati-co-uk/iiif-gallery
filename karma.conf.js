var webpackConfig = require('./webpack.config.js');
module.exports = function(config) {
  config.set({

    // Add any browsers here
    browsers: ['Chrome'],
    frameworks: ['jasmine'],

    // The entry point for our test suite
    basePath: 'src',
    autoWatch: true,
    files: ['webpack.tests.js'],
    preprocessors: {
      // Run this through webpack
      'webpack.tests.js': ['webpack']
    },

    webpack: webpackConfig,
    client: {
      // log console output in our test console
      captureConsole: true
    },

    reporters: ['dots'],
    singleRun: false, // exit after tests have completed

    webpackMiddleware: {
      noInfo: true
    },

    // Webpack takes a little while to compile -- this manifests as a really
    // long load time while webpack blocks on serving the request.
    browserNoActivityTimeout: 60000 // 60 seconds

  });
};
