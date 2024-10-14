// This file matches the "NODE_ENV" environment variable to the correct config file (case-sensitive). See the README.md
// for instructions on how to pass this value to the application.

const logger = require("../util/logger");

module.exports = (() => {
  if (process.env.NODE_ENV === undefined) {
    let errMsg = "Missing 'NODE_ENV' environment variable. Please see README.md file for how to run application.";
    logger.error(errMsg);
    throw new Error(errMsg);
  }

  const configFile = require(`./${process.env.NODE_ENV}.js`);
  return configFile;
})();
