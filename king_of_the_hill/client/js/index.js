/**
 * NodeJS Loader interface for client code.
 * Uses requirejs to load code from the client/js directory.
 */
var path      = require('path')
  , requirejs = require('requirejs');

/**
 * Load client js files using requirejs
 */

// Load jamjs configuration
var config = require('./jamjs/require.config');

// Set baseUrl
config.baseUrl = path.join(__dirname, '..');

// Configure requirejs
requirejs.config(config);

// Export loader
module.exports = {
  require : requirejs
};