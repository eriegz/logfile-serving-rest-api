const logger = require('./logger');

Object.defineProperty(global, 'logger', {
  value: logger,
  writable: false, // Make it read-only
  enumerable: false, // Include when iterating over an object's keys
  configurable: false, // Prevent deletion or redefining
});
