const clic = require("cli-color");
require("colors"); // used for some special colour effects below
const conf = {
  format: "{{timestamp}}".bold.cyan + " {{file}}:{{line}}".bold.blue + " {{message}}",
  dateformat: "yyyy-mm-dd - HH:MM:ss",
  filters: {
    // log:     clic.blue,
    trace: clic.magentaBright,
    debug: clic.cyanBright.bold.bgXterm(232),
    // info:   clic.greenBright,
    warn: clic.xterm(202),
    error: clic.red.bold
  },
  level: 3
};

module.exports = require("tracer").colorConsole(conf);