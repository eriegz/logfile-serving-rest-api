module.exports = {
  HTTP_PORT: 4000,
  HTTPS_PORT: 4443,
  VERSION: require("../package.json").version,
  SSL_CERT_PATH: "security/ssl/local/localhost-cert.crt",
  SSL_KEY_PATH: "security/ssl/local/localhost-key.pem",
  LOG_FILE_HOST_1: `http://localhost:6000`,
  LOG_FILE_HOST_2: `http://localhost:8000`,
};
