const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");

const config = require("./config");
const logger = require("./util/logger");

const versionController = require("./routes/versionController");

// Configure Express.js with our desired settings:
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Configure our SSL options for HTTPS communication:
const sslConfig = {
  cert: fs.readFileSync(config.SSL_CERT_PATH),
  key: fs.readFileSync(config.SSL_KEY_PATH)
};

// Wire up our various endpoints:
app.use("/api", versionController);

// Display a welcome message in the console once on startup:
console.log(require("./banner.js").green);
console.log("      - Version:     " + `${config.VERSION}`.yellow);
console.log("      - Environment: " + `${process.env.NODE_ENV}`.yellow);
console.log("      - HTTP port:   " + `${config.HTTP_PORT}`.yellow);
console.log("      - HTTPS port:  " + `${config.HTTPS_PORT}`.yellow);
console.log("\n");

// Lastly, start listening to both HTTP and HTTPS incoming traffic:
http.createServer(app).listen(config.HTTP_PORT, () => {
  logger.info("Server listening to HTTP traffic on port", config.HTTP_PORT);
});
https.createServer(sslConfig, app).listen(config.HTTPS_PORT, () => {
  logger.info("Server listening to HTTPS traffic on port", config.HTTPS_PORT);
});
